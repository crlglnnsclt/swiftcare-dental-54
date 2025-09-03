import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Building2 } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
}

// Demo data for testing
const demoBranches: Branch[] = [
  {
    id: '1',
    name: 'SwiftCare Downtown',
    address: '123 Main St, Downtown',
    phone: '(555) 123-4567'
  },
  {
    id: '2',
    name: 'SwiftCare Uptown',
    address: '456 Oak Ave, Uptown',
    phone: '(555) 234-5678'
  },
  {
    id: '3',
    name: 'SwiftCare Westside',
    address: '789 Pine Rd, Westside',
    phone: '(555) 345-6789'
  }
];

interface BranchSelectorProps {
  selectedBranch?: string;
  onBranchSelect: (branchId: string) => void;
}

export function BranchSelector({ selectedBranch, onBranchSelect }: BranchSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-3">
        <Building2 className="w-5 h-5 text-medical-blue" />
        <label className="text-sm font-medium text-foreground">Select Clinic Location</label>
      </div>
      
      <Select value={selectedBranch} onValueChange={onBranchSelect}>
        <SelectTrigger className="w-full btn-3d bg-card border-2 border-border/50 focus:border-medical-blue">
          <SelectValue placeholder="Choose your preferred clinic location" />
        </SelectTrigger>
        <SelectContent className="bg-card border-2 border-border/50">
          {demoBranches.map((branch) => (
            <SelectItem key={branch.id} value={branch.id} className="cursor-pointer">
              <div className="flex items-start gap-3 py-2">
                <MapPin className="w-4 h-4 text-medical-blue mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">{branch.name}</p>
                  <p className="text-sm text-muted-foreground">{branch.address}</p>
                  <p className="text-sm text-muted-foreground">{branch.phone}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}