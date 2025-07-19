
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Archive, 
  Trash2, 
  ExternalLink,
  Paperclip,
  Calendar,
  DollarSign
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Budget } from '@/types/budget';
import { formatCurrency } from '@/utils/formatters';
import { format } from 'date-fns';

interface BudgetCardProps {
  budget: Budget;
  attachmentCount: number;
  onView: (budget: Budget) => void;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onArchive: (budget: Budget) => void;
}

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800'
};

const statusLabels = {
  draft: 'Rascunho',
  active: 'Ativo',
  archived: 'Arquivado',
  completed: 'Concluído'
};

export function BudgetCard({ 
  budget, 
  attachmentCount, 
  onView, 
  onEdit, 
  onDelete, 
  onArchive 
}: BudgetCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleExternalLink = () => {
    if (budget.external_url) {
      window.open(budget.external_url, '_blank');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2">
              {budget.name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge 
                variant="secondary" 
                className={statusColors[budget.status]}
              >
                {statusLabels[budget.status]}
              </Badge>
              {budget.budget_type !== 'general' && (
                <Badge variant="outline">
                  {budget.budget_type}
                </Badge>
              )}
            </div>
          </div>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
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
              <DropdownMenuItem 
                onClick={() => onDelete(budget)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {budget.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {budget.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          {budget.amount && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              <span>{formatCurrency(budget.amount)}</span>
            </div>
          )}
          
          {(budget.period_start || budget.period_end) && (
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>
                {budget.period_start && format(new Date(budget.period_start), 'MMM yyyy')}
                {budget.period_start && budget.period_end && ' - '}
                {budget.period_end && format(new Date(budget.period_end), 'MMM yyyy')}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            {attachmentCount > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="h-4 w-4" />
                <span>{attachmentCount}</span>
              </div>
            )}
            
            {budget.external_url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExternalLink}
                className="h-6 px-2"
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
          </div>
          
          {budget.tags.length > 0 && (
            <div className="flex gap-1">
              {budget.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {budget.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{budget.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
