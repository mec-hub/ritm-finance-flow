
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  income: number;
  expenses: number;
  profit: number;
}

interface TeamMemberSelectorProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function TeamMemberSelector({ teamMembers, selectedMembers, onSelectionChange }: TeamMemberSelectorProps) {
  const handleMemberToggle = (memberId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedMembers, memberId]);
    } else {
      onSelectionChange(selectedMembers.filter(id => id !== memberId));
    }
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === teamMembers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(teamMembers.map(member => member.id));
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Selecionar Membros da Equipe</CardTitle>
        <CardDescription>
          Escolha quais membros incluir na análise comparativa
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2 pb-2 border-b">
          <Checkbox
            id="select-all"
            checked={selectedMembers.length === teamMembers.length}
            onCheckedChange={handleSelectAll}
          />
          <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
            Selecionar Todos ({teamMembers.length})
          </label>
        </div>
        
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50">
              <Checkbox
                id={member.id}
                checked={selectedMembers.includes(member.id)}
                onCheckedChange={(checked) => handleMemberToggle(member.id, !!checked)}
              />
              <label htmlFor={member.id} className="flex-1 cursor-pointer">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                  <div className="text-xs text-right">
                    <div className={`font-medium ${member.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {member.profit >= 0 ? '+' : ''}{member.profit.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          ))}
        </div>
        
        {selectedMembers.length > 0 && (
          <div className="pt-2 border-t text-xs text-muted-foreground">
            {selectedMembers.length} de {teamMembers.length} membros selecionados
          </div>
        )}
      </CardContent>
    </Card>
  );
}
