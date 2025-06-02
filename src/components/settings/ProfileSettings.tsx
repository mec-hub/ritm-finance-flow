
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Save, Upload, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: 'João Silva',
    email: 'joao@empresa.com',
    phone: '(11) 99999-9999',
    company: 'Minha Empresa Musical',
    position: 'Proprietário',
    bio: 'Especialista em eventos musicais com mais de 10 anos de experiência.',
    website: 'www.minhaempresa.com',
    location: 'São Paulo, SP',
    avatar: ''
  });

  const handleSave = () => {
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso.",
    });
  };

  const handleAvatarUpload = () => {
    // In a real app, this would open a file picker
    toast({
      title: "Upload de avatar",
      description: "Funcionalidade em desenvolvimento.",
    });
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
              <AvatarImage src={profile.avatar} />
              <AvatarFallback className="text-lg">JS</AvatarFallback>
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
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
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

          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Conta</CardTitle>
          <CardDescription>
            Informações sobre sua assinatura e uso da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Plano Atual</p>
              <p className="text-sm text-muted-foreground">Plano Premium</p>
            </div>
            <Badge variant="secondary">Ativo</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Membro desde</p>
              <p className="text-sm text-muted-foreground">Janeiro 2024</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Último login</p>
              <p className="text-sm text-muted-foreground">Hoje às 14:30</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
