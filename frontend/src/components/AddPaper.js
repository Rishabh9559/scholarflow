import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPaper.css';

const AddPaper = ({ onAddPaper }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    authors: [{
      name: '',
      department: '',
      affiliation: '',
      city: '',
      country: '',
      email: ''
    }],
    abstract: '',
    keywords: '',
    introduction: '',
    literatureReview: '',
    methodology: '',
    conclusion: '',
    references: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuthorChange = (index, field, value) => {
    const newAuthors = [...formData.authors];
    newAuthors[index][field] = value;
    setFormData(prev => ({
      ...prev,
      authors: newAuthors
    }));
  };

  const addAuthor = () => {
    setFormData(prev => ({
      ...prev,
      authors: [...prev.authors, {
        name: '',
        department: '',
        affiliation: '',
        city: '',
        country: '',
        email: ''
      }]
    }));
  };

  const removeAuthor = (index) => {
    if (formData.authors.length > 1) {
      const newAuthors = formData.authors.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        authors: newAuthors
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!formData.title.trim()) {
      setError('Please enter a paper title');
      return;
    }

    if (!formData.abstract.trim()) {
      setError('Please enter an abstract');
      return;
    }

    if (formData.authors.some(author => !author.name.trim())) {
      setError('Please fill in all author names or remove empty author fields');
      return;
    }

    if (formData.authors.some(author => author.email && !author.email.includes('@'))) {
      setError('Please enter valid email addresses');
      return;
    }

    // Prepare data for submission
    const paperData = {
      title: formData.title.trim(),
      authors: formData.authors.filter(author => author.name.trim()),
      abstract: formData.abstract.trim(),
      keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
      introduction: formData.introduction.trim(),
      literatureReview: formData.literatureReview.trim(),
      methodology: formData.methodology.trim(),
      conclusion: formData.conclusion.trim(),
      references: formData.references.split('\n').filter(r => r.trim())
    };

    setLoading(true);
    const result = await onAddPaper(paperData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Failed to add paper. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/dashboard');
  };

  return (
    <div className="add-paper-container">
      <header className="add-paper-header">
        <div className="header-left">
          <button onClick={handleCancel} className="back-button">
            ← Back to Dashboard
          </button>
          <h1>Add New Paper</h1>
        </div>
      </header>

      <main className="add-paper-main">
        <form onSubmit={handleSubmit} className="add-paper-form">
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1.5rem',
              border: '1px solid #fecaca'
            }}>
              {error}
            </div>
          )}

          {/* Title Section */}
          <div className="form-section">
            <h2 className="section-title">Paper Information</h2>
            <div className="form-group full-width">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter paper title"
                required
              />
            </div>
          </div>

          {/* Authors Section */}
          <div className="form-section">
            <h2 className="section-title">Author Details</h2>
            <div className="authors-container">
              {formData.authors.map((author, index) => (
                <div key={index} className="author-card">
                  <div className="author-header">
                    <h3>Author {index + 1}</h3>
                    {formData.authors.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAuthor(index)}
                        className="remove-author-button"
                        title="Remove author"
                      >
                        × Remove
                      </button>
                    )}
                  </div>
                  
                  <div className="author-fields">
                    <div className="form-group">
                      <label>Author Name *</label>
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) => handleAuthorChange(index, 'name', e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={author.department}
                        onChange={(e) => handleAuthorChange(index, 'department', e.target.value)}
                        placeholder="e.g., Computer Science"
                      />
                    </div>

                    <div className="form-group">
                      <label>Affiliation</label>
                      <input
                        type="text"
                        value={author.affiliation}
                        onChange={(e) => handleAuthorChange(index, 'affiliation', e.target.value)}
                        placeholder="University/Institution name"
                      />
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>City</label>
                        <input
                          type="text"
                          value={author.city}
                          onChange={(e) => handleAuthorChange(index, 'city', e.target.value)}
                          placeholder="City"
                        />
                      </div>

                      <div className="form-group">
                        <label>Country</label>
                        <input
                          type="text"
                          value={author.country}
                          onChange={(e) => handleAuthorChange(index, 'country', e.target.value)}
                          placeholder="Country"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={author.email}
                        onChange={(e) => handleAuthorChange(index, 'email', e.target.value)}
                        placeholder="author@email.com"
                      />
                    </div>
                  </div>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addAuthor}
                className="add-author-button"
              >
                + Add Another Author
              </button>
            </div>
          </div>

          {/* Abstract Section */}
          <div className="form-section">
            <h2 className="section-title">Abstract</h2>
            <div className="form-group full-width">
              <label htmlFor="abstract">Abstract *</label>
              <textarea
                id="abstract"
                name="abstract"
                value={formData.abstract}
                onChange={handleInputChange}
                placeholder="Enter paper abstract (summary of your research)"
                rows="6"
                required
              />
              <small className="field-hint">Brief summary of the research paper</small>
            </div>
          </div>

          {/* Keywords Section */}
          <div className="form-section">
            <h2 className="section-title">Keywords</h2>
            <div className="form-group full-width">
              <label htmlFor="keywords">Keywords</label>
              <input
                type="text"
                id="keywords"
                name="keywords"
                value={formData.keywords}
                onChange={handleInputChange}
                placeholder="machine learning, artificial intelligence, neural networks"
              />
              <small className="field-hint">Separate multiple keywords with commas</small>
            </div>
          </div>

          {/* Introduction Section */}
          <div className="form-section">
            <h2 className="section-title">Introduction</h2>
            <div className="form-group full-width">
              <label htmlFor="introduction">Introduction</label>
              <textarea
                id="introduction"
                name="introduction"
                value={formData.introduction}
                onChange={handleInputChange}
                placeholder="Introduce the research topic, background, and objectives..."
                rows="8"
              />
              <small className="field-hint">Background and context of your research</small>
            </div>
          </div>

          {/* Literature Review Section */}
          <div className="form-section">
            <h2 className="section-title">Literature Review</h2>
            <div className="form-group full-width">
              <label htmlFor="literatureReview">Literature Review</label>
              <textarea
                id="literatureReview"
                name="literatureReview"
                value={formData.literatureReview}
                onChange={handleInputChange}
                placeholder="Review of existing research and related work..."
                rows="8"
              />
              <small className="field-hint">Survey of related research and existing work</small>
            </div>
          </div>

          {/* Methodology Section */}
          <div className="form-section">
            <h2 className="section-title">Methodology</h2>
            <div className="form-group full-width">
              <label htmlFor="methodology">Methodology</label>
              <textarea
                id="methodology"
                name="methodology"
                value={formData.methodology}
                onChange={handleInputChange}
                placeholder="Describe your research methods, approach, and procedures..."
                rows="8"
              />
              <small className="field-hint">Detailed description of research methods and procedures</small>
            </div>
          </div>

          {/* Conclusion Section */}
          <div className="form-section">
            <h2 className="section-title">Conclusion</h2>
            <div className="form-group full-width">
              <label htmlFor="conclusion">Conclusion</label>
              <textarea
                id="conclusion"
                name="conclusion"
                value={formData.conclusion}
                onChange={handleInputChange}
                placeholder="Summarize findings, results, and future work..."
                rows="6"
              />
              <small className="field-hint">Summary of findings and future directions</small>
            </div>
          </div>

          {/* References Section */}
          <div className="form-section">
            <h2 className="section-title">References</h2>
            <div className="form-group full-width">
              <label htmlFor="references">References</label>
              <textarea
                id="references"
                name="references"
                value={formData.references}
                onChange={handleInputChange}
                placeholder="Enter references, one per line&#10;&#10;Example:&#10;Smith, J. (2024). Machine Learning Basics. Journal of AI, 10(2), 45-60.&#10;Johnson, A. & Lee, B. (2023). Neural Networks in Practice. Tech Press."
                rows="8"
              />
              <small className="field-hint">Enter each reference on a new line</small>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={handleCancel} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Paper'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AddPaper;