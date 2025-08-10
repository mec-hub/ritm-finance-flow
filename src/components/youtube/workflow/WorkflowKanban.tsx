
import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useVideoWorkflow, VideoStage, VideoWorkflowItem } from '@/hooks/useVideoWorkflow';
import { WorkflowCard } from './WorkflowCard';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { CreateItemDialog } from './CreateItemDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const STAGES: { id: VideoStage; title: string; color: string }[] = [
  { id: 'scripted', title: 'Roteirizado', color: 'bg-blue-100 border-blue-200' },
  { id: 'recorded', title: 'Gravado', color: 'bg-yellow-100 border-yellow-200' },
  { id: 'editing', title: 'Editando', color: 'bg-purple-100 border-purple-200' },
  { id: 'awaiting_review', title: 'Aguardando Revisão', color: 'bg-orange-100 border-orange-200' },
  { id: 'approved', title: 'Aprovado', color: 'bg-green-100 border-green-200' },
];

export const WorkflowKanban = () => {
  const { workflowItems, isLoading, moveItem } = useVideoWorkflow();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filterStage, setFilterStage] = useState<VideoStage | 'all'>('all');

  const filteredItems = workflowItems.filter(item => 
    filterStage === 'all' || item.current_stage === filterStage
  );

  const getItemsByStage = (stage: VideoStage) => {
    return filteredItems.filter(item => item.current_stage === stage);
  };

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { draggableId, destination } = result;
    const newStage = destination.droppableId as VideoStage;
    
    moveItem({ id: draggableId, newStage });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
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
            className="border rounded-md px-3 py-1 text-sm"
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
            <Card key={stage.id} className={`${stage.color} min-h-[600px]`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {stage.title}
                  <span className="bg-white/70 text-xs px-2 py-1 rounded-full">
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
                      snapshot.isDraggingOver ? 'bg-white/30' : ''
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
