import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound({ onNavigate }) {
  const navigate = useNavigate();

  const handleHome = () => {
    if (onNavigate) {
      onNavigate('dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-desc">
          The page or support ticket you are looking for does not exist or has been moved.
        </p>
        <Button variant="primary" onClick={handleHome}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}
