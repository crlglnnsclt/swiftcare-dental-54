import { ReactNode } from 'react';
import { EnhancedDashboardStats } from '@/components/EnhancedDashboardStats';
import { QuickActions } from '@/components/QuickActions';

interface DashboardLayoutProps {
  children: ReactNode;
  showStats?: boolean;
  showQuickActions?: boolean;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ 
  children, 
  showStats = true, 
  showQuickActions = true,
  title,
  subtitle 
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/10 to-secondary/5 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-2">{subtitle}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        {showStats && <EnhancedDashboardStats />}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {children}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {showQuickActions && <QuickActions />}
          </div>
        </div>
      </div>
    </div>
  );
}