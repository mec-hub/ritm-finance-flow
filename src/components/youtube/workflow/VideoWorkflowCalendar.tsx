
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { VideoWorkflowItem } from '@/hooks/useVideoWorkflow';
import { VideoWorkflowDetailsModal } from './VideoWorkflowDetailsModal';

interface VideoWorkflowCalendarProps {
  workflowItems: VideoWorkflowItem[];
}

export function VideoWorkflowCalendar({ workflowItems }: VideoWorkflowCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Filter items that have estimated publication dates
  const itemsWithDates = workflowItems.filter(item => item.estimated_publication_date);

  // Group workflow items by date
  const itemsByDate: { [key: string]: VideoWorkflowItem[] } = {};
  itemsWithDates.forEach(item => {
    if (item.estimated_publication_date) {
      const dateStr = new Date(item.estimated_publication_date).toDateString();
      if (!itemsByDate[dateStr]) {
        itemsByDate[dateStr] = [];
      }
      itemsByDate[dateStr].push(item);
    }
  });

  const itemsForSelectedDate = selectedDate
    ? itemsByDate[selectedDate.toDateString()] || []
    : [];

  const hasItemOnDay = (day: Date) => {
    return !!itemsByDate[day.toDateString()];
  };

  const handleDayClick = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && hasItemOnDay(date)) {
      setIsDetailsOpen(true);
    }
  };

  return (
    <>
      <style>{`
        @keyframes videoItemGlow {
          0%, 100% {
            box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.8), 0 0 8px rgba(139, 92, 246, 0.3);
          }
          50% {
            box-shadow: 0 0 0 2px rgba(124, 58, 237, 1), 0 0 16px rgba(139, 92, 246, 0.5);
          }
        }

        /* Corrige cabeçalhos e células */
        .workflow-calendar-enhanced .rdp-head_cell,
        .workflow-calendar-enhanced .rdp-cell {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          text-align: center !important;
        }

        /* Estilo do dia atual */
        .workflow-calendar-enhanced .rdp-day_today {
          background-color: rgba(139, 92, 246, 0.15) !important;
          color: #000000 !important;
          border-radius: 6px !important;
          border: 1px solid rgba(139, 92, 246, 0.4) !important;
        }

        /* Remove TODAS as estilizações padrão do dia selecionado */
        .workflow-calendar-enhanced .rdp-day_selected,
        .workflow-calendar-enhanced button[aria-selected="true"],
        .workflow-calendar-enhanced .rdp-day_selected:hover,
        .workflow-calendar-enhanced .rdp-day_selected:focus,
        .workflow-calendar-enhanced .rdp-day_selected:active {
          background-color: transparent !important;
          background: transparent !important;
          color: #ffffff !important;
          border: none !important;
          border-radius: 6px !important;
          outline: none !important;
          box-shadow: 0 0 0 2px rgba(40, 48, 72, 0.8) !important;
        }

        /* Remove qualquer fundo de células que contenham dias selecionados */
        .workflow-calendar-enhanced .rdp-cell:has(.rdp-day_selected),
        .workflow-calendar-enhanced .rdp-cell:has([aria-selected="true"]) {
          background-color: transparent !important;
          background: transparent !important;
        }

        /* Remove faixa (range) que pode causar fundo roxo */
        .workflow-calendar-enhanced .rdp-day_range_start,
        .workflow-calendar-enhanced .rdp-day_range_middle,
        .workflow-calendar-enhanced .rdp-day_range_end {
          background-color: transparent !important;
          color: inherit !important;
          box-shadow: none !important;
          border: none !important;
        }
      `}</style>

      <div className="flex justify-center p-4 w-full">
        <Card className="w-full max-w-full">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDayClick}
              className="rounded-md border w-full pointer-events-auto workflow-calendar-enhanced"
              modifiers={{
                hasItem: (date) => hasItemOnDay(date),
              }}
              modifiersStyles={{
                hasItem: {
                  fontWeight: 'bold',
                  color: '#ffffff',
                  background: 'transparent',
                  borderRadius: '6px',
                  border: '2px solid transparent',
                  animation: 'videoItemGlow 2.5s ease-in-out infinite',
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
                  background: 'transparent',
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

      <VideoWorkflowDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        workflowItems={itemsForSelectedDate}
        selectedDate={selectedDate || new Date()}
      />
    </>
  );
}
