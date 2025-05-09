
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Event } from '@/types';
import { Badge } from '@/components/ui/badge';

interface EventsListProps {
  events: Event[];
}

export function EventsList({ events }: EventsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'Próximo';
      case 'completed':
        return 'Concluído';
      case 'cancelled':
        return 'Cancelado';
      default:
        return status;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximos Eventos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start space-x-4 rounded-lg border border-border p-3 transition-all hover:bg-secondary/50"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{event.title}</h4>
                  <Badge className={getStatusColor(event.status)}>
                    {getStatusLabel(event.status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    <p>
                      <span className="font-medium">Data:</span> {formatDate(event.date)}
                    </p>
                    <p>
                      <span className="font-medium">Local:</span> {event.location}
                    </p>
                  </div>
                  <div className="text-right">
                    <p>
                      <span className="font-medium">Cliente:</span> {event.client}
                    </p>
                    <p>
                      <span className="font-medium">Receita Estimada:</span>{' '}
                      {formatCurrency(event.estimatedRevenue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
