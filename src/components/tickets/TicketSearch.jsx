import React from 'react';
import SearchBar from '../common/SearchBar';

export default function TicketSearch({ search, onSearchChange }) {
  return (
    <SearchBar
      value={search}
      onChange={onSearchChange}
      onClear={() => onSearchChange('')}
      placeholder="Search tickets by ID, title, or customer..."
    />
  );
}
