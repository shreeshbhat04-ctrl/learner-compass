import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, TrendingUp } from 'lucide-react';

interface CourseProgress {
  courseId: string;
  courseTitle: string;
  progress: number;
}

interface ProgressChartProps {
  courses: CourseProgress[];
}

const ProgressChart = ({ courses }: ProgressChartProps) => {
  if (courses.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No course progress yet</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {courses.map((course) => (
        <Card key={course.courseId} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">{course.courseTitle}</span>
            </div>
            <span className="text-sm font-semibold text-primary">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </Card>
      ))}
    </div>
  );
};

export default ProgressChart;
