import React, { useState, useEffect } from 'react';
import { latexAPI } from '../services/api';
import './LatexPreview.css';

const LatexPreview = ({ paperId, format, paperTitle, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [latexContent, setLatexContent] = useState('');
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const loadPreview = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      if (format === 'IEEE') {
        response = await latexAPI.previewIEEE(paperId);
      }
      // Springer format coming soon!

      if (response && response.success) {
        setLatexContent(response.data.content);
      }
    } catch (err) {
      console.error('Error loading preview:', err);
      setError('Failed to load LaTeX preview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paperId, format]);

  const handleDownload = async () => {
    try {
      let blob;
      if (format === 'IEEE') {
        blob = await latexAPI.downloadIEEE(paperId);
      }
      // Springer format coming soon!

      if (!blob) {
        setError('This format is not available yet.');
        return;
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${paperTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${format.toLowerCase()}.tex`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      onClose();
    } catch (err) {
      console.error('Error downloading file:', err);
      setError('Failed to download file. Please try again.');
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(latexContent);
    setCopySuccess(true);
    
    // Hide the success message after 5 seconds
    setTimeout(() => {
      setCopySuccess(false);
    }, 5000);
  };

  return (
    <div className="latex-preview-overlay" onClick={onClose}>
      <div className="latex-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="latex-preview-header">
          <h2>{format} Format Preview</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="latex-preview-info">
          <p className="paper-title-preview">📄 {paperTitle}</p>
        </div>

        {copySuccess && (
          <div className="copy-success-toast">
            LaTeX code copied successfully!
          </div>
        )}

        {loading && (
          <div className="loading-preview">
            <div className="spinner"></div>
            <p>Generating LaTeX preview...</p>
          </div>
        )}

        {error && (
          <div className="error-message-preview">
            <p>⚠️ {error}</p>
            <button onClick={loadPreview} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="latex-preview-content">
              <pre><code>{latexContent}</code></pre>
            </div>

            <div className="latex-preview-actions">
              <button onClick={handleCopyToClipboard} className="copy-button">
                📋 Copy LaTeX
              </button>
              <button onClick={handleDownload} className="download-button-modal">
                💾 Download .tex
              </button>
              <button onClick={onClose} className="cancel-button-modal">
                Cancel
              </button>
            </div>
          </>
        )}

        <div className="latex-preview-footer">
          <p className="latex-info">
            💡 <strong>Tip:</strong> Download the .tex file and compile it manually with your preferred LaTeX editor.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LatexPreview;
