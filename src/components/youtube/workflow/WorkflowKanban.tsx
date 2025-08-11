
import { useState } from 'react';
import { useVideoWorkflow } from '@/hooks/useVideoWorkflow';
import { WorkflowCard } from './WorkflowCard';
import { CreateItemDialog } from './CreateItemDialog';
import { VideoWorkflowCalendar } from './VideoWorkflowCalendar';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { VideoStage } from '@/hooks/useVideoWorkflow';

const columns: { id: VideoStage; title: string; color: string }[] = [
  { id: 'scripted', title: 'Roteirizado', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'recorded', title: 'Gravado', color: 'bg-blue-100 border-blue-300' },
  { id: 'editing', title: 'Editando', color: 'bg-orange-100 border-orange-300' },
  { id: 'awaiting_review', title: 'Aguardando Revisão', color: 'bg-purple-100 border-purple-300' },
  { id: 'approved', title: 'Aprovado', color: 'bg-green-100 border-green-300' },
];

export function WorkflowKanban() {
  const { workflowItems, isLoading, moveItem } = useVideoWorkflow();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const itemId = result.draggableId;
    const newStage = result.destination.droppableId as VideoStage;

    moveItem({ id: itemId, newStage });
  };

  const getItemsByStage = (stage: VideoStage) => {
    return workflowItems.filter(item => item.current_stage === stage);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
 <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Workflow de Vídeos</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Item
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <select
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as VideoStage | 'all')}
            className="border rounded-md px-3 py-1 text-sm bg-background border-border"
          >
            <option value="all">Todos os estágios</option>
            {STAGES.map(stage => (
              <option key={stage.id} value={stage.id}>
                {stage.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {STAGES.map(stage => (
            <Card key={stage.id} className={`bg-card border-border ${stage.borderColor} border-l-4 min-h-[600px]`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {stage.title}
                  <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded-full">
                    {getItemsByStage(stage.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              
              <Droppable droppableId={stage.id}>
                {(provided, snapshot) => (
                  <CardContent
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className={`space-y-3 min-h-[500px] ${
                      snapshot.isDraggingOver ? 'bg-accent/20' : ''
                    }`}
                  >
                    {getItemsByStage(stage.id).map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? 'rotate-2' : ''}
                          >
                            <WorkflowCard item={item} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>
                )}
              </Droppable>
            </Card>
          ))}
        </div>
      </DragDropContext>

      <CreateItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
      />
    </div>
  );
};
      <div className="flex justify-between items-center">
