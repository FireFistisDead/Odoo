// src/components/pages/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { updateUserProfile } from '../../firebaseHelpers';

const ProfilePage = ({ currentUser, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'weekends',
    isPublic: true,
    bio: ''
  });
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  // Initialize form with current user data
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        location: currentUser.location || '',
        skillsOffered: currentUser.skillsOffered || [],
        skillsWanted: currentUser.skillsWanted || [],
        availability: currentUser.availability || 'weekends',
        isPublic: currentUser.isPublic !== false,
        bio: currentUser.bio || ''
      });
    }
  }, [currentUser]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser?.uid) return;
    
    setLoading(true);

    try {
      const result = await updateUserProfile(currentUser.uid, profileForm);
      
      if (result.success) {
        onProfileUpdate();
        alert('Profile updated successfully! 🎉');
      } else {
        alert('Error updating profile: ' + result.error);
      }
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addSkill = (type, skill) => {
    if (!skill.trim()) return;
    
    const skillToAdd = skill.trim();
    
    if (type === 'offered') {
      if (!profileForm.skillsOffered.includes(skillToAdd)) {
        setProfileForm(prev => ({
          ...prev,
          skillsOffered: [...prev.skillsOffered, skillToAdd]
        }));
      }
      setNewSkillOffered('');
    } else {
      if (!profileForm.skillsWanted.includes(skillToAdd)) {
        setProfileForm(prev => ({
          ...prev,
          skillsWanted: [...prev.skillsWanted, skillToAdd]
        }));
      }
      setNewSkillWanted('');
    }
  };

  const removeSkill = (type, index) => {
    if (type === 'offered') {
      setProfileForm(prev => ({
        ...prev,
        skillsOffered: prev.skillsOffered.filter((_, i) => i !== index)
      }));
    } else {
      setProfileForm(prev => ({
        ...prev,
        skillsWanted: prev.skillsWanted.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">Edit Profile</h2>
        
        <form onSubmit={handleSubmit} className="profile-form">
          {/* Basic Info */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleInputChange}
                className="form-input"
                required
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                type="text"
                name="location"
                value={profileForm.location}
                onChange={handleInputChange}
                className="form-input"
                placeholder="City, Country"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Bio */}
          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              name="bio"
              value={profileForm.bio}
              onChange={handleInputChange}
              className="form-textarea"
              rows="3"
              placeholder="Tell others about yourself..."
              disabled={loading}
            />
          </div>
          
          {/* Skills Offered */}
          <SkillsManager
            title="Skills I Offer"
            skills={profileForm.skillsOffered}
            newSkill={newSkillOffered}
            onNewSkillChange={setNewSkillOffered}
            onAddSkill={(skill) => addSkill('offered', skill)}
            onRemoveSkill={(index) => removeSkill('offered', index)}
            skillType="offered"
            loading={loading}
          />
          
          {/* Skills Wanted */}
          <SkillsManager
            title="Skills I Want to Learn"
            skills={profileForm.skillsWanted}
            newSkill={newSkillWanted}
            onNewSkillChange={setNewSkillWanted}
            onAddSkill={(skill) => addSkill('wanted', skill)}
            onRemoveSkill={(index) => removeSkill('wanted', index)}
            skillType="wanted"
            loading={loading}
          />
          
          {/* Settings */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Availability</label>
              <select
                name="availability"
                value={profileForm.availability}
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
            
            <div className="form-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={profileForm.isPublic}
                  onChange={handleInputChange}
                  className="checkbox-input"
                  disabled={loading}
                />
                <span className="checkbox-label">Make my profile public</span>
              </label>
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary btn-full" 
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

// Skills Manager Component
const SkillsManager = ({ 
  title, 
  skills, 
  newSkill, 
  onNewSkillChange, 
  onAddSkill, 
  onRemoveSkill, 
  skillType,
  loading 
}) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onAddSkill(newSkill);
    }
  };

  return (
    <div className="skills-manager">
      <label className="form-label">{title}</label>
      
      <div className="skill-input-group">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => onNewSkillChange(e.target.value)}
          onKeyPress={handleKeyPress}
          className="form-input"
          placeholder="Add a skill..."
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => onAddSkill(newSkill)}
          className={`btn ${skillType === 'offered' ? 'btn-success' : 'btn-primary'} btn-icon`}
          disabled={loading || !newSkill.trim()}
        >
          <Plus size={16} />
        </button>
      </div>
      
      <div className="skills-list">
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className={`skill-tag skill-${skillType} skill-removable`}
          >
            {skill}
            <button
              type="button"
              onClick={() => onRemoveSkill(index)}
              className="skill-remove"
              disabled={loading}
            >
              ×
            </button>
          </span>
        ))}
        {skills.length === 0 && (
          <p className="empty-skills">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;