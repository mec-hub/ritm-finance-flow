
import { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { mockEvents } from '@/data/mockData';
import { EventsCalendar } from '@/components/events/EventsCalendar';
import { EventsList } from '@/components/events/EventsList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EventStats } from '@/components/events/EventStats';
import { Link } from 'react-router-dom';

const Eventos = () => {
  const [events] = useState(mockEvents);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>
            <p className="text-muted-foreground">
              Gerencie seus shows e apresentações.
            </p>
          </div>
          <Button asChild>
            <Link to="/novo-evento">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novo Evento
            </Link>
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <EventStats events={events} />
        </div>
        
        <Tabs defaultValue="lista" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lista">Lista de Eventos</TabsTrigger>
            <TabsTrigger value="calendario">Calendário</TabsTrigger>
          </TabsList>
          <TabsContent value="lista" className="mt-4">
            <div className="dashboard-card">
              <EventsList events={events} />
            </div>
          </TabsContent>
          <TabsContent value="calendario" className="mt-4">
            <div className="dashboard-card">
              <EventsCalendar events={events} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Eventos;
