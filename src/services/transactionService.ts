import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types';
import { RecurringTransactionService } from './recurringTransactionService';

export interface TeamTransactionAssignment {
  id?: string;
  teamMemberId: string;
  percentageValue: number;
  teamMemberName?: string;
}

export class TransactionService {
  // Helper function to format date consistently - using the exact same approach as events
  private static formatDateForDB(date: Date): string {
    // Get the date components in local time without any timezone manipulation
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  static async getAll(): Promise<Transaction[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .rpc('get_transactions_with_team_data', { user_id_param: userData.user.id });

    if (error) throw error;

    return data?.map((transaction: any) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date + 'T00:00:00'),
      category: transaction.category,
      subcategory: transaction.subcategory,
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval,
      recurrenceMonths: transaction.recurrence_months,
      type: transaction.type as 'income' | 'expense',
      eventId: transaction.event_id,
      clientId: transaction.client_id,
      teamMemberId: undefined,
      // Properly map team assignments with correct property names
      teamPercentages: transaction.team_assignments?.map((assignment: any) => ({
        teamMemberId: assignment.team_member_id,
        percentageValue: assignment.percentage_value,
        teamMemberName: assignment.team_member_name
      })) || [],
      notes: transaction.notes,
      percentageValue: undefined,
      status: transaction.status as 'paid' | 'not_paid' | 'canceled',
      attachments: transaction.attachments || []
    })) || [];
  }

  static async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        team_transaction_assignments(
          id,
          team_member_id,
          percentage_value,
          team_members(name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      amount: data.amount,
      description: data.description,
      date: new Date(data.date + 'T00:00:00'),
      category: data.category,
      subcategory: data.subcategory,
      isRecurring: data.is_recurring || false,
      recurrenceInterval: data.recurrence_interval,
      recurrenceMonths: data.recurrence_months,
      type: data.type as 'income' | 'expense',
      eventId: data.event_id,
      clientId: data.client_id,
      teamMemberId: undefined,
      teamPercentages: data.team_transaction_assignments?.map((assignment: any) => ({
        teamMemberId: assignment.team_member_id,
        percentageValue: assignment.percentage_value,
        teamMemberName: assignment.team_members?.name
      })) || [],
      notes: data.notes,
      percentageValue: undefined,
      status: data.status as 'paid' | 'not_paid' | 'canceled',
      attachments: data.attachments || []
    };
  }

  static async create(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    console.log('TransactionService.create - Creating transaction:', transaction);
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    // Format date using the same approach as events - no timezone manipulation
    const formattedDate = this.formatDateForDB(transaction.date);

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        amount: transaction.amount,
        description: transaction.description,
        date: formattedDate,
        category: transaction.category,
        subcategory: transaction.subcategory,
        is_recurring: transaction.isRecurring,
        recurrence_interval: transaction.recurrenceInterval,
        recurrence_months: transaction.recurrenceMonths,
        type: transaction.type,
        event_id: transaction.eventId,
        client_id: transaction.clientId,
        notes: transaction.notes,
        status: transaction.status || 'not_paid',
        attachments: transaction.attachments || [],
        user_id: userData.user.id
      })
      .select()
      .single();

    if (error) throw error;

    console.log('TransactionService.create - Transaction created:', data.id);

    // Create team assignments
    if (transaction.teamPercentages && transaction.teamPercentages.length > 0) {
      const assignments = transaction.teamPercentages.map(assignment => ({
        transaction_id: data.id,
        team_member_id: assignment.teamMemberId,
        percentage_value: assignment.percentageValue
      }));

      const { error: assignmentError } = await supabase
        .from('team_transaction_assignments')
        .insert(assignments);

      if (assignmentError) throw assignmentError;
    }

    // Create recurring schedule if this is a recurring transaction
    if (transaction.isRecurring && transaction.recurrenceMonths && transaction.recurrenceMonths > 1) {
      console.log('TransactionService.create - Creating recurring schedule for transaction:', data.id);
      
      try {
        await RecurringTransactionService.createRecurringSchedule(
          data.id,
          transaction.date,
          transaction.recurrenceMonths
        );
        console.log('TransactionService.create - Recurring schedule created successfully');
      } catch (recurringError) {
        console.error('TransactionService.create - Error creating recurring schedule:', recurringError);
        // Don't throw here as the main transaction was created successfully
        // We could show a warning to the user instead
      }
    }

    return { ...transaction, id: data.id };
  }

  static async update(id: string, updates: Partial<Transaction>): Promise<{ success: boolean; message?: string }> {
    // Get the current transaction to compare recurring settings
    const currentTransaction = await this.getById(id);
    if (!currentTransaction) {
      throw new Error('Transaction not found');
    }

    const updateData: any = {};
    
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) {
      // Use the same simple date formatting as events
      updateData.date = this.formatDateForDB(updates.date);
    }
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
    if (updates.isRecurring !== undefined) updateData.is_recurring = updates.isRecurring;
    if (updates.recurrenceInterval !== undefined) updateData.recurrence_interval = updates.recurrenceInterval;
    if (updates.recurrenceMonths !== undefined) updateData.recurrence_months = updates.recurrenceMonths;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.eventId !== undefined) updateData.event_id = updates.eventId;
    if (updates.clientId !== undefined) updateData.client_id = updates.clientId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.attachments !== undefined) updateData.attachments = updates.attachments;

    const { error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    // Update team assignments if provided
    if (updates.teamPercentages !== undefined) {
      // Delete existing assignments
      await supabase
        .from('team_transaction_assignments')
        .delete()
        .eq('transaction_id', id);

      // Create new assignments
      if (updates.teamPercentages.length > 0) {
        const assignments = updates.teamPercentages.map(assignment => ({
          transaction_id: id,
          team_member_id: assignment.teamMemberId,
          percentage_value: assignment.percentageValue
        }));

        const { error: assignmentError } = await supabase
          .from('team_transaction_assignments')
          .insert(assignments);

        if (assignmentError) throw assignmentError;
      }
    }

    // Handle recurring schedule updates
    let recurringUpdateResult = null;
    if (currentTransaction.isRecurring && updates.recurrenceMonths !== undefined) {
      const currentMonths = currentTransaction.recurrenceMonths || 1;
      const newMonths = updates.recurrenceMonths;
      
      console.log('TransactionService.update - Recurring months changed:', { currentMonths, newMonths });
      
      if (currentMonths !== newMonths && newMonths > 1) {
        try {
          recurringUpdateResult = await RecurringTransactionService.updateRecurringSchedule(
            id,
            updates.date || currentTransaction.date,
            newMonths
          );
          console.log('TransactionService.update - Recurring schedule update result:', recurringUpdateResult);
        } catch (recurringError) {
          console.error('TransactionService.update - Error updating recurring schedule:', recurringError);
          // Don't throw here as the main transaction was updated successfully
          return {
            success: true,
            message: `Transaction updated, but there was an issue with the recurring schedule: ${recurringError instanceof Error ? recurringError.message : 'Unknown error'}`
          };
        }
      }
    }

    // Handle case where transaction is no longer recurring
    if (currentTransaction.isRecurring && updates.isRecurring === false) {
      try {
        await RecurringTransactionService.deleteRecurringTransactions(id);
        console.log('TransactionService.update - Deleted recurring schedule for non-recurring transaction');
      } catch (recurringError) {
        console.error('TransactionService.update - Error deleting recurring schedule:', recurringError);
        return {
          success: true,
          message: 'Transaction updated, but there was an issue cleaning up the recurring schedule.'
        };
      }
    }

    return {
      success: true,
      message: recurringUpdateResult?.message || 'Transaction updated successfully'
    };
  }

  static async delete(id: string): Promise<void> {
    // Delete team assignments first
    await supabase
      .from('team_transaction_assignments')
      .delete()
      .eq('transaction_id', id);

    // Delete recurring transactions if this is a parent transaction
    try {
      await RecurringTransactionService.deleteRecurringTransactions(id);
    } catch (error) {
      console.error('Error deleting recurring transactions:', error);
      // Continue with deleting the main transaction even if recurring deletion fails
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  static async getByFilters(filters: {
    category?: string;
    type?: 'income' | 'expense';
    dateFrom?: Date;
    dateTo?: Date;
    eventId?: string;
    clientId?: string;
  }): Promise<Transaction[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('User not authenticated');

    let query = supabase
      .rpc('get_transactions_with_team_data', { user_id_param: userData.user.id });

    const { data, error } = await query;

    if (error) throw error;

    let filteredData = data || [];

    if (filters.category) {
      filteredData = filteredData.filter((t: any) => t.category === filters.category);
    }
    if (filters.type) {
      filteredData = filteredData.filter((t: any) => t.type === filters.type);
    }
    if (filters.dateFrom) {
      filteredData = filteredData.filter((t: any) => 
        new Date(t.date) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      filteredData = filteredData.filter((t: any) => 
        new Date(t.date) <= filters.dateTo!
      );
    }
    if (filters.eventId) {
      filteredData = filteredData.filter((t: any) => t.event_id === filters.eventId);
    }
    if (filters.clientId) {
      filteredData = filteredData.filter((t: any) => t.client_id === filters.clientId);
    }

    return filteredData.map((transaction: any) => ({
      id: transaction.id,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date + 'T00:00:00'),
      category: transaction.category,
      subcategory: transaction.subcategory,
      isRecurring: transaction.is_recurring || false,
      recurrenceInterval: transaction.recurrence_interval,
      recurrenceMonths: transaction.recurrence_months,
      type: transaction.type as 'income' | 'expense',
      eventId: transaction.event_id,
      clientId: transaction.client_id,
      teamMemberId: undefined,
      // Properly map team assignments with correct property names
      teamPercentages: transaction.team_assignments?.map((assignment: any) => ({
        teamMemberId: assignment.team_member_id,
        percentageValue: assignment.percentage_value,
        teamMemberName: assignment.team_member_name
      })) || [],
      notes: transaction.notes,
      percentageValue: undefined,
      status: transaction.status as 'paid' | 'not_paid' | 'canceled',
      attachments: transaction.attachments || []
    }));
  }
}
