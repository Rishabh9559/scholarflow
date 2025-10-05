const User = require('../models/User');
const PendingUser = require('../models/PendingUser');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { transporter } = require('../config/emailConfig');

// Generate random password
const generateRandomPassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: {
      name: 'ScholarFlow',
      address: process.env.GMAIL_USER
    },
    to: email,
    subject: 'Email Verification - ScholarFlow',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .container {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            border-radius: 10px;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 32px;
            margin-bottom: 10px;
          }
          h1 {
            color: #667eea;
            margin: 0;
            font-size: 24px;
          }
          .otp-box {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            margin: 30px 0;
            border-radius: 10px;
            text-align: center;
          }
          .otp {
            font-size: 48px;
            font-weight: bold;
            color: white;
            letter-spacing: 10px;
            font-family: 'Courier New', monospace;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          }
          .warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6c757d;
            font-size: 14px;
          }
          .info-box {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            <div class="header">
              <div class="logo">📚</div>
              <h1>Verify Your Email</h1>
            </div>
            
            <p>Hello <strong>${name}</strong>,</p>
            
            <p>Welcome to <strong>ScholarFlow</strong>! To complete your registration, please verify your email address by entering the OTP code below:</p>
            
            <div class="otp-box">
              <p style="margin: 0 0 10px 0; color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
              <div class="otp">${otp}</div>
            </div>
            
            <div class="info-box">
              <p style="margin: 0; font-weight: bold;">⏱️ This OTP is valid for 10 minutes only.</p>
            </div>
            
            <div class="warning">
              <strong>🔐 Security Tips:</strong>
              <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                <li>Never share this OTP with anyone</li>
                <li>ScholarFlow will never ask for your OTP via phone or email</li>
                <li>If you didn't request this, please ignore this email</li>
              </ul>
            </div>
            
            <p>After verification, you'll be able to access all features of ScholarFlow and manage your research papers efficiently.</p>
            
            <div class="footer">
              <p>If you didn't create an account with ScholarFlow, you can safely ignore this email.</p>
              <p style="margin-top: 15px;">
                <strong>ScholarFlow</strong><br>
                Research Paper Management System
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Hello ${name},
      
      Welcome to ScholarFlow! To complete your registration, please verify your email address.
      
      Your verification code is: ${otp}
      
      This OTP is valid for 10 minutes only.
      
      Security Tips:
      - Never share this OTP with anyone
      - ScholarFlow will never ask for your OTP via phone or email
      - If you didn't request this, please ignore this email
      
      After verification, you'll be able to access all features of ScholarFlow.
      
      Best regards,
      ScholarFlow Team
    `
  };

  await transporter.sendMail(mailOptions);
};

// @desc    Register user (Step 1: Send OTP)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user already exists and is verified
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Hash password before storing in pending users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Delete any existing pending user with same email
    await PendingUser.deleteOne({ email });

    // Create pending user (temporary)
    await PendingUser.create({
      name,
      email,
      password: hashedPassword,
      verificationOTP: otp,
      otpExpire
    });

    // Send OTP email
    try {
      await sendOTPEmail(email, name, otp);
      
      res.status(200).json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete registration.',
        requiresVerification: true
      });
    } catch (emailError) {
      console.error('❌ Error sending OTP email:', emailError);
      
      // Clean up pending user if email fails
      await PendingUser.deleteOne({ email });
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during registration',
      error: error.message
    });
  }
};

// @desc    Verify OTP and create user (Step 2: Complete Registration)
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > pendingUser.otpExpire) {
      await PendingUser.deleteOne({ email });
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please register again.'
      });
    }

    // Verify OTP
    if (pendingUser.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is valid - Create actual user
    const user = await User.create({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // Already hashed
      isVerified: true
    });

    // Delete pending user
    await PendingUser.deleteOne({ email });

    // Generate token and send response
    sendTokenResponse(user, 201, res, 'Email verified! Registration successful.');
  } catch (error) {
    console.error('❌ OTP verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message
    });
  }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
exports.resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    // Find pending user
    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return res.status(404).json({
        success: false,
        message: 'No pending registration found. Please register again.'
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpire = Date.now() + 10 * 60 * 1000;

    // Update pending user with new OTP
    pendingUser.verificationOTP = otp;
    pendingUser.otpExpire = otpExpire;
    await pendingUser.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, pendingUser.name, otp);
      
      res.status(200).json({
        success: true,
        message: 'New OTP sent to your email'
      });
    } catch (emailError) {
      console.error('❌ Error resending OTP:', emailError);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again.'
      });
    }
  } catch (error) {
    console.error('❌ Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not registered. Please sign up first.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid password. Please try again.'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address'
      });
    }

    // Generate new random password
    const newPassword = generateRandomPassword();

    // Update user password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    // Email content
    const mailOptions = {
      from: {
        name: 'ScholarFlow',
        address: process.env.GMAIL_USER
      },
      to: email,
      subject: 'Password Reset - ScholarFlow',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 30px;
              border-radius: 10px;
            }
            .content {
              background: white;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              margin-bottom: 10px;
            }
            h1 {
              color: #667eea;
              margin: 0;
              font-size: 24px;
            }
            .password-box {
              background: #f8f9fa;
              border-left: 4px solid #667eea;
              padding: 20px;
              margin: 25px 0;
              border-radius: 4px;
            }
            .password {
              font-size: 24px;
              font-weight: bold;
              color: #667eea;
              letter-spacing: 2px;
              text-align: center;
              padding: 10px;
              background: white;
              border-radius: 4px;
              font-family: 'Courier New', monospace;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              color: #6c757d;
              font-size: 14px;
            }
            .button {
              display: inline-block;
              padding: 12px 30px;
              background: #667eea;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="content">
              <div class="header">
                <div class="logo">📚</div>
                <h1>Password Reset Successful</h1>
              </div>
              
              <p>Hello <strong>${user.name}</strong>,</p>
              
              <p>We received a request to reset your password for your ScholarFlow account. Your new password has been generated:</p>
              
              <div class="password-box">
                <p style="margin: 0 0 10px 0; font-weight: bold; color: #667eea;">Your New Password:</p>
                <div class="password">${newPassword}</div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <ul style="margin: 10px 0 0 0; padding-left: 20px;">
                  <li>Copy this password immediately</li>
                  <li>Login to your account as soon as possible</li>
                  <li>Change this password to something you can remember</li>
                  <li>Never share your password with anyone</li>
                </ul>
              </div>
              
              <p>You can now login to your ScholarFlow account using your email and this new password.</p>
              
              <div style="text-align: center;">
                <a href="${process.env.FRONTEND_URL}/login" class="button">Login to ScholarFlow</a>
              </div>
              
              <div class="footer">
                <p>If you didn't request this password reset, please contact our support team immediately.</p>
                <p style="margin-top: 15px;">
                  <strong>ScholarFlow</strong><br>
                  Research Paper Management System
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${user.name},
        
        We received a request to reset your password for your ScholarFlow account.
        
        Your new password is: ${newPassword}
        
        Please login to your account and change this password immediately.
        
        Login URL: ${process.env.FRONTEND_URL}/login
        
        If you didn't request this password reset, please contact our support team immediately.
        
        Best regards,
        ScholarFlow Team
      `
    };

    // Send email
    try {
      await transporter.sendMail(mailOptions);
      
      res.status(200).json({
        success: true,
        message: 'New password has been sent to your email'
      });
    } catch (emailError) {
      console.error('❌ Error sending email:', emailError);
      
      return res.status(500).json({
        success: false,
        message: 'Password was reset but email could not be sent. Please contact support.'
      });
    }
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user,
      message: 'User details updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating user details',
      error: error.message
    });
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password updated successfully');
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating password',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/deleteaccount
// @access  Private
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password before deletion
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your password to confirm account deletion'
      });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Account deletion cancelled.'
      });
    }

    // Delete user
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res, message) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
};
