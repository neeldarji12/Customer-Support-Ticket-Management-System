import React from 'react';

export default function Loader({ size = 'md', text = 'Loading...' }) {
  return (
    <div className="loader-container">
      <div className={`spinner spinner-${size}`}></div>
      {text && <span className="loader-text">{text}</span>}
    </div>
  );
}
