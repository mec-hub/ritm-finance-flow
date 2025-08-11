
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
  { id: 'scripted', title: 'Roteirizado', color: 'bg-gradient-to-br from-amber-500/20 to-yellow-600/20 border-amber-500/30' },
  { id: 'recorded', title: 'Gravado', color: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-blue-500/30' },
  { id: 'editing', title: 'Editando', color: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-orange-500/30' },
  { id: 'awaiting_review', title: 'Aguardando Revisão', color: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-purple-500/30' },
  { id: 'approved', title: 'Aprovado', color: 'bg-gradient-to-br from-green-500/20 to-green-600/20 border-green-500/30' },
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow de Vídeos</h2>
          <p className="text-muted-foreground">
            Gerencie o fluxo de produção dos seus vídeos
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {columns.map(column => (
            <Card key={column.id} className={`${column.color} backdrop-blur-sm border-2 transition-all hover:shadow-lg hover:scale-[1.02]`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between text-foreground">
                  {column.title}
                  <span className="bg-card/80 backdrop-blur-sm border border-border rounded-full px-3 py-1 text-xs font-semibold shadow-sm">
                    {getItemsByStage(column.id).length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-32 space-y-3 transition-all duration-200 ${
                        snapshot.isDraggingOver ? 'bg-card/30 backdrop-blur-sm rounded-lg border-2 border-dashed border-primary/50 p-2' : ''
                      }`}
                    >
                      {getItemsByStage(column.id).map((item, index) => (
                        <Draggable
                          key={item.id}
                          draggableId={item.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`transition-all duration-200 ${
                                snapshot.isDragging ? 'rotate-2 scale-105 shadow-xl' : 'hover:scale-[1.02]'
                              }`}
                            >
                              <WorkflowCard item={item} />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </CardContent>
            </Card>
          ))}
        </div>
      </DragDropContext>

      <VideoWorkflowCalendar workflowItems={workflowItems} />

      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
