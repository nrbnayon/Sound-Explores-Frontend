import { forwardRef } from "react";
import { cn } from "../../lib/utils";

const Checkbox = forwardRef(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type="checkbox"
          ref={ref}
          className="peer absolute h-0 w-0 opacity-0"
          checked={checked}
          onChange={(e) => onCheckedChange && onCheckedChange(e.target.checked)}
          {...props}
        />
        <div
          className={cn(
            "flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-primary shadow cursor-pointer",
            checked ? "bg-primary text-primary-foreground" : "opacity-50",
            className
          )}
          onClick={() => onCheckedChange && onCheckedChange(!checked)} // Toggle checked state on click
        >
          {checked && (
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 1L3.5 6.5L1 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
