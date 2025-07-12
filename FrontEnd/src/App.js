import React, { useState, useEffect } from 'react';
import { Search, Plus, Star, Calendar, MapPin, MessageCircle, LogOut, User, Settings, TrendingUp, Users, ArrowUp } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  updateUserProfile, 
  listenToUsers, 
  listenToUserProfile,
  createSwapRequest,
  getSwapRequests,
  seedDemoData,
  addFriend,
  acceptFriend,
  getFriends
} from './firebaseHelpers';
import './App.css';
import './styles/trending.css';

// Utility function to calculate skill match score
const calculateMatchScore = (user1, user2) => {
  if (!user1 || !user2) return 0;
  
  const user1Offered = user1.skillsOffered || [];
  const user1Wanted = user1.skillsWanted || [];
  const user2Offered = user2.skillsOffered || [];
  const user2Wanted = user2.skillsWanted || [];

  // Calculate matches in both directions
  const matchesForUser1 = user1Wanted.filter(skill => user2Offered.includes(skill)).length;
  const matchesForUser2 = user2Wanted.filter(skill => user1Offered.includes(skill)).length;

  // Calculate total possible matches
  const totalPossibleMatches = Math.max(
    user1Wanted.length + user2Wanted.length,
    1  // Avoid division by zero
  );

  // Calculate percentage
  return Math.round(((matchesForUser1 + matchesForUser2) / totalPossibleMatches) * 100);
};

