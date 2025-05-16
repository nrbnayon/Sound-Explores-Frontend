// src\components\ui\pagination.jsx
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./button";

const Pagination = ({ totalPages, currentPage, onPageChange }) => {
  // Generate page numbers array based on current page and total
  const getPageNumbers = () => {
    const delta = 1; // Number of pages to show before and after current page
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      // Always include first and last page, pages around current page
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    // Add dots between page numbers when there are gaps
    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          // If gap is just one number, show the number instead of dots
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          // If gap is more than one number, show dots
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  // Handle page change with boundary check
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous page button */}
      <Button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
      >
        <ChevronLeft size={16} />
        <span className="sr-only">Previous page</span>
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) => (
        <Button
          key={index}
          onClick={() => (page !== "..." ? handlePageChange(page) : null)}
          variant={currentPage === page ? "default" : "outline"}
          size="sm"
          className={`w-8 h-8 ${page === "..." ? "cursor-default" : ""}`}
        >
          {page}
        </Button>
      ))}

      {/* Next page button */}
      <Button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
      >
        <ChevronRight size={16} />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
};

export default Pagination;
