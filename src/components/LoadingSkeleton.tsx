/**
 * Base skeleton component with shimmer animation
 */
export function LoadingSkeleton({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
    </div>
  );
}

/**
 * Card skeleton for card-based layouts
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-white rounded-lg border border-slate-200 p-6"
        >
          <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-200 rounded w-full"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-slate-200 rounded w-1/4"></div>
        </div>
      ))}
    </>
  );
}

/**
 * Table skeleton for table layouts
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-12 bg-slate-200 rounded flex-1"></div>
            <div className="h-12 bg-slate-200 rounded w-24"></div>
            <div className="h-12 bg-slate-200 rounded w-24"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form skeleton for form layouts
 */
export function FormSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <div className="animate-pulse space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
          <div className="h-10 bg-slate-200 rounded w-full"></div>
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <div className="h-10 bg-slate-200 rounded w-24"></div>
        <div className="h-10 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * List skeleton for list layouts
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-lg border border-slate-200">
          <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
          </div>
          <div className="h-8 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Profile skeleton for profile pages
 */
export function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="flex items-center gap-6">
        <div className="h-24 w-24 bg-slate-200 rounded-full"></div>
        <div className="flex-1 space-y-3">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-4 bg-slate-200 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Kanban skeleton for Kanban board layouts
 */
export function KanbanSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <div className="animate-pulse flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: columns }).map((_, colIndex) => (
        <div key={colIndex} className="flex-shrink-0 w-80 space-y-3">
          <div className="h-8 bg-slate-200 rounded w-1/2 mb-4"></div>
          {Array.from({ length: 3 }).map((_, cardIndex) => (
            <div
              key={cardIndex}
              className="bg-white rounded-lg border border-slate-200 p-4 space-y-3"
            >
              <div className="h-5 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 rounded w-16"></div>
                <div className="h-6 bg-slate-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Badge skeleton for badge displays
 */
export function BadgeSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="animate-pulse grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex flex-col items-center space-y-2">
          <div className="h-16 w-16 bg-slate-200 rounded-full"></div>
          <div className="h-4 bg-slate-200 rounded w-20"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Modal skeleton for modal content
 */
export function ModalSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-6">
      <div className="h-6 bg-slate-200 rounded w-1/3"></div>
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-slate-200 rounded w-full"></div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 justify-end pt-4">
        <div className="h-10 bg-slate-200 rounded w-24"></div>
        <div className="h-10 bg-slate-200 rounded w-24"></div>
      </div>
    </div>
  );
}

/**
 * CV Section skeleton for CV builder sections
 */
export function CVSectionSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-6 bg-slate-200 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 rounded w-32"></div>
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="h-5 bg-slate-200 rounded w-1/2"></div>
          <div className="h-4 bg-slate-200 rounded w-full"></div>
          <div className="h-4 bg-slate-200 rounded w-3/4"></div>
          <div className="flex gap-2">
            <div className="h-6 bg-slate-200 rounded w-20"></div>
            <div className="h-6 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

