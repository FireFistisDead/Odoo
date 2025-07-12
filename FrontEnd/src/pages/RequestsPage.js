// src/components/pages/RequestsPage.js
import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { getSwapRequests } from '../../firebaseHelpers';

const RequestsPage = ({ currentUser }) => {
  const [swapRequests, setSwapRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load swap requests
  useEffect(() => {
    const loadRequests = async () => {
      if (!currentUser?.uid) return;
      
      setLoading(true);
      const result = await getSwapRequests(currentUser.uid);
      
      if (result.success) {
        setSwapRequests(result.requests);
      } else {
        console.error('Error loading requests:', result.error);
      }
      
      setLoading(false);
    };

    loadRequests();
  }, [currentUser?.uid]);

  if (loading) {
    return (
      <div className="page-container">
        <h2 className="page-title">Swap Requests</h2>
        <div className="loading-state">
          <p>Loading requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h2 className="page-title">Swap Requests</h2>
      
      {swapRequests.length === 0 ? (
        <EmptyRequestsState />
      ) : (
        <RequestsList requests={swapRequests} />
      )}
    </div>
  );
};

// Empty State Component
const EmptyRequestsState = () => (
  <div className="empty-state">
    <MessageCircle className="empty-icon" size={64} />
    <p className="empty-title">No swap requests yet</p>
    <p className="empty-subtitle">
      Start browsing users to send your first request!
    </p>
  </div>
);

// Requests List Component
const RequestsList = ({ requests }) => (
  <div className="requests-list">
    {requests.map(request => (
      <RequestCard key={request.id} request={request} />
    ))}
  </div>
);

// Individual Request Card Component
const RequestCard = ({ request }) => {
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date not available';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return 'status-pending';
    }
  };

  return (
    <div className="request-card">
      <div className="request-header">
        <div className="request-users">
          <div className="request-user">
            <div className="user-avatar small">
              {request.fromName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="user-name">{request.fromName || 'Unknown User'}</span>
          </div>
          
          <div className="request-arrow">→</div>
          
          <div className="request-user">
            <div className="user-avatar small">
              {request.toName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="user-name">{request.toName || 'Unknown User'}</span>
          </div>
        </div>
        
        <span className={`status-badge ${getStatusColor(request.status)}`}>
          {request.status || 'pending'}
        </span>
      </div>
      
      <div className="request-skills">
        <span className="skill-tag skill-offered">
          {request.mySkill || 'Unknown Skill'}
        </span>
        <span className="swap-icon">⇄</span>
        <span className="skill-tag skill-wanted">
          {request.theirSkill || 'Unknown Skill'}
        </span>
      </div>
      
      <div className="request-footer">
        <div className="request-meta">
          <span className="request-type">
            {request.type === 'sent' ? 'Sent by you' : 'Received'}
          </span>
          <span className="request-date">
            {formatDate(request.createdAt)}
          </span>
        </div>
        
        {request.status === 'pending' && request.type === 'received' && (
          <div className="request-actions">
            <button className="btn btn-success btn-small">
              Accept
            </button>
            <button className="btn btn-secondary btn-small">
              Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestsPage;