import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeatureToggle {
  feature_name: string;
  is_enabled: boolean;
}

export const useFeatureToggle = (featureName: string): boolean => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatureToggle = async () => {
      try {
        const { data, error } = await supabase
          .from('feature_toggles')
          .select('is_enabled')
          .eq('feature_name', featureName)
          .single();

        if (error) {
          console.warn(`Feature toggle ${featureName} not found, defaulting to false`);
          setIsEnabled(false);
        } else {
          setIsEnabled(data.is_enabled);
        }
      } catch (error) {
        console.error(`Error fetching feature toggle ${featureName}:`, error);
        setIsEnabled(false);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatureToggle();

    // Set up real-time subscription for feature toggle changes
    const channel = supabase
      .channel(`feature_toggle_${featureName}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'feature_toggles',
          filter: `feature_name=eq.${featureName}`,
        },
        (payload) => {
          if (payload.new) {
            setIsEnabled((payload.new as FeatureToggle).is_enabled);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [featureName]);

  return loading ? false : isEnabled;
};