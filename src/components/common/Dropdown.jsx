import React, { useState, useRef, useEffect, useCallback } from 'react';

export default function Dropdown({
  trigger,
  children,
  align = 'right',
  closeOnClick = true,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleDropdown = useCallback((e) => {
    e.stopPropagation();
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        closeDropdown();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeDropdown]);

  const handleMenuClick = (e) => {
    if (closeOnClick) {
      closeDropdown();
    } else {
      e.stopPropagation();
    }
  };

  return (
    <div className={`dropdown ${className} ${isOpen ? 'is-open' : ''}`} ref={containerRef}>
      <div onClick={toggleDropdown} className="dropdown-trigger" role="button" aria-haspopup="true" aria-expanded={isOpen}>
        {typeof trigger === 'function' ? trigger({ isOpen, toggle: toggleDropdown }) : trigger}
      </div>
      {isOpen && (
        <div
          className={`dropdown-menu dropdown-${align}`}
          onClick={handleMenuClick}
          role="menu"
        >
          {typeof children === 'function' ? children({ close: closeDropdown }) : children}
        </div>
      )}
    </div>
  );
}
