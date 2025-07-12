// src/components/layout/AppLayout.js
import React from 'react';
import { LogOut } from 'lucide-react';

const AppLayout = ({ 
  children, 
  currentScreen, 
  onNavigate, 
  onLogout, 
  swapRequestsCount = 0 
}) => {
  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1 className="brand-title">Grow Together</h1>
          </div>
          
          <div className="nav-menu">
            <button
              onClick={() => onNavigate('home')}
              className={`nav-item ${currentScreen === 'home' ? 'nav-item-active' : ''}`}
            >
              Browse
            </button>
            
            <button
              onClick={() => onNavigate('requests')}
              className={`nav-item ${currentScreen === 'requests' ? 'nav-item-active' : ''}`}
            >
              Requests
              {swapRequestsCount > 0 && (
                <span className="nav-badge">{swapRequestsCount}</span>
              )}
            </button>
            
            <button
              onClick={() => onNavigate('profile')}
              className={`nav-item ${currentScreen === 'profile' ? 'nav-item-active' : ''}`}
            >
              Profile
            </button>
            
            <button 
              onClick={onLogout} 
              className="nav-logout"
              title="Logout"
            >
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
};

export default AppLayout;