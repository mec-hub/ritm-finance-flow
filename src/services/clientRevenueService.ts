
import { ClientService } from './clientService';
import { TransactionService } from './transactionService';
import { EventService } from './eventService';

export class ClientRevenueService {
  /**
   * Updates the total revenue for all clients based on their associated transactions
   */
  static async updateAllClientRevenues(): Promise<void> {
    try {
      console.log('ClientRevenueService - Starting revenue update for all clients');
      
      // Get all necessary data
      const [clients, transactions, events] = await Promise.all([
        ClientService.getAll(),
        TransactionService.getAll(),
        EventService.getAll()
      ]);

      console.log('ClientRevenueService - Data loaded:', {
        clientsCount: clients.length,
        transactionsCount: transactions.length,
        eventsCount: events.length
      });

      // Calculate revenue for each client
      const clientRevenueMap = new Map<string, number>();
      
      // Initialize all clients with 0 revenue
      clients.forEach(client => {
        clientRevenueMap.set(client.id, 0);
      });

      // Process transactions to calculate revenue per client
      transactions.forEach(transaction => {
        // Only consider paid income transactions
        if (transaction.type === 'income' && transaction.status === 'paid') {
          
          // Method 1: Direct client relationship via clientId
          if (transaction.clientId && clientRevenueMap.has(transaction.clientId)) {
            const currentRevenue = clientRevenueMap.get(transaction.clientId) || 0;
            clientRevenueMap.set(transaction.clientId, currentRevenue + transaction.amount);
            return;
          }
          
          // Method 2: Indirect client relationship via eventId
          if (transaction.eventId) {
            const linkedEvent = events.find(event => event.id === transaction.eventId);
            
            if (linkedEvent && linkedEvent.clientId && clientRevenueMap.has(linkedEvent.clientId)) {
              // Direct client reference in event
              const currentRevenue = clientRevenueMap.get(linkedEvent.clientId) || 0;
              clientRevenueMap.set(linkedEvent.clientId, currentRevenue + transaction.amount);
            } else if (linkedEvent) {
              // Fallback: Find client by name matching (legacy support)
              const client = clients.find(c => c.name === linkedEvent.client);
              if (client && clientRevenueMap.has(client.id)) {
                const currentRevenue = clientRevenueMap.get(client.id) || 0;
                clientRevenueMap.set(client.id, currentRevenue + transaction.amount);
              }
            }
          }
        }
      });

      // Update each client's revenue in the database
      const updatePromises = clients.map(async (client) => {
        const calculatedRevenue = clientRevenueMap.get(client.id) || 0;
        
        // Only update if the revenue has changed
        if (client.totalRevenue !== calculatedRevenue) {
          console.log(`ClientRevenueService - Updating client ${client.name}: ${client.totalRevenue} -> ${calculatedRevenue}`);
          
          await ClientService.update(client.id, {
            totalRevenue: calculatedRevenue
          });
        }
      });

      await Promise.all(updatePromises);
      
      console.log('ClientRevenueService - Revenue update completed successfully');
      
    } catch (error) {
      console.error('ClientRevenueService - Error updating client revenues:', error);
      throw error;
    }
  }

  /**
   * Updates revenue for a specific client based on their transactions
   */
  static async updateClientRevenue(clientId: string): Promise<number> {
    try {
      console.log(`ClientRevenueService - Updating revenue for client: ${clientId}`);
      
      const [client, transactions, events] = await Promise.all([
        ClientService.getById(clientId),
        TransactionService.getAll(),
        EventService.getAll()
      ]);

      if (!client) {
        throw new Error(`Client with ID ${clientId} not found`);
      }

      let totalRevenue = 0;

      // Calculate revenue from transactions
      transactions.forEach(transaction => {
        if (transaction.type === 'income' && transaction.status === 'paid') {
          
          // Direct client relationship
          if (transaction.clientId === clientId) {
            totalRevenue += transaction.amount;
            return;
          }
          
          // Indirect through events
          if (transaction.eventId) {
            const linkedEvent = events.find(event => event.id === transaction.eventId);
            
            if (linkedEvent && linkedEvent.clientId === clientId) {
              totalRevenue += transaction.amount;
            } else if (linkedEvent && linkedEvent.client === client.name) {
              // Legacy fallback
              totalRevenue += transaction.amount;
            }
          }
        }
      });

      // Update the client's revenue
      await ClientService.update(clientId, {
        totalRevenue: totalRevenue
      });

      console.log(`ClientRevenueService - Updated client ${client.name} revenue to: ${totalRevenue}`);
      
      return totalRevenue;
      
    } catch (error) {
      console.error(`ClientRevenueService - Error updating revenue for client ${clientId}:`, error);
      throw error;
    }
  }
}
