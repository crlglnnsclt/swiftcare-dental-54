import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QueueHeatmapProps {
  data: Array<{
    date: string;
    count: number;
  }>;
}

export const QueueHeatmap: React.FC<QueueHeatmapProps> = ({ data }) => {
  // Generate mock data for the past year with hourly queue patterns
  const generateHeatmapData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return days.map(day => ({
      day,
      hours: hours.map(hour => ({
        hour,
        value: Math.floor(Math.random() * 20) + (hour >= 8 && hour <= 17 ? 15 : 5)
      }))
    }));
  };

  const heatmapData = generateHeatmapData();

  const getIntensityColor = (value: number) => {
    if (value <= 5) return 'bg-green-100';
    if (value <= 10) return 'bg-yellow-100';
    if (value <= 15) return 'bg-orange-100';
    if (value <= 20) return 'bg-red-100';
    return 'bg-red-200';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Queue Heatmap - Busiest Hours
        </CardTitle>
        <CardDescription>
          Visual representation of queue density by day and hour
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Hour labels */}
          <div className="flex items-center">
            <div className="w-12 text-xs text-muted-foreground"></div>
            <div className="flex-1 grid grid-cols-24 gap-1">
              {Array.from({ length: 24 }, (_, i) => (
                <div key={i} className="text-xs text-center text-muted-foreground">
                  {i % 4 === 0 ? i : ''}
                </div>
              ))}
            </div>
          </div>

          {/* Heatmap grid */}
          <div className="space-y-1">
            {heatmapData.map((dayData) => (
              <div key={dayData.day} className="flex items-center">
                <div className="w-12 text-xs font-medium text-muted-foreground">
                  {dayData.day}
                </div>
                <div className="flex-1 grid grid-cols-24 gap-1">
                  {dayData.hours.map((hourData) => (
                    <div
                      key={hourData.hour}
                      className={`h-3 w-full rounded-sm ${getIntensityColor(hourData.value)} hover:ring-2 hover:ring-primary transition-all cursor-pointer`}
                      title={`${dayData.day} ${hourData.hour}:00 - ${hourData.value} patients`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between pt-4 border-t">
            <span className="text-sm text-muted-foreground">Less busy</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm bg-green-100"></div>
              <div className="h-3 w-3 rounded-sm bg-yellow-100"></div>
              <div className="h-3 w-3 rounded-sm bg-orange-100"></div>
              <div className="h-3 w-3 rounded-sm bg-red-100"></div>
              <div className="h-3 w-3 rounded-sm bg-red-200"></div>
            </div>
            <span className="text-sm text-muted-foreground">More busy</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};