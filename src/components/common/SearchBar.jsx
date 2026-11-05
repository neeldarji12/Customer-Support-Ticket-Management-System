import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search tickets, customers, IDs...',
  className = ''
}) {
  return (
    <div className={`search-bar-wrapper ${className}`}>
      <span className="search-bar-icon">
        <Search size={16} strokeWidth={2} />
      </span>
      <input
        type="text"
        className="search-bar-input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && onClear && (
        <button type="button" className="search-bar-clear" onClick={onClear} aria-label="Clear search">
          <X size={15} strokeWidth={2} />
        </button>
      )}
    </div>
  );
}
