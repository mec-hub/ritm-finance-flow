import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPreview } from '@/components/MapPreview';
import { Event } from '@/types';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, Clock, User, MapPin, DollarSign, Calculator,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: Event[];
  selectedDate: Date;
}

export function EventDetailsModal({ isOpen, onClose, events, selectedDate }: EventDetailsModalProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const navigate = useNavigate();

  const sortedEvents = [...events].sort((a, b) => {
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime && !b.startTime) return -1;
    if (!a.startTime && b.startTime) return 1;
    return a.title.localeCompare(b.title);
  });

  const currentEvent = sortedEvents[currentEventIndex];
  const hasMultipleEvents = sortedEvents.length > 1;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge className="bg-blue-500 hover:bg-blue-600 text-white">Próximo</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600 text-white">Concluído</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500 hover:bg-red-600 text-white">Cancelado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleEdit = () => {
    navigate(`/eventos/editar/${currentEvent.id}`);
    onClose();
  };

  const goToPrevious = () => {
    setCurrentEventIndex((prev) => prev > 0 ? prev - 1 : sortedEvents.length - 1);
  };

  const goToNext = () => {
    setCurrentEventIndex((prev) => prev < sortedEvents.length - 1 ? prev + 1 : 0);
  };

  if (!currentEvent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-black text-white border-gray-700">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-white">
              {currentEvent.title}
            </DialogTitle>
            {hasMultipleEvents && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPrevious}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-400">
                  {currentEventIndex + 1} de {sortedEvents.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNext}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-gray-400">Detalhes completos do evento</p>
        </DialogHeader>

        <div className="space-y-6 mt-6">

          {/* Status */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-gray-400">Status</span>
              {getStatusBadge(currentEvent.status)}
            </div>
          </div>

          {/* Data e horário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Data</p>
                <p className="font-medium">{formatDate(currentEvent.date)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Horário</p>
                <p className="font-medium">
                  {currentEvent.startTime && currentEvent.endTime
                    ? `${currentEvent.startTime.slice(0, 5)} - ${currentEvent.endTime.slice(0, 5)}`
                    : currentEvent.startTime
                      ? `A partir das ${currentEvent.startTime.slice(0, 5)}`
                      : currentEvent.endTime
                        ? `Até às ${currentEvent.endTime.slice(0, 5)}`
                        : 'Não definido'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Cliente e local */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <User className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cliente</p>
                <p className="font-medium">{currentEvent.client}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Local</p>
                <p className="font-medium">{currentEvent.placeName || currentEvent.location}</p>
              </div>
            </div>
          </div>

          {/* Informações financeiras */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Receita Estimada</p>
                <p className="font-medium text-green-400">
                  {formatCurrency(currentEvent.estimatedRevenue)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Despesa Estimada</p>
                <p className="font-medium text-red-400">
                  {formatCurrency(currentEvent.estimatedExpenses)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Lucro Estimado</p>
                <p className={cn(
                  "font-medium",
                  (currentEvent.estimatedRevenue - currentEvent.estimatedExpenses) >= 0 
                    ? "text-blue-400" 
                    : "text-red-400"
                )}>
                  {formatCurrency(currentEvent.estimatedRevenue - currentEvent.estimatedExpenses)}
                </p>
              </div>
            </div>
          </div>

          {/* Mapa */}
          {currentEvent.latitude && currentEvent.longitude && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Localização</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden">
                <MapPreview
                  latitude={currentEvent.latitude}
                  longitude={currentEvent.longitude}
                  placeName={currentEvent.placeName || currentEvent.location}
                  className="w-full h-48 rounded-lg border border-gray-700"
                />
              </div>
              {currentEvent.formattedAddress && (
                <p className="text-sm text-gray-400 mt-2">
                  {currentEvent.formattedAddress}
                </p>
              )}
            </div>
          )}

          {/* Notas */}
          {currentEvent.notes && (
            <div className="space-y-2">
              <p className="text-sm text-gray-400">Observações</p>
              <p className="text-sm leading-relaxed bg-gray-800 p-3 rounded-lg">{currentEvent.notes}</p>
            </div>
          )}

          {/* Botões */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-700">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Fechar
            </Button>
            <Button 
              onClick={handleEdit}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium"
            >
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
