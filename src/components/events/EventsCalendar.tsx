import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Event } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { Edit, Clock } from 'lucide-react';

interface EventsCalendarProps {
  events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const navigate = useNavigate();
  
  // Create events by date mapping
  const eventsByDate: { [key: string]: Event[] } = {};
  events.forEach(event => {
    const dateStr = new Date(event.date).toDateString();
    if (!eventsByDate[dateStr]) {
      eventsByDate[dateStr] = [];
    }
    eventsByDate[dateStr].push(event);
  });
  
  const eventsForSelectedDate = selectedDate 
    ? eventsByDate[selectedDate.toDateString()] || []
    : [];
    
  // Function to determine which dates have events
  const hasEventOnDay = (day: Date) => {
    return !!eventsByDate[day.toDateString()];
  };
  
  // Handle day selection
  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && hasEventOnDay(date)) {
      setIsDetailsOpen(true);
    }
  };

  const handleEditEvent = (event: Event) => {
    navigate(`/editar-evento/${event.id}`, { state: { eventData: event } });
  };
  
  // Function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Próximo</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <>
      <div className="flex justify-center p-4 w-full">
        <Card className="w-full max-w-full">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              className="rounded-md border w-full pointer-events-auto"
              modifiers={{
                hasEvent: (date) => hasEventOnDay(date),
              }}
              modifiersStyles={{
                hasEvent: { 
                  fontWeight: 'bold', 
                  backgroundColor: 'rgba(255, 191, 0, 0.2)',
                  color: '#000000',
                  textDecoration: 'underline' 
                },
              }}
              styles={{
                month: { width: '100%' },
                months: { width: '100%' },
                table: { width: '100%' },
                cell: { width: '14.28%', height: '60px' },
                day: { transform: 'scale(1.2)', fontWeight: 'bold' },
                caption: { fontSize: '1.3rem', fontWeight: 'bold' },
                head_cell: { fontSize: '1.1rem', paddingTop: '1rem', paddingBottom: '1rem', fontWeight: 'bold' },
                nav_button: { transform: 'scale(1.5)', margin: '0 0.5rem' }
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Eventos em {selectedDate && formatDate(selectedDate)}</DialogTitle>
            <DialogDescription>
              Detalhes dos eventos nesta data
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {eventsForSelectedDate.map((event) => (
              <Card key={event.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.location}</p>
                      {(event.startTime || event.endTime) && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <Clock className="h-3 w-3" />
                          {event.startTime && <span>{event.startTime}</span>}
                          {event.startTime && event.endTime && <span>-</span>}
                          {event.endTime && <span>{event.endTime}</span>}
                        </div>
                      )}
                    </div>
                    {getStatusBadge(event.status)}
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cliente:</span>
                      <span>{event.client}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Estimado:</span>
                      <span>{formatCurrency(event.estimatedRevenue)}</span>
                    </div>
                    {event.actualRevenue !== undefined && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Valor Real:</span>
                        <span>{formatCurrency(event.actualRevenue)}</span>
                      </div>
                    )}
                    {event.notes && (
                      <div className="pt-2 border-t mt-2">
                        <span className="text-sm text-muted-foreground block">Observações:</span>
                        <p className="text-sm mt-1">{event.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={() => handleEditEvent(event)} size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
