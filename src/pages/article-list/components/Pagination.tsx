import React from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) => {
  const pageSizeOptions = [
    { value: 10, label: '10 na stronę' },
    { value: 25, label: '25 na stronę' },
    { value: 50, label: '50 na stronę' },
    { value: 100, label: '100 na stronę' }
  ];

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); 
         i <= Math.min(totalPages - 1, currentPage + delta); 
         i++) {
      range?.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots?.push(1, '...');
    } else {
      rangeWithDots?.push(1);
    }

    rangeWithDots?.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots?.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots?.push(totalPages);
    }

    return rangeWithDots;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
        {/* Items Info */}
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            Wyświetlane {startItem}-{endItem} z {totalItems} artykułów
          </div>
          
          <Select
            options={pageSizeOptions}
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            className="w-40"
          />
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center space-x-2">
          {/* Previous Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
            iconPosition="left"
          >
            Poprzednia
          </Button>

          {/* Page Numbers */}
          <div className="hidden md:flex items-center space-x-1">
            {getVisiblePages()?.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="px-3 py-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    variant={currentPage === page ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className="min-w-10"
                  >
                    {page}
                  </Button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Mobile Page Info */}
          <div className="md:hidden flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Strona {currentPage} z {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
            iconPosition="right"
          >
            Następna
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;