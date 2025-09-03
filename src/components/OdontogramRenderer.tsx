import { TraditionalOdontogram } from './odontogram/TraditionalOdontogram';
import { AnatomicalOdontogram } from './odontogram/AnatomicalOdontogram';
import { InteractiveOdontogram } from './odontogram/InteractiveOdontogram';
import { MinimalistOdontogram } from './odontogram/MinimalistOdontogram';
import { DetailedClinicalOdontogram } from './odontogram/DetailedClinicalOdontogram';
import { useOdontogramPreference, OdontogramDesignType } from '@/hooks/useOdontogramPreference';

interface OdontogramRendererProps {
  designOverride?: OdontogramDesignType;
}

export function OdontogramRenderer({ designOverride }: OdontogramRendererProps) {
  const { selectedDesign } = useOdontogramPreference();
  const currentDesign = designOverride || selectedDesign;

  console.log('OdontogramRenderer - selectedDesign:', selectedDesign, 'designOverride:', designOverride, 'currentDesign:', currentDesign);

  switch (currentDesign) {
    case 'traditional':
      return <TraditionalOdontogram />;
    case 'anatomical':
      return <AnatomicalOdontogram />;
    case 'interactive':
      return <InteractiveOdontogram />;
    case 'minimalist':
      return <MinimalistOdontogram />;
    case 'clinical':
      return <DetailedClinicalOdontogram />;
    default:
      return <TraditionalOdontogram />;
  }
}