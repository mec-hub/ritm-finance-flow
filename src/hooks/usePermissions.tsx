
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'manager' | 'user';

export interface UserPermissions {
  role: UserRole;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewReports: boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
}

const DEFAULT_PERMISSIONS: Record<UserRole, UserPermissions> = {
  admin: {
    role: 'admin',
    canAdd: true,
    canEdit: true,
    canDelete: true,
    canViewReports: true,
    canManageTeam: true,
    canManageSettings: true,
  },
  manager: {
    role: 'manager',
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canViewReports: true,
    canManageTeam: false,
    canManageSettings: false,
  },
  user: {
    role: 'user',
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canViewReports: true,
    canManageTeam: false,
    canManageSettings: false,
  },
};

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<UserPermissions>(DEFAULT_PERMISSIONS.user);
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
          setPermissions(DEFAULT_PERMISSIONS.user);
        } else if (profile) {
          const userRole: UserRole = profile.role || 'user';
          setPermissions(DEFAULT_PERMISSIONS[userRole]);
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setPermissions(DEFAULT_PERMISSIONS.user);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { permissions, loading };
};
