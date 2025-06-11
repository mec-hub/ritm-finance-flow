
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  full_name?: string;
  role?: 'admin' | 'manager' | 'user';
  avatar_url?: string;
}

export function UserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          // Fallback to user data if profile doesn't exist
          setProfile({
            full_name: user.user_metadata?.full_name || user.email || 'Usuário',
            role: 'user',
            avatar_url: null
          });
        } else {
          setProfile(data);
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        setProfile({
          full_name: user.user_metadata?.full_name || user.email || 'Usuário',
          role: 'user',
          avatar_url: null
        });
      }
    };

    fetchProfile();
  }, [user]);

  if (!user || !profile) {
    return (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">Carregando...</p>
          <p className="text-xs text-muted-foreground">Usuário</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: 'Administrador',
      manager: 'Gerente',
      user: 'Usuário'
    };
    return roles[role as keyof typeof roles] || 'Usuário';
  };

  return (
    <div className="flex items-center space-x-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={profile.avatar_url || ''} />
        <AvatarFallback>
          {profile.full_name ? getInitials(profile.full_name) : 'U'}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="text-sm font-medium">
          {profile.full_name || user.email || 'Usuário'}
        </p>
        <p className="text-xs text-muted-foreground">
          {getRoleLabel(profile.role || 'user')}
        </p>
      </div>
    </div>
  );
}
