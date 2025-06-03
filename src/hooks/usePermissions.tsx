
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'owner' | 'employee';

export interface UserPermissions {
  role: UserRole;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewReports: boolean;
  canManageTeam: boolean;
}

const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  owner: {
    role: 'owner',
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canViewReports: true,
    canManageTeam: true,
  },
  employee: {
    role: 'employee',
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canViewReports: true,
    canManageTeam: false,
  },
};

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS.employee);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role, email')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setPermissions(DEFAULT_PERMISSIONS.employee);
        } else if (profile) {
          // Define owner emails - you can add more here
          const ownerEmails = [user.email]; // Your current email will be considered owner
          
          const userRole: UserRole = ownerEmails.includes(profile.email || user.email || '') 
            ? 'owner' 
            : 'employee';
          
          setPermissions(DEFAULT_PERMISSIONS[userRole]);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setPermissions(DEFAULT_PERMISSIONS.employee);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { permissions, loading };
};
