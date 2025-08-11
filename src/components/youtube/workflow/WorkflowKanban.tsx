
import { useState } from 'react';
import { useVideoWorkflow } from '@/hooks/useVideoWorkflow';
import { WorkflowCard } from './WorkflowCard';
import { CreateItemDialog } from './CreateItemDialog';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VideoWorkflowCalendar } from './VideoWorkflowCalendar';
import { Plus, Kanban, Calendar } from 'lucide-react';
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workflow de Vídeos</h2>
          <p className="text-muted-foreground">
            Gerencie o fluxo de produção dos seus vídeos
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {columns.map(column => (
                <Card key={column.id} className={`${column.color}`}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      {column.title}
                      <span className="bg-white rounded-full px-2 py-1 text-xs">
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
                          className={`min-h-32 space-y-2 transition-colors ${
                            snapshot.isDraggingOver ? 'bg-white/50 rounded-md' : ''
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
                                  className={`transition-transform ${
                                    snapshot.isDragging ? 'rotate-2 scale-105' : ''
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
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <VideoWorkflowCalendar workflowItems={workflowItems} />
        </TabsContent>
      </Tabs>

      <CreateItemDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </div>
  );
}
