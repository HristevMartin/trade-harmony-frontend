const JobCardSkeleton = () => {
  return (
    <div className="bg-card rounded-xl border border-border/60 shadow-sm overflow-hidden animate-pulse">
      {/* Header Row */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-6 w-16 bg-muted rounded-full"></div>
          <div className="h-4 w-12 bg-muted rounded"></div>
        </div>
      </div>

      <div className="px-4 pb-4">
        {/* Title and Description */}
        <div className="mb-4">
          <div className="h-6 w-3/4 bg-muted rounded mb-2"></div>
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted rounded"></div>
            <div className="h-4 w-2/3 bg-muted rounded"></div>
          </div>
        </div>

        {/* Image Thumbnail */}
        <div className="mb-4">
          <div className="aspect-video rounded-lg bg-muted"></div>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-16 bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-20 bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-12 bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-muted rounded"></div>
            <div className="h-4 w-16 bg-muted rounded"></div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/40">
          <div className="flex items-center gap-2">
            <div className="h-8 w-24 bg-muted rounded"></div>
            <div className="h-8 w-16 bg-muted rounded"></div>
            <div className="h-8 w-16 bg-muted rounded"></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 bg-muted rounded"></div>
            <div className="h-8 w-8 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardSkeleton;
