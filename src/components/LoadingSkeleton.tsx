import { Card } from '@/components/ui/card';

export const DashboardSkeleton = () => {
  return (
    <div className="space-y-6">
      <Card className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
          <div className="flex gap-4">
            <div className="h-16 bg-muted rounded w-32"></div>
            <div className="h-16 bg-muted rounded w-32"></div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export const VideoSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <div className="animate-pulse">
            <div className="aspect-video bg-muted"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export const BookSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-4">
          <div className="animate-pulse flex gap-4">
            <div className="w-24 h-32 bg-muted rounded"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-3 bg-muted rounded w-2/3"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