// Utility function to calculate trending skills
const calculateTrendingSkills = (users) => {
  const skillCount = {};
  
  // Count occurrences of each skill
  users.forEach(user => {
    user.skillsOffered?.forEach(skill => {
      skillCount[skill] = (skillCount[skill] || 0) + 1;
    });
  });

  // Convert to array and sort by count
  const trendingSkills = Object.entries(skillCount)
    .map(([skill, count]) => ({
      skill,
      count,
      mentors: users.filter(user => user.skillsOffered?.includes(skill))
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 trending skills

  return trendingSkills;
};

const SkillSwapPlatform = () => {
  // State Management
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('login');
  const [swapRequests, setSwapRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [friends, setFriends] = useState([]);

  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    availability: 'weekends'
  });
  const [profileForm, setProfileForm] = useState({
    name: '',
    location: '',
    skillsOffered: [],
    skillsWanted: [],
    availability: 'weekends',
    isPublic: true,
    bio: ''
  });

  // Auth State Listener
  useEffect(() => {
    let unsubscribeProfile = null;
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Listen to user profile changes
        unsubscribeProfile = listenToUserProfile(user.uid, (userData) => {
          setCurrentUser(userData);
          setCurrentScreen('home');
          setLoading(false);
        });
      } else {
        setCurrentUser(null);
        setCurrentScreen('login');
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  // Listen to all users
  useEffect(() => {
    let unsubscribe = null;
    
    if (currentUser) {
      unsubscribe = listenToUsers((usersData) => {
        // Filter out current user
        const filteredUsers = usersData.filter(user => user.uid !== currentUser.uid);
        setUsers(filteredUsers);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser?.uid]); // Only depend on uid, not the whole user object

  // Load swap requests
  useEffect(() => {
    if (currentUser) {
      loadSwapRequests();
    }
  }, [currentUser]);

  const loadSwapRequests = async () => {
    if (!currentUser) return;
    
    const result = await getSwapRequests(currentUser.uid);
    if (result.success) {
      setSwapRequests(result.requests);
    }
  };

  // Load friends
  useEffect(() => {
    if (currentUser) {
      loadFriends();
    }
  }, [currentUser]);

  const loadFriends = async () => {
    if (!currentUser) return;
    
    const result = await getFriends(currentUser.uid);
    if (result.success) {
      setFriends(result.friends);
    }
  };

  // Seed demo data (for testing)
  const handleSeedDemo = async () => {
    const result = await seedDemoData();
    if (result.success) {
      alert('Demo data added successfully! 🎉');
    } else {
      alert('Error seeding demo data: ' + result.error);
    }
  };

  // Authentication Functions
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginUser(loginForm.email, loginForm.password);
    
    if (result.success) {
      // Auth state listener will handle the rest
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await registerUser(registerForm.email, registerForm.password, registerForm);
    
    if (result.success) {
      // Auth state listener will handle the rest
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    const result = await logoutUser();
    if (result.success) {
      setCurrentUser(null);
      setUsers([]);
      setSwapRequests([]);
      setCurrentScreen('login');
    }
  };

  // Profile Management
  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await updateUserProfile(currentUser.uid, profileForm);
    
    if (result.success) {
      setCurrentScreen('home');
      alert('Profile updated successfully! 🎉');
    } else {
      alert('Error updating profile: ' + result.error);
    }
    setLoading(false);
  };

  const addSkill = (type, skill) => {
    if (!skill.trim()) return;
    
    if (type === 'offered') {
      setProfileForm({
        ...profileForm,
        skillsOffered: [...profileForm.skillsOffered, skill.trim()]
      });
    } else {
      setProfileForm({
        ...profileForm,
        skillsWanted: [...profileForm.skillsWanted, skill.trim()]
      });
    }
  };

  const removeSkill = (type, index) => {
    if (type === 'offered') {
      setProfileForm({
        ...profileForm,
        skillsOffered: profileForm.skillsOffered.filter((_, i) => i !== index)
      });
    } else {
      setProfileForm({
        ...profileForm,
        skillsWanted: profileForm.skillsWanted.filter((_, i) => i !== index)
      });
    }
  };

  // Swap Request Functions
  const sendSwapRequest = async (targetUser, mySkill, theirSkill) => {
    const requestData = {
      fromUid: currentUser.uid,
      fromName: currentUser.name,
      toUid: targetUser.uid,
      toName: targetUser.name,
      mySkill,
      theirSkill,
    };

    const result = await createSwapRequest(requestData);
    
    if (result.success) {
      alert(`Swap request sent to ${targetUser.name}! 🚀`);
      loadSwapRequests(); // Refresh requests
    } else {
      alert('Error sending request: ' + result.error);
    }
  };

  const handleAddFriend = async (friendId) => {
    if (!currentUser) return;
    
    const result = await addFriend(currentUser.uid, friendId);
    if (result.success) {
      alert('Friend request sent! 🤝');
      loadFriends();
    } else {
      alert('Error sending friend request: ' + result.error);
    }
  };

  const handleAcceptFriend = async (friendId) => {
    if (!currentUser) return;
    
    const result = await acceptFriend(currentUser.uid, friendId);
    if (result.success) {
      alert('Friend request accepted! 🎉');
      loadFriends();
    } else {
      alert('Error accepting friend request: ' + result.error);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.skillsOffered?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.skillsWanted?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Loading Screen
  if (loading) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1 className="auth-title">Grow Together</h1>
            <p className="auth-subtitle">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Login Screen
  const LoginScreen = () => (
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
        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={loginForm.email}
              onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={loginForm.password}
              onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="auth-text">
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentScreen('register')}
              className="auth-link"
            >
              Sign Up
            </button>
          </p>
        </div>
        
        <div className="demo-account">
          <p className="demo-text">Try the demo:</p>
          <button onClick={handleSeedDemo} className="btn btn-secondary btn-small">
            Add Demo Users
          </button>
        </div>
      </div>
    </div>
  );

  // Register Screen
  const RegisterScreen = () => (
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
        
        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={registerForm.name}
              onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
              className="form-input"
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={registerForm.email}
              onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
              className="form-input"
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
              className="form-input"
              placeholder="Create a password (min 6 characters)"
              minLength="6"
              required
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Location (Optional)</label>
            <input
              type="text"
              value={registerForm.location}
              onChange={(e) => setRegisterForm({...registerForm, location: e.target.value})}
              className="form-input"
              placeholder="City, Country"
            />
          </div>
          
          <div className="form-group">
            <label className="form-label">Availability</label>
            <select
              value={registerForm.availability}
              onChange={(e) => setRegisterForm({...registerForm, availability: e.target.value})}
              className="form-select"
            >
              <option value="weekends">Weekends</option>
              <option value="evenings">Evenings</option>
              <option value="weekdays">Weekdays</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          
          <button type="submit" className="btn btn-secondary btn-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="auth-text">
            Already have an account?{' '}
            <button
              onClick={() => setCurrentScreen('login')}
              className="auth-link"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );

  // Main App Layout
  const AppLayout = ({ children }) => (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="brand-title">Grow Together</h1>
          </div>
          
          <div className="nav-menu">
            <button
              onClick={() => setCurrentScreen('home')}
              className={`nav-item ${currentScreen === 'home' ? 'nav-item-active' : ''}`}
            >
              Browse
            </button>
            <button
              onClick={() => setCurrentScreen('requests')}
              className={`nav-item ${currentScreen === 'requests' ? 'nav-item-active' : ''}`}
            >
              Requests
              {swapRequests.length > 0 && (
                <span className="nav-badge">{swapRequests.length}</span>
              )}
            </button>
            <button
              onClick={() => {
                setProfileForm({
                  name: currentUser.name || '',
                  location: currentUser.location || '',
                  skillsOffered: currentUser.skillsOffered || [],
                  skillsWanted: currentUser.skillsWanted || [],
                  availability: currentUser.availability || 'weekends',
                  isPublic: currentUser.isPublic !== false,
                  bio: currentUser.bio || ''
                });
                setCurrentScreen('profile');
              }}
              className={`nav-item ${currentScreen === 'profile' ? 'nav-item-active' : ''}`}
            >
              Profile
            </button>
            <button onClick={handleLogout} className="nav-logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>
      
      <main className="main-content">
        {children}
      </main>
    </div>
  );

  // Home Screen - Browse Users
  const TrendingSkills = ({ users, onSkillClick }) => {
    const trendingSkills = calculateTrendingSkills(users);
    
    return (
      <div className="trending-skills">
        <h3 className="trending-title">
          <TrendingUp size={24} className="trending-icon" />
          Trending Skills
        </h3>
        <div className="trending-grid">
          {trendingSkills.map(({ skill, count, mentors }) => (
            <div key={skill} className="trending-card" onClick={() => onSkillClick(skill, mentors)}>
              <div className="trending-skill-name">{skill}</div>
              <div className="trending-stats">
                <span className="mentor-count">
                  <Users size={14} />
                  {mentors.length} mentors
                </span>
                <span className="trending-count">
                  <ArrowUp size={14} />
                  {count} offering
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const RecommendedFriends = ({ users, currentUser, friends, onAddFriend }) => {
    // Filter out current user and existing friends
    const friendIds = friends.map(f => f.id);
    const potentialFriends = users
      .filter(user => user.uid !== currentUser?.uid && !friendIds.includes(user.uid))
      .map(user => ({
        ...user,
        matchScore: calculateMatchScore(currentUser, user)
      }))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3); // Show top 3 recommendations
    
    return (
      <div className="recommended-friends">
        <h3 className="recommended-title">
          <Users size={24} className="recommended-icon" />
          Recommended Friends
        </h3>
        <div className="recommended-grid">
          {potentialFriends.map(user => (
            <div key={user.uid} className="recommended-card">
              <div className="recommended-user">
                <div className="user-avatar small">
                  {user.name?.charAt(0) || 'U'}
                </div>
                <div className="recommended-info">
                  <h4>{user.name}</h4>
                  <div className="match-score">
                    <Star size={14} />
                    {user.matchScore}% Match
                  </div>
                </div>
              </div>
              <div className="recommended-skills">
                <div className="skills-list">
                  {user.skillsOffered?.slice(0, 2).map((skill, index) => (
                    <span key={index} className="skill-tag skill-offered">{skill}</span>
                  ))}
                </div>
              </div>
              <button
                onClick={() => onAddFriend(user.uid)}
                className="btn btn-primary btn-small"
              >
                Add Friend
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const HomeScreen = () => {
    const [selectedTrendingSkill, setSelectedTrendingSkill] = useState(null);
    const [trendingMentors, setTrendingMentors] = useState([]);

    const handleTrendingSkillClick = (skill, mentors) => {
      setSelectedTrendingSkill(skill);
      setTrendingMentors(mentors);
      setSearchTerm(skill); // Update search to show relevant users
    };

    return (
      <AppLayout>
        <div className="page-container">
          <div className="welcome-section">
            <h2 className="welcome-title">Welcome back, {currentUser?.name}! 🚀</h2>
            <p className="welcome-subtitle">Discover amazing skills and share your expertise with the community.</p>
          </div>

          <div className="dashboard-grid">
            <RecommendedFriends 
              users={users}
              currentUser={currentUser}
              friends={friends}
              onAddFriend={handleAddFriend}
            />

            <TrendingSkills 
              users={users} 
              onSkillClick={handleTrendingSkillClick}
            />
          </div>

          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="empty-state">
              <User className="empty-icon" size={64} />
              <p className="empty-title">No users found</p>
              <p className="empty-subtitle">Try adjusting your search or add some demo users!</p>
              <button onClick={handleSeedDemo} className="btn btn-primary">
                Add Demo Users
              </button>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map(user => (
                <div key={user.uid} className="user-card">
                  <div className="user-header">
                    <div className="user-avatar">
                      {user.name?.charAt(0) || 'U'}
                    </div>
                    <div className="user-info">
                      <h3 className="user-name">{user.name}</h3>
                      <div className="user-location">
                        <MapPin size={16} />
                        {user.location || 'Location not set'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="skills-section">
                    <p className="skills-label">Offers:</p>
                    <div className="skills-list">
                      {user.skillsOffered?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag skill-offered">
                          {skill}
                        </span>
                      )) || <span className="skill-tag skill-more">No skills listed</span>}
                      {user.skillsOffered?.length > 3 && (
                        <span className="skill-tag skill-more">+{user.skillsOffered.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="skills-section">
                    <p className="skills-label">Wants:</p>
                    <div className="skills-list">
                      {user.skillsWanted?.slice(0, 3).map((skill, index) => (
                        <span key={index} className="skill-tag skill-wanted">
                          {skill}
                        </span>
                      )) || <span className="skill-tag skill-more">No skills listed</span>}
                      {user.skillsWanted?.length > 3 && (
                        <span className="skill-tag skill-more">+{user.skillsWanted.length - 3}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="user-footer">
                    <div className="user-rating">
                      <Star className="star-icon" size={16} />
                      <span>{user.rating || 5.0}</span>
                    </div>
                    <div className="match-score" title="Skill Match Score">
                      <span className="match-label">Match:</span>
                      <span className="match-value">{calculateMatchScore(currentUser, user)}%</span>
                    </div>
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="btn btn-primary btn-small"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </AppLayout>
    );
  };

  // Profile Screen
  const ProfileScreen = () => {
    const [newSkillOffered, setNewSkillOffered] = useState('');
    const [newSkillWanted, setNewSkillWanted] = useState('');

    return (
      <AppLayout>
        <div className="profile-container">
          <div className="profile-card">
            <h2 className="profile-title">Edit Profile</h2>
            
            <form onSubmit={updateProfile} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                    className="form-input"
                    placeholder="City, Country"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                  className="form-textarea"
                  rows="3"
                  placeholder="Tell others about yourself..."
                />
              </div>
              
              <div className="skills-manager">
                <label className="form-label">Skills I Offer</label>
                <div className="skill-input-group">
                  <input
                    type="text"
                    value={newSkillOffered}
                    onChange={(e) => setNewSkillOffered(e.target.value)}
                    className="form-input"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addSkill('offered', newSkillOffered);
                      setNewSkillOffered('');
                    }}
                    className="btn btn-success btn-icon"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="skills-list">
                  {profileForm.skillsOffered.map((skill, index) => (
                    <span key={index} className="skill-tag skill-offered skill-removable">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('offered', index)}
                        className="skill-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="skills-manager">
                <label className="form-label">Skills I Want to Learn</label>
                <div className="skill-input-group">
                  <input
                    type="text"
                    value={newSkillWanted}
                    onChange={(e) => setNewSkillWanted(e.target.value)}
                    className="form-input"
                    placeholder="Add a skill..."
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addSkill('wanted', newSkillWanted);
                      setNewSkillWanted('');
                    }}
                    className="btn btn-primary btn-icon"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="skills-list">
                  {profileForm.skillsWanted.map((skill, index) => (
                    <span key={index} className="skill-tag skill-wanted skill-removable">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill('wanted', index)}
                        className="skill-remove"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select
                    value={profileForm.availability}
                    onChange={(e) => setProfileForm({...profileForm, availability: e.target.value})}
                    className="form-select"
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
                      checked={profileForm.isPublic}
                      onChange={(e) => setProfileForm({...profileForm, isPublic: e.target.checked})}
                      className="checkbox-input"
                    />
                    <span className="checkbox-label">Make my profile public</span>
                  </label>
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        </div>
      </AppLayout>
    );
  };

  // Requests Screen
  const RequestsScreen = () => (
    <AppLayout>
      <div className="page-container">
        <h2 className="page-title">Swap Requests</h2>
        
        {swapRequests.length === 0 ? (
          <div className="empty-state">
            <MessageCircle className="empty-icon" size={64} />
            <p className="empty-title">No swap requests yet</p>
            <p className="empty-subtitle">Start browsing users to send your first request!</p>
          </div>
        ) : (
          <div className="requests-list">
            {swapRequests.map(request => (
              <div key={request.id} className="request-card">
                <div className="request-header">
                  <div className="request-users">
                    <div className="request-user">
                      <div className="user-avatar small">
                        {request.fromName?.charAt(0) || 'U'}
                      </div>
                      <span className="user-name">{request.fromName}</span>
                    </div>
                    <div className="request-arrow">→</div>
                    <div className="request-user">
                      <div className="user-avatar small">
                        {request.toName?.charAt(0) || 'U'}
                      </div>
                      <span className="user-name">{request.toName}</span>
                    </div>
                  </div>
                  <span className={`status-badge status-${request.status}`}>
                    {request.status}
                  </span>
                </div>
                <div className="request-skills">
                  <span className="skill-tag skill-offered">{request.mySkill}</span>
                  <span className="swap-icon">⇄</span>
                  <span className="skill-tag skill-wanted">{request.theirSkill}</span>
                </div>
                <div className="request-type">
                  <small>{request.type === 'sent' ? 'Sent by you' : 'Received'}</small>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );

  // User Detail Modal (same as before but with Firebase user structure)
  const UserDetailModal = ({ user, onClose }) => (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-user-info">
            <div className="user-avatar large">
              {user.name?.charAt(0) || 'U'}
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

        {user.bio && (
          <div className="modal-section">
            <h3 className="section-title">About</h3>
            <p className="user-bio">{user.bio}</p>
          </div>
        )}

        <div className="modal-skills">
          <div className="skills-column">
            <h3 className="section-title">Skills Offered</h3>
            <div className="skills-interactive">
              {user.skillsOffered?.length > 0 ? user.skillsOffered.map((skill, index) => (
                <div key={index} className="skill-interactive">
                  <span className="skill-tag skill-offered">{skill}</span>
                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      const myWantedSkills = currentUser.skillsWanted || [];
                      if (myWantedSkills.includes(skill)) {
                        const mySkill = prompt(`Which of your skills would you like to offer in exchange for ${skill}?\n\nYour skills: ${(currentUser.skillsOffered || []).join(', ')}`);
                        if (mySkill && (currentUser.skillsOffered || []).includes(mySkill)) {
                          sendSwapRequest(user, mySkill, skill);
                          onClose();
                        }
                      } else {
                        alert(`Add "${skill}" to your wanted skills first to request a swap!`);
                      }
                    }}
                    className="btn btn-success btn-small"
                  >
                    Request
                  </button>
                </div>
              )) : <p>No skills offered yet</p>}
            </div>
          </div>

          <div className="skills-column">
            <h3 className="section-title">Skills Wanted</h3>
            <div className="skills-interactive">
              {user.skillsWanted?.length > 0 ? user.skillsWanted.map((skill, index) => (
                <div key={index} className="skill-interactive">
                  <span className="skill-tag skill-wanted">{skill}</span>
                  <button
                    onClick={() => {
                      if (!currentUser) return;
                      const myOfferedSkills = currentUser.skillsOffered || [];
                      if (myOfferedSkills.includes(skill)) {
                        const theirSkill = prompt(`Which skill would you like to learn from ${user.name}?\n\nTheir skills: ${(user.skillsOffered || []).join(', ')}`);
                        if (theirSkill && (user.skillsOffered || []).includes(theirSkill)) {
                          sendSwapRequest(user, skill, theirSkill);
                          onClose();
                        }
                      } else {
                        alert(`You don't offer "${skill}". Add it to your offered skills first!`);
                      }
                    }}
                    className="btn btn-primary btn-small"
                  >
                    Offer
                  </button>
                </div>
              )) : <p>No skills wanted yet</p>}
            </div>
          </div>
        </div>

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
      </div>
    </div>
  );

  // Main App Render
  if (currentScreen === 'login') {
    return <LoginScreen />;
  }

  if (currentScreen === 'register') {
    return <RegisterScreen />;
  }

  return (
    <>
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'profile' && <ProfileScreen />}
      {currentScreen === 'requests' && <RequestsScreen />}
      
      {selectedUser && (
        <UserDetailModal 
          user={selectedUser} 
          onClose={() => setSelectedUser(null)} 
        />
      )}
    </>
  );
};

export default SkillSwapPlatform;