import React from 'react';
import { getPriorityStyle } from '../../utils/ticketHelpers';

export default function PriorityBadge({ priority }) {
  const style = getPriorityStyle(priority);

  return (
    <span
      className="badge badge-priority"
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderColor: style.border
      }}
    >
      {priority}
    </span>
  );
}
