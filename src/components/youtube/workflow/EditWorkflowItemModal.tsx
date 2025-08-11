
import { useState, useEffect } from 'react';
import { VideoWorkflowItem, useVideoWorkflow, ContentType } from '@/hooks/useVideoWorkflow';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditWorkflowItemModalProps {
  item: VideoWorkflowItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CONTENT_TYPE_OPTIONS = [
  { value: 'davizão_news', label: 'Davizão News' },
  { value: 'vlog_de_show', label: 'Vlog de Show' },
  { value: 'resenha', label: 'Resenha' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'review', label: 'Review' },
  { value: 'livestream', label: 'Live' },
  { value: 'other', label: 'Outro' },
];

const PRIORITY_OPTIONS = [
  { value: 0, label: 'Normal' },
  { value: 1, label: 'Baixa' },
  { value: 2, label: 'Média' },
  { value: 3, label: 'Alta' },
];

export const EditWorkflowItemModal = ({ item, open, onOpenChange }: EditWorkflowItemModalProps) => {
  const { updateItem, isUpdating } = useVideoWorkflow();
  const [formData, setFormData] = useState({
    title: '',
    content_type: 'other' as ContentType,
    priority: 0,
    estimated_publication_date: null as Date | null,
    description: '',
    tags: [] as string[],
    script_link: '',
    drive_link: '',
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        content_type: item.content_type,
        priority: item.priority,
        estimated_publication_date: item.estimated_publication_date ? new Date(item.estimated_publication_date) : null,
        description: item.description || '',
        tags: item.tags || [],
        script_link: item.script_link || '',
        drive_link: item.drive_link || '',
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      ...formData,
      estimated_publication_date: formData.estimated_publication_date 
        ? format(formData.estimated_publication_date, 'yyyy-MM-dd') 
        : null,
    };

    updateItem({ id: item.id, updates });
    onOpenChange(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Item do Workflow</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="content_type">Tipo de Conteúdo *</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value: ContentType) => 
                  setFormData(prev => ({ ...prev, content_type: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTENT_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <Select
                value={formData.priority.toString()}
                onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, priority: parseInt(value) }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Data Estimada de Publicação</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.estimated_publication_date 
                    ? format(formData.estimated_publication_date, 'dd/MM/yyyy', { locale: ptBR })
                    : 'Selecionar data'
                  }
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.estimated_publication_date || undefined}
                  onSelect={(date) => setFormData(prev => ({ ...prev, estimated_publication_date: date || null }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="script_link">Link do Roteiro</Label>
              <Input
                id="script_link"
                type="url"
                value={formData.script_link}
                onChange={(e) => setFormData(prev => ({ ...prev, script_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="drive_link">Link do Drive</Label>
              <Input
                id="drive_link"
                type="url"
                value={formData.drive_link}
                onChange={(e) => setFormData(prev => ({ ...prev, drive_link: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Adicionar tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground px-2 py-1 rounded text-sm cursor-pointer hover:bg-secondary/80"
                  onClick={() => removeTag(tag)}
                >
                  {tag} ×
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
