
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  income: number;
  expenses: number;
  profit: number;
}

interface CompactTeamFilterProps {
  teamMembers: TeamMember[];
  selectedMembers: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function CompactTeamFilter({ teamMembers, selectedMembers, onSelectionChange }: CompactTeamFilterProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <CardTitle className="text-base">
              Filtro de Membros ({selectedMembers.length}/{teamMembers.length})
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="select-all"
                  checked={selectedMembers.length === teamMembers.length}
                  onCheckedChange={handleSelectAll}
                />
                <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                  Selecionar Todos
                </label>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-start space-x-2 p-2 rounded-md border hover:bg-muted/50">
                  <Checkbox
                    id={member.id}
                    checked={selectedMembers.includes(member.id)}
                    onCheckedChange={(checked) => handleMemberToggle(member.id, !!checked)}
                    className="mt-1"
                  />
                  <label htmlFor={member.id} className="flex-1 cursor-pointer text-sm">
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                    <div className={`text-xs font-medium ${member.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(member.profit)}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
