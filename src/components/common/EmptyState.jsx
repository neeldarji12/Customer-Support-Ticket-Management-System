import React from 'react';
import Button from './Button';

export default function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionText,
  onAction,
  icon = '📋'
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
