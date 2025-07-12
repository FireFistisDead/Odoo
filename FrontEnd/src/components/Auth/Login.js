// src/components/auth/LoginForm.js
import React, { useState } from 'react';
import { seedDemoData } from '../../firebaseHelpers';

const LoginForm = ({ onLogin, onSwitchToRegister, loading, error, clearError }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onLogin(formData.email, formData.password);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSeedDemo = async () => {
    const result = await seedDemoData();
    if (result.success) {
      alert('Demo data added successfully! 🎉');
    } else {
      alert('Error seeding demo data: ' + result.error);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Grow Together</h1>
          <p className="auth-subtitle">Learn, Teach, Grow Together</p>
        </div>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="auth-text">
            Don't have an account?{' '}
            <button
              onClick={() => {
                onSwitchToRegister();
                clearError();
              }}
              className="auth-link"
              disabled={loading}
            >
              Sign Up
            </button>
          </p>
        </div>
        
        <div className="demo-account">
          <p className="demo-text">Try the demo:</p>
          <button 
            onClick={handleSeedDemo} 
            className="btn btn-secondary btn-small"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Demo Users'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;