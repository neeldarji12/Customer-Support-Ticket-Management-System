import React from 'react';
import { ArrowLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, actions, breadcrumbs, onBack }) {
  return (
    <div className="page-header">
      <div className="page-header-info">
        {onBack && (
          <button
            type="button"
            className="page-header-back-button"
            onClick={onBack}
            aria-label="Go back to previous page"
            title="Go back to previous page"
          >
            <ArrowLeft size={14} />
            <span>Back to previous page</span>
          </button>
        )}
        {breadcrumbs && <div className="page-breadcrumbs">{breadcrumbs}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
}
