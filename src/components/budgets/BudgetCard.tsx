
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Eye, Edit, Trash2, Archive, MoreHorizontal, Calendar, DollarSign, ExternalLink, Paperclip } from 'lucide-react';
import { Budget } from '@/types/budget';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetCardProps {
  budget: Budget;
  attachmentCount: number;
  onView: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
}

const getBudgetTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    'general': 'Geral',
    'project': 'Projeto',
    'event': 'Evento',
    'annual': 'Anual',
    'monthly': 'Mensal',
    'marketing': 'Marketing',
    'equipment': 'Equipamentos',
    'personal': 'Pessoal'
  };
  return types[type] || type;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'draft': 'bg-gray-100 text-gray-800',
    'active': 'bg-green-100 text-green-800',
    'archived': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    'draft': 'Rascunho',
    'active': 'Ativo',
    'archived': 'Arquivado',
    'completed': 'Concluído'
  };
  return labels[status] || status;
};

export function BudgetCard({ budget, attachmentCount, onView, onEdit, onDelete, onArchive }: BudgetCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{budget.name}</CardTitle>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{getBudgetTypeLabel(budget.budget_type)}</Badge>
              <Badge className={getStatusColor(budget.status)}>
                {getStatusLabel(budget.status)}
              </Badge>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(budget)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {budget.status !== 'archived' && (
                <DropdownMenuItem onClick={() => onArchive(budget)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Arquivar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => onDelete(budget)} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {budget.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {budget.description}
          </p>
        )}
        
        <div className="space-y-2">
          {budget.amount && (
            <div className="flex items-center text-sm">
              <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatCurrency(budget.amount)}</span>
            </div>
          )}
          
          {(budget.period_start || budget.period_end) && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              <span>
                {budget.period_start && format(new Date(budget.period_start), 'dd/MM/yyyy', { locale: ptBR })}
                {budget.period_start && budget.period_end && ' - '}
                {budget.period_end && format(new Date(budget.period_end), 'dd/MM/yyyy', { locale: ptBR })}
              </span>
            </div>
          )}
          
          {budget.external_url && (
            <div className="flex items-center text-sm text-muted-foreground">
              <ExternalLink className="mr-2 h-4 w-4" />
              <a 
                href={budget.external_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-primary truncate"
              >
                Link externo
              </a>
            </div>
          )}
          
          {attachmentCount > 0 && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Paperclip className="mr-2 h-4 w-4" />
              <span>{attachmentCount} documento(s) anexado(s)</span>
            </div>
          )}
          
          {budget.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {budget.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {budget.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{budget.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
        
        <div className="flex justify-between items-center mt-4 pt-3 border-t">
          <span className="text-xs text-muted-foreground">
            Criado em {format(new Date(budget.created_at), 'dd/MM/yyyy', { locale: ptBR })}
          </span>
          <Button variant="outline" size="sm" onClick={() => onView(budget)}>
            Ver detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
