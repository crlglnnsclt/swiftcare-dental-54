import { Button } from '@/components/ui/button';

interface QuickFillButtonsProps {
  onFillForm: (data: any) => void;
  type: 'signin' | 'signup';
}

// Test data removed - add your own data as needed
const testData: any[] = [];

export function QuickFillButtons({ onFillForm, type }: QuickFillButtonsProps) {
  return (
    <div className="mb-4 p-3 bg-muted/50 rounded-lg">
      <p className="text-xs font-medium mb-2">No test data available:</p>
      <p className="text-xs text-muted-foreground">Test data has been removed. Add your own authentication data as needed.</p>
    </div>
  );
}