import React from 'react';

export default function Button({
  children,
  variant = 'primary', // primary, secondary, outline, danger, ghost
  size = 'md', // sm, md, lg
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {Icon && <span className="btn-icon">{typeof Icon === 'function' ? <Icon /> : Icon}</span>}
      <span>{children}</span>
    </button>
  );
}
