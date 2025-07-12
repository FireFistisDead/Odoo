// src/components/modals/UserDetailModal.js
import React from 'react';
import { MapPin, Calendar, Star } from 'lucide-react';
import { createSwapRequest } from '../../firebaseHelpers';

const UserDetailModal = ({ user, currentUser, onClose, onRequestSent }) => {
  const sendSwapRequest = async (targetUser, mySkill, theirSkill) => {
    if (!currentUser?.uid) return;
    
    const requestData = {
      fromUid: currentUser.uid,
      fromName: currentUser.name,
      toUid: targetUser.uid,
      toName: targetUser.name,
      mySkill,
      theirSkill,
    };

    try {
      const result = await createSwapRequest(requestData);
      
      if (result.success) {
        alert(`Swap request sent to ${targetUser.name}! 🚀`);
        onRequestSent();
        onClose();
      } else {
        alert('Error sending request: ' + result.error);
      }
    } catch (err) {
      alert('Error sending request: ' + err.message);
    }
  };

  const handleRequestSkill = (skill) => {
    if (!currentUser) return;
    
    const myWantedSkills = currentUser.skillsWanted || [];
    if (myWantedSkills.includes(skill)) {
      const mySkill = prompt(
        `Which of your skills would you like to offer in exchange for ${skill}?\n\nYour skills: ${(currentUser.skillsOffered || []).join(', ')}`
      );
      
      if (mySkill && (currentUser.skillsOffered || []).includes(mySkill)) {
        sendSwapRequest(user, mySkill, skill);
      }
    } else {
      alert(`Add "${skill}" to your wanted skills first to request a swap!`);
    }
  };

  const handleOfferSkill = (skill) => {
    if (!currentUser) return;
    
    const myOfferedSkills = currentUser.skillsOffered || [];
    if (myOfferedSkills.includes(skill)) {
      const theirSkill = prompt(
        `Which skill would you like to learn from ${user.name}?\n\nTheir skills: ${(user.skillsOffered || []).join(', ')}`
      );
      
      if (theirSkill && (user.skillsOffered || []).includes(theirSkill)) {
        sendSwapRequest(user, skill, theirSkill);
      }
    } else {
      alert(`You don't offer "${skill}". Add it to your offered skills first!`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <ModalHeader user={user} onClose={onClose} />
        
        {user.bio && <ModalBio bio={user.bio} />}
        
        <ModalSkills 
          user={user} 
          onRequestSkill={handleRequestSkill}
          onOfferSkill={handleOfferSkill}
        />
        
        <ModalFooter user={user} onClose={onClose} />
      </div>
    </div>
  );
};

// Modal Header Component
const ModalHeader = ({ user, onClose }) => (
  <div className="modal-header">
    <div className="modal-user-info">
      <div className="user-avatar large">
        {user.name?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div>
        <h2 className="modal-title">{user.name}</h2>
        <div className="modal-location">
          <MapPin size={16} />
          {user.location || 'Location not set'}
        </div>
        <div className="modal-availability">
          <Calendar size={16} />
          Available: {user.availability || 'Not specified'}
        </div>
      </div>
    </div>
    <button onClick={onClose} className="modal-close">
      ×
    </button>
  </div>
);

// Modal Bio Component
const ModalBio = ({ bio }) => (
  <div className="modal-section">
    <h3 className="section-title">About</h3>
    <p className="user-bio">{bio}</p>
  </div>
);

// Modal Skills Component
const ModalSkills = ({ user, onRequestSkill, onOfferSkill }) => (
  <div className="modal-skills">
    <SkillsColumn
      title="Skills Offered"
      skills={user.skillsOffered}
      buttonText="Request"
      buttonClass="btn-success"
      onSkillAction={onRequestSkill}
      emptyMessage="No skills offered yet"
    />
    
    <SkillsColumn
      title="Skills Wanted"
      skills={user.skillsWanted}
      buttonText="Offer"
      buttonClass="btn-primary"
      onSkillAction={onOfferSkill}
      emptyMessage="No skills wanted yet"
    />
  </div>
);

// Skills Column Component
const SkillsColumn = ({ 
  title, 
  skills, 
  buttonText, 
  buttonClass, 
  onSkillAction, 
  emptyMessage 
}) => (
  <div className="skills-column">
    <h3 className="section-title">{title}</h3>
    <div className="skills-interactive">
      {skills?.length > 0 ? (
        skills.map((skill, index) => (
          <SkillInteractive
            key={index}
            skill={skill}
            buttonText={buttonText}
            buttonClass={buttonClass}
            onAction={() => onSkillAction(skill)}
          />
        ))
      ) : (
        <p className="empty-skills">{emptyMessage}</p>
      )}
    </div>
  </div>
);

// Individual Skill Interactive Component
const SkillInteractive = ({ skill, buttonText, buttonClass, onAction }) => (
  <div className="skill-interactive">
    <span className={`skill-tag ${buttonClass.includes('success') ? 'skill-offered' : 'skill-wanted'}`}>
      {skill}
    </span>
    <button
      onClick={onAction}
      className={`btn ${buttonClass} btn-small`}
    >
      {buttonText}
    </button>
  </div>
);

// Modal Footer Component
const ModalFooter = ({ user, onClose }) => (
  <div className="modal-footer">
    <div className="user-stats">
      <div className="stat">
        <Star className="star-icon" size={16} />
        <span>{user.rating || 5.0} rating</span>
      </div>
      <div className="stat">
        <span>{user.completedSwaps || 0} completed swaps</span>
      </div>
    </div>
    <button onClick={onClose} className="btn btn-secondary">
      Close
    </button>
  </div>
);

export default UserDetailModal;