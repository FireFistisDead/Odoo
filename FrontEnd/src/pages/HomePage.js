// src/components/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { Search, User, MapPin, Star } from 'lucide-react';
import { listenToUsers, seedDemoData } from '../../firebaseHelpers';

const HomePage = ({ currentUser, onSelectUser }) => {
  // State for users and search
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Real-time Firebase listener for users
  useEffect(() => {
    let unsubscribe = null;
    
    if (currentUser?.uid) {
      setLoading(true);
      
      unsubscribe = listenToUsers((usersData) => {
        try {
          // Filter out current user and ensure data quality
          const filteredUsers = usersData.filter(user => 
            user.uid !== currentUser.uid && 
            user.name && 
            user.isPublic !== false
          );
          
          setUsers(filteredUsers);
          setLoading(false);
          setError('');
        } catch (err) {
          console.error('Error processing users:', err);
          setError('Error loading users');
          setLoading(false);
        }
      });
    }

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser?.uid]);

  // Real-time search functionality
  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.location?.toLowerCase().includes(searchLower) ||
      user.skillsOffered?.some(skill => 
        skill.toLowerCase().includes(searchLower)
      ) ||
      user.skillsWanted?.some(skill => 
        skill.toLowerCase().includes(searchLower)
      ) ||
      user.bio?.toLowerCase().includes(searchLower)
    );
  });

  // Add demo users function (for testing)
  const handleAddDemoUsers = async () => {
    setLoading(true);
    try {
      const result = await seedDemoData();
      if (result.success) {
        alert('Demo users added successfully! 🎉');
      } else {
        alert('Error adding demo users: ' + result.error);
        setError('Failed to add demo users');
      }
    } catch (err) {
      console.error('Demo seeding error:', err);
      alert('Error adding demo users');
      setError('Failed to add demo users');
    }
    setLoading(false);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm('');
  };

  return (
    <div className="page-container">
      {/* Welcome Section */}
      <WelcomeSection userName={currentUser?.name} />

      {/* Search Section */}
      <SearchSection 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onClearSearch={clearSearch}
        resultCount={filteredUsers.length}
        totalUsers={users.length}
      />

      {/* Main Content */}
      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState error={error} onRetry={() => window.location.reload()} />
      ) : filteredUsers.length === 0 ? (
        <EmptyState 
          hasUsers={users.length > 0}
          searchTerm={searchTerm}
          onAddDemo={handleAddDemoUsers}
          onClearSearch={clearSearch}
        />
      ) : (
        <UsersGrid users={filteredUsers} onSelectUser={onSelectUser} />
      )}
    </div>
  );
};

// Welcome Section Component
const WelcomeSection = ({ userName }) => (
  <div className="welcome-section">
    <h2 className="welcome-title">
      Welcome back, {userName || 'User'}! 🚀
    </h2>
    <p className="welcome-subtitle">
      Discover amazing skills and share your expertise with the community.
    </p>
  </div>
);

// Search Section Component
const SearchSection = ({ searchTerm, onSearchChange, onClearSearch, resultCount, totalUsers }) => (
  <div className="search-section">
    <div className="search-container">
      <Search className="search-icon" size={20} />
      <input
        type="text"
        placeholder="Search by name, location, skills, or bio..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button 
          onClick={onClearSearch}
          className="search-clear"
          title="Clear search"
        >
          ×
        </button>
      )}
    </div>
    
    {/* Search Results Info */}
    {searchTerm && (
      <div className="search-results-info">
        <p className="search-results-text">
          Showing {resultCount} of {totalUsers} users for "{searchTerm}"
        </p>
      </div>
    )}
  </div>
);

// Loading State Component
const LoadingState = () => (
  <div className="loading-state">
    <div className="loading-spinner"></div>
    <p className="loading-text">Loading amazing people...</p>
  </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }) => (
  <div className="error-state">
    <div className="error-icon">⚠️</div>
    <p className="error-title">Something went wrong</p>
    <p className="error-message">{error}</p>
    <button onClick={onRetry} className="btn btn-primary">
      Try Again
    </button>
  </div>
);

