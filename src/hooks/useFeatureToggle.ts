import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FeatureToggleState {
  [key: string]: boolean;
}

interface FeatureToggleReturn {
  isEnabled: boolean;
  loading: boolean;
  toggleFeature: (featureName: string, enabled: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
}

interface AllFeaturesReturn {
  features: FeatureToggleState;
  loading: boolean;
  isFeatureEnabled: (name: string) => boolean;
  toggleFeature: (featureName: string, enabled: boolean) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export const useFeatureToggle = (featureName?: string): FeatureToggleReturn | AllFeaturesReturn => {
  const [features, setFeatures] = useState<FeatureToggleState>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeatureToggles();
  }, []);

  const fetchFeatureToggles = async () => {
    try {
      const { data, error } = await supabase
        .from('feature_toggles')
        .select('feature_name, is_enabled');

      if (error) {
        console.error('Error fetching feature toggles:', error);
        return;
      }

      const featureMap: FeatureToggleState = {};
      data?.forEach(feature => {
        featureMap[feature.feature_name] = feature.is_enabled;
      });

      console.log('useFeatureToggle: Loaded features from database:', featureMap);
      setFeatures(featureMap);
    } catch (error) {
      console.error('Error fetching feature toggles:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFeature = async (featureName: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('feature_toggles')
        .update({ 
          is_enabled: enabled,
          updated_at: new Date().toISOString()
        })
        .eq('feature_name', featureName);

      if (error) {
        console.error('Error updating feature toggle:', error);
        return false;
      }

      // Update local state
      setFeatures(prev => ({
        ...prev,
        [featureName]: enabled
      }));

      return true;
    } catch (error) {
      console.error('Error updating feature toggle:', error);
      return false;
    }
  };

  const isFeatureEnabled = (name: string) => {
    const enabled = features[name] || false;
    console.log(`useFeatureToggle: Feature '${name}' is ${enabled ? 'enabled' : 'disabled'}`);
    return enabled;
  };

  // If a specific feature name is provided, return just that feature's status
  if (featureName) {
    return {
      isEnabled: isFeatureEnabled(featureName),
      loading,
      toggleFeature,
      refresh: fetchFeatureToggles
    } as FeatureToggleReturn;
  }

  // Otherwise return all features
  return {
    features,
    loading,
    isFeatureEnabled,
    toggleFeature,
    refresh: fetchFeatureToggles
  } as AllFeaturesReturn;
};
