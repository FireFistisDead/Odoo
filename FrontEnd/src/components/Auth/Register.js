// src/components/auth/RegisterForm.js
import React, { useState } from 'react';

const RegisterForm = ({ onRegister, onSwitchToLogin, loading, error, clearError }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    availability: 'weekends'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onRegister(formData.email, formData.password, formData);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="auth-container register-bg">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Join Grow Together</h1>
          <p className="auth-subtitle">Start your learning journey</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your full name"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              minLength="6"
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Location (Optional)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="form-input"
              placeholder="City, Country"
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Availability</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleInputChange}
              className="form-select"
              disabled={loading}
            >
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="weekdays">Weekdays</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-secondary btn-full" 
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="auth-text">
            Already have an account?{' '}
            <button
              onClick={() => {
                onSwitchToLogin();
                clearError();
              }}
              className="auth-link"
              disabled={loading}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;