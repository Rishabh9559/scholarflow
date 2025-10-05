import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Profile.css';

const Profile = ({ user, onLogout, onUpdateUser }) => {
  const navigate = useNavigate();
  
  // Active tab state
  const [activeTab, setActiveTab] = useState('details'); // 'details', 'password', 'danger'
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data for profile update
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  
  // Form data for password update
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form data for account deletion
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  // Handle input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };
  
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };
  
  // Update profile details
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    
    if (!profileData.name.trim()) {
      setError('Name cannot be empty');
      return false;
    }
    
    if (!profileData.email.trim()) {
      setError('Email cannot be empty');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.updateProfile(profileData);
      
      if (response.success) {
        setSuccess('Profile updated successfully!');
        onUpdateUser(response.data);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
    
    return false;
  };
  
  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all password fields');
      return false;
    }
    
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return false;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (response.success) {
        setSuccess('Password updated successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Password update error:', err);
      setError(err.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
    
    return false;
  };
  
  // Delete account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError('');
    setSuccess('');
    
    if (!deletePassword) {
      setError('Please enter your password to confirm deletion');
      return false;
    }
    
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      return false;
    }
    
    const confirmDelete = window.confirm(
      '⚠️ ARE YOU ABSOLUTELY SURE?\n\n' +
      'This action CANNOT be undone. Your account and all data will be permanently deleted.\n\n' +
      'Click OK to permanently delete your account.'
    );
    
    if (!confirmDelete) {
      return false;
    }
    
    setLoading(true);
    
    try {
      const response = await authAPI.deleteAccount(deletePassword);
      
      if (response.success) {
        // alert('✅ Account deleted successfully. You will now be logged out.');
        onLogout();
        navigate('/login');
      } else {
        setError(response.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.message || 'Failed to delete account. Please try again.');
    } finally {
      setLoading(false);
    }
    
    return false;
  };
  
  return (
    <div className="profile-container">
      <div className="profile-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>Account Settings</h1>
        <p className="profile-subtitle">Manage your account information and preferences</p>
      </div>
      
      <div className="profile-content">
        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('details');
              setError('');
              setSuccess('');
            }}
          >
            <span className="tab-icon">👤</span>
            Profile Details
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'password' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('password');
              setError('');
              setSuccess('');
            }}
          >
            <span className="tab-icon">🔒</span>
            Change Password
          </button>
          <button
            type="button"
            className={`tab ${activeTab === 'danger' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('danger');
              setError('');
              setSuccess('');
            }}
          >
            <span className="tab-icon">⚠️</span>
            Danger Zone
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="tab-content">
          {/* Success/Error Messages */}
          {success && (
            <div className="message success-message">
              ✅ {success}
            </div>
          )}
          
          {error && (
            <div className="message error-message">
              ❌ {error}
            </div>
          )}
          
          {/* Profile Details Tab */}
          {activeTab === 'details' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <p className="section-description">
                Update your account's profile information and email address.
              </p>
              
              <form onSubmit={handleUpdateProfile} noValidate>
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={profileData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="text"
                    id="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    placeholder="Enter your email address"
                    disabled={loading}
                  />
                  <small className="form-hint">
                    ⚠️ Changing your email may require re-verification
                  </small>
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Change Password Tab */}
          {activeTab === 'password' && (
            <div className="profile-section">
              <h2>Change Password</h2>
              <p className="section-description">
                Ensure your account is using a long, random password to stay secure.
              </p>
              
              <form onSubmit={handleUpdatePassword} noValidate>
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your current password"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter your new password"
                    disabled={loading}
                  />
                  <small className="form-hint">
                    Must be at least 6 characters long
                  </small>
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm your new password"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {/* Danger Zone Tab */}
          {activeTab === 'danger' && (
            <div className="profile-section danger-zone">
              <h2>🚨 Danger Zone</h2>
              <p className="section-description">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              <div className="warning-box">
                <h3>⚠️ Warning: This Action is Permanent</h3>
                <ul>
                  <li>Your account will be permanently deleted</li>
                  <li>All your saved research papers will be lost</li>
                  <li>This action <strong>CANNOT</strong> be undone</li>
                  <li>You will need to create a new account to use ScholarFlow again</li>
                </ul>
              </div>
              
              <form onSubmit={handleDeleteAccount} noValidate>
                <div className="form-group">
                  <label htmlFor="deletePassword">Enter Your Password</label>
                  <input
                    type="password"
                    id="deletePassword"
                    name="deletePassword"
                    value={deletePassword}
                    onChange={(e) => {
                      setDeletePassword(e.target.value);
                      setError('');
                    }}
                    placeholder="Enter your password to confirm"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="deleteConfirmation">
                    Type <strong>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    id="deleteConfirmation"
                    name="deleteConfirmation"
                    value={deleteConfirmation}
                    onChange={(e) => {
                      setDeleteConfirmation(e.target.value);
                      setError('');
                    }}
                    placeholder="Type DELETE in capital letters"
                    disabled={loading}
                  />
                </div>
                
                <div className="form-actions">
                  <button
                    type="submit"
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    {loading ? 'Deleting Account...' : 'Delete My Account Permanently'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
