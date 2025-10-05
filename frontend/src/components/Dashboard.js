import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = ({ papers, onLogout, onDelete, user }) => {
  const navigate = useNavigate();

  const handleAddPaper = () => {
    navigate('/add-paper');
  };

  const handleConvertFormat = (paperId, format) => {
    // Simulate format conversion
    alert(`Converting paper ${paperId} to ${format} format...`);
  };

  const handleDownloadPDF = (paperId) => {
    // Simulate PDF download
    alert(`Downloading PDF for paper ${paperId}...`);
  };

  const handleEditPaper = (paperId) => {
    navigate(`/edit-paper/${paperId}`);
  };

  const handleDeletePaper = async (paperId, paperTitle) => {
    if (window.confirm(`Are you sure you want to delete "${paperTitle}"? This action cannot be undone.`)) {
      const result = await onDelete(paperId);
      if (result && !result.success) {
        alert(result.error || 'Failed to delete paper');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: '2-digit' 
    });
  };

  const getAuthorNames = (authors) => {
    if (!authors || authors.length === 0) return 'No authors';
    return authors.map(author => author.name || author).join(', ');
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">📚</span>
            <span className="logo-text">ScholarFlow</span>
          </div>
        </div>
        <div className="header-right">
          <div className="user-profile">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
            <span className="user-name">{user?.name || 'User'}</span>
          </div>
          <button onClick={() => navigate('/profile')} className="profile-button">
            Profile
          </button>
          <button onClick={onLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="main-header">
          <h1>My Papers</h1>
          <p className="paper-count">{papers.length} papers saved</p>
        </div>

        <div className="papers-grid">
          {papers.map(paper => (
            <div key={paper._id} className="paper-card">
              <div className="paper-header">
                <h3 className="paper-title">{paper.title}</h3>
                <span className="paper-date">{formatDate(paper.createdAt)}</span>
              </div>
              
              <p className="paper-description">
                {paper.abstract ? paper.abstract.substring(0, 150) + '...' : 'No abstract available'}
              </p>
              
              <div className="paper-meta">
                <p className="paper-authors">
                  <strong>Authors:</strong> {getAuthorNames(paper.authors)}
                </p>
                {paper.keywords && paper.keywords.length > 0 && (
                  <p className="paper-keywords">
                    <strong>Keywords:</strong> {paper.keywords.join(', ')}
                  </p>
                )}
              </div>
              
              <div className="paper-actions">
                <button 
                  onClick={() => handleEditPaper(paper._id)}
                  className="action-button edit-button"
                >
                  ✏️ Edit Paper
                </button>
                <button 
                  onClick={() => handleConvertFormat(paper._id, 'IEEE')}
                  className="action-button ieee-button"
                >
                  Convert to IEEE Format
                </button>
                <button 
                  onClick={() => handleConvertFormat(paper._id, 'Springer')}
                  className="action-button springer-button"
                >
                  Convert to Springer Format
                </button>
                <button 
                  onClick={() => handleDownloadPDF(paper._id)}
                  className="action-button download-button"
                >
                  📄 Download PDF
                </button>
                <button 
                  onClick={() => handleDeletePaper(paper._id, paper.title)}
                  className="action-button delete-button"
                >
                  🗑️ Delete Paper
                </button>
              </div>
            </div>
          ))}
        </div>

        {papers.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📄</div>
            <h3>No papers yet</h3>
            <p>Start building your research library by adding your first paper.</p>
            <button onClick={handleAddPaper} className="add-first-paper-button">
              Add Your First Paper
            </button>
          </div>
        )}
      </main>

      <button onClick={handleAddPaper} className="floating-add-button">
        <span className="add-icon">+</span>
      </button>
    </div>
  );
};

export default Dashboard;