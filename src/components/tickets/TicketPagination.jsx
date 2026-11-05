import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../common/Button';

export default function TicketPagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 5,
  totalItems = 0,
  onPageChange,
  onPageSizeChange
}) {
  const start = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className="ticket-pagination">
      <div className="pagination-left">
        <span className="pagination-info">
          Showing <strong>{start}</strong> to <strong>{end}</strong> of <strong>{totalItems}</strong> entries
        </span>

        {onPageSizeChange && (
          <div className="page-size-selector">
            <label htmlFor="pageSizeSelect" className="page-size-label">Per page:</label>
            <select
              id="pageSizeSelect"
              className="page-size-dropdown"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              <option value={5}>5 records</option>
              <option value={10}>10 records</option>
              <option value={20}>20 records</option>
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          icon={<ChevronLeft size={14} />}
        >
          Previous
        </Button>

        <span className="pagination-page-indicator">
          Page <strong>{currentPage}</strong> of <strong>{totalPages || 1}</strong>
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          icon={<ChevronRight size={14} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
