import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthContext';

interface SharingGroup {
  id: string;
  main_clinic_id: string;
  group_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

interface GroupMember {
  id: string;
  branch_id: string;
  group_id: string;
  joined_at: string;
  clinics?: {
    clinic_name: string;
    address?: string;
  };
}

interface Branch {
  id: string;
  clinic_name: string;
  address?: string;
  sharing_enabled: boolean;
  default_sharing_group_id?: string;
}

export function useBranchSharing() {
  const [sharingGroups, setSharingGroups] = useState<SharingGroup[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, profile } = useAuth();

  const fetchSharingGroups = async () => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('branch_sharing_groups')
        .select('*')
        .eq('main_clinic_id', profile.clinic_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching sharing groups:', error);
        return;
      }

      setSharingGroups(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchGroupMembers = async () => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('branch_group_members')
        .select(`
          *,
          clinics!branch_id (
            clinic_name,
            address
          )
        `)
        .order('joined_at', { ascending: false });

      if (error) {
        console.error('Error fetching group members:', error);
        return;
      }

      setGroupMembers(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAvailableBranches = async () => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('id, clinic_name, address, sharing_enabled, default_sharing_group_id')
        .or(`parent_clinic_id.eq.${profile.clinic_id},id.eq.${profile.clinic_id}`)
        .order('clinic_name');

      if (error) {
        console.error('Error fetching branches:', error);
        return;
      }

      setAvailableBranches(data || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const createSharingGroup = async (groupData: { group_name: string; description?: string }) => {
    if (!user || !profile) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase
        .from('branch_sharing_groups')
        .insert([{
          main_clinic_id: profile.clinic_id,
          group_name: groupData.group_name,
          description: groupData.description,
          created_by: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      await fetchSharingGroups();
      return { success: true, data };
    } catch (error) {
      console.error('Error creating sharing group:', error);
      return { success: false, error };
    }
  };

  const addBranchToGroup = async (branchId: string, groupId: string) => {
    try {
      const { error } = await supabase
        .from('branch_group_members')
        .insert([{
          branch_id: branchId,
          group_id: groupId
        }]);

      if (error) throw error;

      await fetchGroupMembers();
      return { success: true };
    } catch (error) {
      console.error('Error adding branch to group:', error);
      return { success: false, error };
    }
  };

  const removeBranchFromGroup = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('branch_group_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      await fetchGroupMembers();
      return { success: true };
    } catch (error) {
      console.error('Error removing branch from group:', error);
      return { success: false, error };
    }
  };

  const toggleBranchSharing = async (branchId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('clinics')
        .update({ sharing_enabled: enabled })
        .eq('id', branchId);

      if (error) throw error;

      await fetchAvailableBranches();
      return { success: true };
    } catch (error) {
      console.error('Error toggling branch sharing:', error);
      return { success: false, error };
    }
  };

  const deleteSharingGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('branch_sharing_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      await fetchSharingGroups();
      await fetchGroupMembers();
      return { success: true };
    } catch (error) {
      console.error('Error deleting sharing group:', error);
      return { success: false, error };
    }
  };

  const logDataAccess = async (targetBranchId: string, dataType: string, dataId: string, actionType: string) => {
    if (!user || !profile) return;

    try {
      const userAgent = navigator.userAgent;
      
      await supabase
        .from('data_sharing_audit')
        .insert([{
          user_id: user.id,
          source_branch_id: profile.clinic_id,
          target_branch_id: targetBranchId,
          data_type: dataType,
          data_id: dataId,
          action_type: actionType,
          user_agent: userAgent
        }]);
    } catch (error) {
      console.error('Error logging data access:', error);
    }
  };

  useEffect(() => {
    if (user && profile?.role === 'clinic_admin') {
      Promise.all([
        fetchSharingGroups(),
        fetchGroupMembers(),
        fetchAvailableBranches()
      ]).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, profile]);

  return {
    sharingGroups,
    groupMembers,
    availableBranches,
    loading,
    createSharingGroup,
    addBranchToGroup,
    removeBranchFromGroup,
    toggleBranchSharing,
    deleteSharingGroup,
    logDataAccess,
    refetch: () => {
      fetchSharingGroups();
      fetchGroupMembers();
      fetchAvailableBranches();
    }
  };
}