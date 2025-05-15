
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface FiltersProps {
  type: string;
  dateFrom: Date | null;
  dateTo: Date | null;
  category: string;
  minAmount: string;
  maxAmount: string;
}

interface TransactionFiltersProps {
  filters: FiltersProps;
  onApplyFilters: (filters: FiltersProps) => void;
  onClearFilters: () => void;
}

export function TransactionFilters({ 
  filters, 
  onApplyFilters, 
  onClearFilters 
}: TransactionFiltersProps) {
  const [localFilters, setLocalFilters] = useState<FiltersProps>(filters);

  const handleChange = (key: keyof FiltersProps, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters(localFilters);
  };

  return (
    <Card className="bg-muted/30">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tipo de Transação</label>
            <Select
              value={localFilters.type}
              onValueChange={(value) => handleChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Inicial</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateFrom ? (
                    format(localFilters.dateFrom, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateFrom || undefined}
                  onSelect={(date) => handleChange('dateFrom', date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Data Final</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !localFilters.dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {localFilters.dateTo ? (
                    format(localFilters.dateTo, "dd/MM/yyyy")
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={localFilters.dateTo || undefined}
                  onSelect={(date) => handleChange('dateTo', date)}
                  initialFocus
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Categoria</label>
            <Input
              placeholder="Digite uma categoria"
              value={localFilters.category}
              onChange={(e) => handleChange('category', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Mínimo</label>
            <Input
              placeholder="Ex: 100"
              value={localFilters.minAmount}
              onChange={(e) => handleChange('minAmount', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor Máximo</label>
            <Input
              placeholder="Ex: 1000"
              value={localFilters.maxAmount}
              onChange={(e) => handleChange('maxAmount', e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <Button variant="outline" onClick={onClearFilters}>
            Limpar Filtros
          </Button>
          <Button onClick={handleApplyFilters}>
            Aplicar Filtros
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
