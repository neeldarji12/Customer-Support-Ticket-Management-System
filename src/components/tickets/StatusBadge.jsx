import React from 'react';
import { getStatusStyle } from '../../utils/ticketHelpers';

export default function StatusBadge({ status }) {
  const style = getStatusStyle(status);
  const formatted = (status || '').replace('_', ' ');

  return (
    <span
      className="badge badge-status"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border
      }}
    >
      {formatted}
    </span>
  );
}
