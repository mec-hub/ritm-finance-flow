import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Event } from '@/types';
import { EventDetailsModal } from './EventDetailsModal';

interface EventsCalendarProps {
  events: Event[];
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Agrupa eventos por data
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

  // Verifica se há evento em um determinado dia
  const hasEventOnDay = (day: Date) => {
    return !!eventsByDate[day.toDateString()];
  };

  // Ação ao clicar em um dia
  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && hasEventOnDay(date)) {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      {/* Estilos customizados do calendário */}
      <style>{`
        @keyframes eventDayGlow {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(255, 215, 0, 0.8), 0 0 8px rgba(255, 215, 0, 0.3);
          }
          50% {
            box-shadow: 0 0 0 2px rgba(255, 191, 0, 1), 0 0 16px rgba(255, 215, 0, 0.5);
          }
        }

        .calendar-enhanced .rdp-head_cell,
        .calendar-enhanced .rdp-cell {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
        }

        .calendar-enhanced .rdp-day_today {
          background-color: rgba(255, 191, 0, 0.15) !important;
          color: #000000 !important;
          border-radius: 6px !important;
          border: 1px solid rgba(255, 191, 0, 0.4) !important;
        }

        .calendar-enhanced .rdp-day_selected {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-radius: 6px !important;
          border: 1px solid #ffffff !important;
        }

        .calendar-enhanced .rdp-day_selected:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .calendar-enhanced button[aria-selected="true"] {
          background-color: #ffffff !important;
          color: #000000 !important;
          border-radius: 6px !important;
          border: 1px solid #ffffff !important;
          outline: none !important;
          box-shadow: none !important;
        }
      `}</style>

      {/* Componente visual */}
      <div className="flex justify-center p-4 w-full">
        <Card className="w-full max-w-full">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              className="rounded-md border w-full pointer-events-auto calendar-enhanced"
              modifiers={{
                hasEvent: (date) => hasEventOnDay(date),
              }}
              modifiersStyles={{
                hasEvent: {
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background: 'transparent',
                  borderRadius: '6px',
                  border: '2px solid transparent',
                  animation: 'eventDayGlow 2.5s ease-in-out infinite',
                  position: 'relative',
                },
              }}
              styles={{
                month: { width: '100%' },
                months: { width: '100%' },
                table: { width: '100%' },
                cell: {
                  width: '14.28%',
                  height: '60px',
                  textAlign: 'center',
                  padding: '4px',
                },
                day: {
                  transform: 'scale(1.2)',
                  fontWeight: 'bold',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                caption: {
                  fontSize: '1.3rem',
                  fontWeight: 'bold',
                },
                head_cell: {
                  fontSize: '1.1rem',
                  paddingTop: '1rem',
                  paddingBottom: '1rem',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  width: '14.28%',
                },
                nav_button: {
                  transform: 'scale(1.5)',
                  margin: '0 0.5rem',
                },
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Modal de detalhes de eventos */}
      <EventDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        events={eventsForSelectedDate}
        selectedDate={selectedDate || new Date()}
      />
    </>
  );
}
