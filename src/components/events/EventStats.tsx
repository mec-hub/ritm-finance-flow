
import { StatCard } from '@/components/ui/dashboard/StatCard';
import { Event } from '@/types';
import { Calendar, CalendarCheck, CalendarX } from 'lucide-react';

interface EventStatsProps {
  events: Event[];
}

export function EventStats({ events }: EventStatsProps) {
  // Calculate statistics
  const upcomingEvents = events.filter(event => event.status === 'upcoming').length;
  const completedEvents = events.filter(event => event.status === 'completed').length;
  const cancelledEvents = events.filter(event => event.status === 'cancelled').length;
  
  return (
    <>
      <StatCard
        title="Próximos Eventos"
        value={upcomingEvents.toString()}
        icon={Calendar}
        description="Eventos agendados"
      />
      <StatCard
        title="Eventos Concluídos"
        value={completedEvents.toString()}
        icon={CalendarCheck}
        description="Eventos realizados"
      />
      <StatCard
        title="Eventos Cancelados"
        value={cancelledEvents.toString()}
        icon={CalendarX}
        description="Eventos cancelados"
      />
    </>
  );
}