// Empty State Component
const EmptyState = ({ hasUsers, searchTerm, onAddDemo, onClearSearch }) => {
  if (searchTerm) {
    // No search results
    return (
      <div className="empty-state">
        <Search className="empty-icon" size={64} />
        <p className="empty-title">No users found</p>
        <p className="empty-subtitle">
          Try adjusting your search terms or browse all users
        </p>
        <button onClick={onClearSearch} className="btn btn-primary">
          Show All Users
        </button>
      </div>
    );
  }
  
  if (!hasUsers) {
    // No users in database
    return (
      <div className="empty-state">
        <User className="empty-icon" size={64} />
        <p className="empty-title">No users yet</p>
        <p className="empty-subtitle">
          Be the first to connect! Add some demo users to get started.
        </p>
        <button onClick={onAddDemo} className="btn btn-primary">
          Add Demo Users
        </button>
      </div>
    );
  }

  // Has users but none visible (shouldn't happen)
  return (
    <div className="empty-state">
      <User className="empty-icon" size={64} />
      <p className="empty-title">No visible users</p>
      <p className="empty-subtitle">
        All users have private profiles.
      </p>
    </div>
  );
};

// Users Grid Component
const UsersGrid = ({ users, onSelectUser }) => (
  <div className="users-grid">
    {users.map(user => (
      <UserCard 
        key={user.uid} 
        user={user} 
        onViewProfile={() => onSelectUser(user)} 
      />
    ))}
  </div>
);

// Individual User Card Component
const UserCard = ({ user, onViewProfile }) => {
  // Calculate completion percentage
  const completionItems = [
    user.name,
    user.location,
    user.bio,
    user.skillsOffered?.length > 0,
    user.skillsWanted?.length > 0
  ];
  const completionPercentage = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100
  );

  return (
    <div className="user-card">
      {/* User Header */}
      <div className="user-header">
        <div className="user-avatar">
          {user.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="user-info">
          <h3 className="user-name">{user.name || 'Unknown User'}</h3>
          <div className="user-location">
            <MapPin size={14} />
            <span>{user.location || 'Location not set'}</span>
          </div>
          <div className="user-completion">
            <div className="completion-bar">
              <div 
                className="completion-fill" 
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
            <span className="completion-text">{completionPercentage}% complete</span>
          </div>
        </div>
      </div>
      
      {/* Skills Offered */}
      <SkillsSection 
        title="Offers"
        skills={user.skillsOffered}
        className="skill-offered"
        maxDisplay={3}
      />
      
      {/* Skills Wanted */}
      <SkillsSection 
        title="Wants"
        skills={user.skillsWanted}
        className="skill-wanted"
        maxDisplay={3}
      />
      
      {/* Bio Preview */}
      {user.bio && (
        <div className="user-bio-preview">
          <p className="bio-text">
            {user.bio.length > 80 ? `${user.bio.substring(0, 80)}...` : user.bio}
          </p>
        </div>
      )}
      
      {/* User Footer */}
      <div className="user-footer">
        <div className="user-stats">
          <div className="user-rating">
            <Star className="star-icon" size={14} />
            <span>{user.rating || 5.0}</span>
          </div>
          <div className="user-swaps">
            <span>{user.completedSwaps || 0} swaps</span>
          </div>
          <div className="user-availability">
            <span>{user.availability || 'flexible'}</span>
          </div>
        </div>
        <button
          onClick={onViewProfile}
          className="btn btn-primary btn-small"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

// Skills Section Component
const SkillsSection = ({ title, skills, className, maxDisplay = 3 }) => {
  if (!skills || skills.length === 0) {
    return (
      <div className="skills-section">
        <p className="skills-label">{title}:</p>
        <div className="skills-list">
          <span className="skill-tag skill-empty">None listed</span>
        </div>
      </div>
    );
  }

  const displaySkills = skills.slice(0, maxDisplay);
  const remainingCount = skills.length - maxDisplay;

  return (
    <div className="skills-section">
      <p className="skills-label">{title}:</p>
      <div className="skills-list">
        {displaySkills.map((skill, index) => (
          <span key={index} className={`skill-tag ${className}`}>
            {skill}
          </span>
        ))}
        {remainingCount > 0 && (
          <span className="skill-tag skill-more">
            +{remainingCount} more
          </span>
        )}
      </div>
    </div>
  );
};

export default HomePage;

/*
==============================================
WHAT THIS COMPONENT DOES:
==============================================
✅ Fetches REAL users from Firebase (no demo data)
✅ Real-time search by name, location, skills, bio
✅ Displays users in beautiful cards
✅ Shows loading, error, and empty states
✅ Filters out current user automatically
✅ Shows profile completion percentage
✅ Completely standalone (can work independently)

==============================================
WHAT STILL NEEDS TO BE CREATED:
==============================================
❌ ProfilePage.js - Standalone profile editing
❌ RequestsPage.js - Standalone requests management  
❌ UserDetailModal.js - User profile popup modal
❌ Update App.js - Import and use this HomePage
❌ Add CSS for new classes (completion-bar, search-clear, etc.)

==============================================
NEXT STEP: 
Create ProfilePage.js component OR update App.js to use this HomePage
==============================================
*/