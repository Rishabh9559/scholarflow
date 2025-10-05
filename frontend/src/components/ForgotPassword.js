import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await authAPI.forgotPassword(email);
      
      if (response.success) {
        setIsSubmitted(true);
      } else {
        setError(response.message || 'Failed to send reset email');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(
        err.response?.data?.message || 
        'Failed to send reset email. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
    setError('');
  };

  if (isSubmitted) {
    return (
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="success-section">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p className="success-message">
              A new password has been sent to <strong>{email}</strong>
            </p>
            <p className="additional-info">
              Please check your inbox (and spam folder) for your new password. 
              Use it to login, then change it to something you can remember.
            </p>
            
            <div className="success-actions">
              <button onClick={handleResendEmail} className="resend-button">
                Send Again
              </button>
              <button onClick={handleBackToLogin} className="back-to-login-button">
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="header-section">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">ScholarFlow</span>
          </div>
          <h2>Reset Your Password</h2>
          <p className="subtitle">
            Enter your email address and we'll send you a new password.
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

        <form onSubmit={handleSubmit} noValidate className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner"></span>
                Sending New Password...
              </>
            ) : (
              'Send New Password'
            )}
          </button>
        </form>

        <div className="footer-section">
          <p>
            Remember your password?{' '}
            <button onClick={handleBackToLogin} className="back-link">
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;