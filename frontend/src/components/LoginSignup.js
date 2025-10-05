import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './LoginSignup.css';

const LoginSignup = ({ onLogin, onRegister }) => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    otp: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  // Start OTP timer
  const startOTPTimer = () => {
    setOtpTimer(600); // 10 minutes in seconds
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return false;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.verifyOTP(formData.email, formData.otp);
      
      if (response.success && response.token) {
        // Call parent's onRegister with user data from verifyOTP response
        await onRegister(response.user);
        navigate('/dashboard');
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setError(
        err.response?.data?.message || 
        'Invalid OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }

    return false;
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    if (otpTimer > 0) {
      return; // Don't allow resend if timer is still running
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.resendOTP(formData.email);
      
      if (response.success) {
        setError(''); // Clear any errors
        // alert('New OTP sent to your email!');
        startOTPTimer();
      } else {
        setError(response.message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to resend OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    // Absolutely prevent any default form behavior
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    
    // Validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!isLogin) {
      if (!formData.name) {
        setError('Please enter your name');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const result = await onLogin({
          email: formData.email,
          password: formData.password
        });
        
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Login failed. Please try again.');
        }
      } else {
        // Registration - Send OTP
        const response = await authAPI.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        
        if (response.success && response.requiresVerification) {
          setShowOTPVerification(true);
          startOTPTimer();
          setError(''); // Clear any errors
        } else {
          setError(response.message || 'Registration failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(
        err.response?.data?.message || 
        'An unexpected error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
    
    // Extra safety - prevent any form submission
    return false;
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setShowOTPVerification(false);
    setError(''); // Clear error when toggling
    setOtpTimer(0);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      otp: ''
    });
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  // OTP Verification Screen
  if (showOTPVerification) {
    return (
      <div className="login-signup-container">
        <div className="login-signup-card">
          <div className="logo-section">
            <div className="logo">
              <span className="logo-icon">📚</span>
              <span className="logo-text">ScholarFlow</span>
            </div>
            <h2 style={{ color: '#667eea', margin: '20px 0 10px 0' }}>Verify Your Email</h2>
            <p className="welcome-text">
              We've sent a 6-digit OTP to <strong>{formData.email}</strong>
            </p>
          </div>

          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee',
              color: '#c33',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              border: '1px solid #fcc'
            }}>
              {error}
            </div>
          )}

          <form 
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleVerifyOTP(e);
              return false;
            }} 
            noValidate 
            className="auth-form"
          >
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                type="text"
                id="otp"
                name="otp"
                value={formData.otp}
                onChange={handleInputChange}
                placeholder="Enter 6-digit OTP"
                maxLength="6"
                disabled={loading}
                style={{
                  fontSize: '24px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  fontFamily: 'monospace'
                }}
              />
              {otpTimer > 0 && (
                <small style={{ color: '#667eea', display: 'block', marginTop: '8px' }}>
                  ⏱️ OTP expires in: {formatTimer(otpTimer)}
                </small>
              )}
              {otpTimer === 0 && (
                <small style={{ color: '#f44', display: 'block', marginTop: '8px' }}>
                  ⚠️ OTP has expired. Please request a new one.
                </small>
              )}
            </div>

            <button 
              type="submit" 
              className="submit-button"
              disabled={loading || otpTimer === 0}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p style={{ marginBottom: '10px', color: '#666' }}>
              Didn't receive the OTP?
            </p>
            <button 
              type="button"
              onClick={handleResendOTP}
              disabled={loading || otpTimer > 0}
              style={{
                background: 'none',
                border: 'none',
                color: otpTimer > 0 ? '#ccc' : '#667eea',
                cursor: otpTimer > 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                textDecoration: 'underline',
                padding: '8px 16px'
              }}
            >
              {otpTimer > 0 ? `Resend in ${formatTimer(otpTimer)}` : 'Resend OTP'}
            </button>
            <br />
            <button 
              type="button"
              onClick={() => {
                setShowOTPVerification(false);
                setOtpTimer(0);
                setFormData(prev => ({ ...prev, otp: '' }));
                setError('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#999',
                cursor: 'pointer',
                fontSize: '14px',
                marginTop: '10px',
                textDecoration: 'underline'
              }}
            >
              Back to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-signup-container">
      <div className="login-signup-card">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">ScholarFlow</span>
          </div>
          <p className="welcome-text">
            {isLogin ? 'Welcome back!' : 'Join ScholarFlow today'}
          </p>
        </div>

        <div className="form-tabs">
          <button 
            type="button"
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(true); setError(''); }}
          >
            Login
          </button>
          <button 
            type="button"
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => { setIsLogin(false); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(e);
            return false;
          }} 
          noValidate 
          className="auth-form"
        >
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              fontSize: '0.875rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>
          )}

          {isLogin && (
            <div className="forgot-password">
              <button type="button" onClick={handleForgotPassword} className="forgot-link">
                Forgot your password?
              </button>
            </div>
          )}

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="switch-mode">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={toggleMode} className="switch-button">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;