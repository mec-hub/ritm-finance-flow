
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Event } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';

interface EventsCalendarProps {
  events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
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
      <div className="flex justify-center p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDayClick}
          className="rounded-md border pointer-events-auto w-full max-w-4xl h-auto"
          modifiers={{
            hasEvent: (date) => hasEventOnDay(date),
          }}
          modifiersStyles={{
            hasEvent: { 
              fontWeight: 'bold', 
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              textDecoration: 'underline' 
            },
          }}
          styles={{
            months: { fontSize: '1rem' },
            cell: { width: '3rem', height: '3rem' },
            day: { transform: 'scale(1.2)' },
            caption: { fontSize: '1.1rem' },
            head_cell: { fontSize: '1rem', paddingTop: '0.75rem', paddingBottom: '0.75rem' },
          }}
        />
      </div>
      
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
