
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Users, Mail, CheckCircle, XCircle } from 'lucide-react';
import { TeamManagementService } from '@/services/teamManagementService';
import { TeamMember } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TeamMemberWithProfile extends TeamMember {
  email?: string;
  isActive: boolean;
}

export function TeamManagementSettings() {
  const [teamMembers, setTeamMembers] = useState<TeamMemberWithProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembersWithProfiles();
  }, []);

  const fetchTeamMembersWithProfiles = async () => {
    try {
      // Get team members
      const members = await TeamManagementService.getAllMembers();
      
      // Get profiles to check which team members are actually registered users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, email, full_name');

      if (error) throw error;

      // Create a map of profiles by name for matching
      const profileMap = new Map();
      profiles?.forEach(profile => {
        if (profile.full_name) {
          profileMap.set(profile.full_name.toLowerCase(), profile);
        }
      });

      // Enhance team members with profile information
      const enhancedMembers: TeamMemberWithProfile[] = members.map(member => {
        const profile = profileMap.get(member.name.toLowerCase());
        
        return {
          ...member,
          email: profile?.email,
          isActive: !!profile
        };
      });

      setTeamMembers(enhancedMembers);
    } catch (error) {
      console.error('Error fetching team members with profiles:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os membros da equipe.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'designer': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'photographer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <p>Carregando membros da equipe...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros da Equipe
          </CardTitle>
          <CardDescription>
            Visualize todos os membros da sua equipe e suas informações de perfil.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum membro da equipe encontrado.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-lg">
                      {getInitials(member.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      {member.role && (
                        <Badge variant="outline" className={getRoleColor(member.role)}>
                          {member.role}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Mail className="h-3 w-3" />
                      <span>{member.email || 'Email não cadastrado'}</span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      {member.isActive ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Ativo
                          </Badge>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-gray-400" />
                          <Badge variant="outline" className="bg-gray-50 text-gray-500 border-gray-200">
                            Não Registrado
                          </Badge>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {member.isActive ? 'Usuário da plataforma' : 'Apenas cadastro na equipe'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
