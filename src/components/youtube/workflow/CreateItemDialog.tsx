
import { useState } from 'react';
import { useVideoWorkflow, ContentType } from '@/hooks/useVideoWorkflow';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreateItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'review', label: 'Review' },
  { value: 'davizão news', label: 'Davizão News' },
  { value: 'vlog de Show', label: 'Vlog de Show' },
  { value: 'short', label: 'Short' },
  { value: 'livestream', label: 'Livestream' },
  { value: 'other', label: 'Outro' },
];

export const CreateItemDialog = ({ open, onOpenChange }: CreateItemDialogProps) => {
  const { createItem, isCreating } = useVideoWorkflow();
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'other' as ContentType,
    description: '',
    script_link: '',
    drive_link: '',
    estimated_publication_date: '',
    priority: 0,
    tags: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const tags = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    createItem({
      title: formData.title,
      content_type: formData.content_type,
      description: formData.description || undefined,
      script_link: formData.script_link || undefined,
      drive_link: formData.drive_link || undefined,
      estimated_publication_date: formData.estimated_publication_date || undefined,
      priority: formData.priority,
      tags,
      current_stage: 'scripted',
    });

    // Reset form
    setFormData({
      title: '',
      content_type: 'other',
      description: '',
      script_link: '',
      drive_link: '',
      estimated_publication_date: '',
      priority: 0,
      tags: '',
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Criar Novo Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="Digite o título do vídeo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content_type">Tipo de Conteúdo</Label>
            <Select
              value={formData.content_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, content_type: value as ContentType }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTENT_TYPES.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o conteúdo do vídeo"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="script_link">Link do Roteiro</Label>
              <Input
                id="script_link"
                value={formData.script_link}
                onChange={(e) => setFormData(prev => ({ ...prev, script_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive_link">Link do Drive</Label>
              <Input
                id="drive_link"
                value={formData.drive_link}
                onChange={(e) => setFormData(prev => ({ ...prev, drive_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_publication_date">Data Estimada</Label>
              <Input
                id="estimated_publication_date"
                type="date"
                value={formData.estimated_publication_date}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_publication_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Normal</SelectItem>
                  <SelectItem value="1">Baixa</SelectItem>
                  <SelectItem value="2">Média</SelectItem>
                  <SelectItem value="3">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="gaming, tutorial, review"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Criando...' : 'Criar Item'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
