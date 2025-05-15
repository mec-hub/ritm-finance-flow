import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Transaction } from '@/types';
import { toast } from '@/hooks/use-toast';

// Interface for budget items
interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  month: string;
  year: number;
}

// Mock budget data
const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Equipamento',
    allocated: 5000,
    spent: 4200,
    month: 'Janeiro',
    year: 2023
  },
  {
    id: '2',
    category: 'Marketing',
    allocated: 3000,
    spent: 3200,
    month: 'Janeiro',
    year: 2023
  },
  {
    id: '3',
    category: 'Pessoal',
    allocated: 10000,
    spent: 9000,
    month: 'Janeiro',
    year: 2023
  },
  {
    id: '4',
    category: 'Transporte',
    allocated: 1500,
    spent: 800,
    month: 'Janeiro',
    year: 2023
  }
];

interface BudgetManagerProps {
  transactions: Transaction[];
}

export function BudgetManager({ transactions }: BudgetManagerProps) {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [selectedMonth, setSelectedMonth] = useState<string>('Janeiro');
  const [selectedYear, setSelectedYear] = useState<number>(2023);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState<Omit<Budget, 'id' | 'spent'>>({
    category: '',
    allocated: 0,
    month: selectedMonth,
    year: selectedYear,
  });

  // Filter budgets based on selected month and year
  const filteredBudgets = budgets.filter(
    budget => budget.month === selectedMonth && budget.year === selectedYear
  );

  // Calculate totals
  const totalAllocated = filteredBudgets.reduce((sum, budget) => sum + budget.allocated, 0);
  const totalSpent = filteredBudgets.reduce((sum, budget) => sum + budget.spent, 0);

  const handleAddBudget = () => {
    // In a real app, this would save to a database
    const newId = (budgets.length + 1).toString();
    setBudgets([
      ...budgets,
      {
        id: newId,
        category: newBudget.category,
        allocated: newBudget.allocated,
        spent: 0, // New budgets start with 0 spent
        month: selectedMonth,
        year: selectedYear,
      },
    ]);
    
    setNewBudget({
      category: '',
      allocated: 0,
      month: selectedMonth,
      year: selectedYear,
    });
    
    setDialogOpen(false);
    
    toast({
      title: "Orçamento adicionado",
      description: `Orçamento para ${newBudget.category} foi adicionado com sucesso.`,
    });
  };

  const handleUpdateBudget = () => {
    if (!editingBudget) return;
    
    // In a real app, this would update in a database
    setBudgets(
      budgets.map(budget =>
        budget.id === editingBudget.id ? editingBudget : budget
      )
    );
    
    setEditingBudget(null);
    setDialogOpen(false);
    
    toast({
      title: "Orçamento atualizado",
      description: `Orçamento para ${editingBudget.category} foi atualizado com sucesso.`,
    });
  };

  const handleDeleteBudget = (id: string) => {
    // In a real app, this would delete from a database
    setBudgets(budgets.filter(budget => budget.id !== id));
    
    toast({
      title: "Orçamento removido",
      description: "O orçamento foi removido com sucesso.",
    });
  };

  const openEditDialog = (budget: Budget) => {
    setEditingBudget(budget);
    setDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingBudget(null);
    setNewBudget({
      category: '',
      allocated: 0,
      month: selectedMonth,
      year: selectedYear,
    });
    setDialogOpen(true);
  };

  // Available months for selection
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Available years for selection
  const years = [2022, 2023, 2024, 2025];

  // Function to calculate progress percentage safely
  const calculateProgress = (spent: number, allocated: number): number => {
    if (allocated <= 0) return 0;
    return Math.min(Math.round((spent / allocated) * 100), 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex space-x-4">
          <div>
            <Label htmlFor="month">Mês</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione o mês" />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month} value={month}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="year">Ano</Label>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(parseInt(value))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={openAddDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAllocated)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalSpent)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Restante</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAllocated - totalSpent)}
            </div>
            <Progress 
              value={calculateProgress(totalSpent, totalAllocated)} 
              className="h-2 mt-2"
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orçamentos por Categoria</CardTitle>
          <CardDescription>
            Gerencie seus orçamentos por categoria para {selectedMonth} de {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Orçado</TableHead>
                  <TableHead>Gasto</TableHead>
                  <TableHead>Restante</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBudgets.length > 0 ? (
                  filteredBudgets.map((budget) => {
                    const progress = calculateProgress(budget.spent, budget.allocated);
                    const isOverBudget = budget.spent > budget.allocated;
                    
                    return (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.category}</TableCell>
                        <TableCell>{formatCurrency(budget.allocated)}</TableCell>
                        <TableCell>{formatCurrency(budget.spent)}</TableCell>
                        <TableCell>
                          <span className={isOverBudget ? 'text-red-500' : ''}>
                            {formatCurrency(budget.allocated - budget.spent)}
                          </span>
                          {isOverBudget && (
                            <AlertTriangle className="h-4 w-4 text-red-500 inline ml-1" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={progress} 
                              className={isOverBudget ? 'bg-red-200' : ''}
                              indicatorClassName={isOverBudget ? 'bg-red-500' : ''}
                            />
                            <span className="text-xs tabular-nums">
                              {progress}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(budget)}
                            >
                              <Edit2 className="h-4 w-4" />
                              <span className="sr-only">Editar</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDeleteBudget(budget.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Excluir</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      Nenhum orçamento encontrado para este período. Clique em "Novo Orçamento" para adicionar.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}
            </DialogTitle>
            <DialogDescription>
              {editingBudget
                ? 'Atualize os detalhes do orçamento abaixo.'
                : 'Adicione um novo orçamento para gerenciar suas despesas.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                placeholder="Nome da categoria"
                value={editingBudget ? editingBudget.category : newBudget.category}
                onChange={(e) => {
                  if (editingBudget) {
                    setEditingBudget({
                      ...editingBudget,
                      category: e.target.value,
                    });
                  } else {
                    setNewBudget({
                      ...newBudget,
                      category: e.target.value,
                    });
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Orçado</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={editingBudget ? editingBudget.allocated : newBudget.allocated}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0;
                  if (editingBudget) {
                    setEditingBudget({
                      ...editingBudget,
                      allocated: value,
                    });
                  } else {
                    setNewBudget({
                      ...newBudget,
                      allocated: value,
                    });
                  }
                }}
              />
            </div>
            {editingBudget && (
              <div className="space-y-2">
                <Label htmlFor="spent">Valor Gasto</Label>
                <Input
                  id="spent"
                  type="number"
                  placeholder="0.00"
                  value={editingBudget.spent}
                  onChange={(e) => {
                    setEditingBudget({
                      ...editingBudget,
                      spent: parseFloat(e.target.value) || 0,
                    });
                  }}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={editingBudget ? handleUpdateBudget : handleAddBudget}>
              {editingBudget ? 'Salvar Alterações' : 'Adicionar Orçamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
