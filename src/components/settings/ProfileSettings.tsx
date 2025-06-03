
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function ProfileSettings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    bio: '',
    website: '',
    location: '',
    avatar_url: '',
    role: 'user' as 'admin' | 'manager' | 'user'
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o perfil.",
        variant: "destructive"
      });
    } else if (data) {
      setProfile({
        full_name: data.full_name || '',
        email: data.email || user.email || '',
        phone: data.phone || '',
        company: data.company || '',
        position: data.position || '',
        bio: data.bio || '',
        website: data.website || '',
        location: data.location || '',
        avatar_url: data.avatar_url || '',
        role: data.role || 'user'
      });
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone,
        company: profile.company,
        position: profile.position,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        avatar_url: profile.avatar_url,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o perfil.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso."
      });
    }

    setLoading(false);
  };

  const handleAvatarUpload = () => {
    toast({
      title: "Upload de avatar",
      description: "Funcionalidade em desenvolvimento."
    });
  };

  const getRoleLabel = (role: string) => {
    const roles = {
      admin: 'Administrador',
      manager: 'Gerente',
      user: 'Usuário'
    };
    return roles[role as keyof typeof roles] || role;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e de contato.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg">
                {profile.full_name ? getInitials(profile.full_name) : 'US'}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <Button variant="outline" onClick={handleAvatarUpload}>
                <Camera className="h-4 w-4 mr-2" />
                Alterar Foto
              </Button>
              <p className="text-sm text-muted-foreground">
                Recomendado: 400x400px, máximo 2MB
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={profile.position}
                onChange={(e) => setProfile(prev => ({ ...prev, position: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={profile.company}
                onChange={(e) => setProfile(prev => ({ ...prev, company: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={profile.website}
              onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Biografia</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
              className="min-h-[100px]"
              placeholder="Conte um pouco sobre você e sua experiência..."
            />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sair da Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conta</CardTitle>
          <CardDescription>
            Informações sobre sua conta e uso da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Função</p>
              <p className="text-sm text-muted-foreground">{getRoleLabel(profile.role)}</p>
            </div>
            <Badge variant="secondary">{getRoleLabel(profile.role)}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Status da Conta</p>
              <p className="text-sm text-muted-foreground">Conta ativa</p>
            </div>
            <Badge variant="default">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Última atualização</p>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
