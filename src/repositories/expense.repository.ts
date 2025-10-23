// src/repositories/expense.repository.ts
import type { Knex } from 'knex';
import type { Expense, ExpenseListFilters } from '@models/expense.model';

export class ExpenseRepository {
  constructor(private db: Knex) {}
  private static readonly TABLE = 'expenses';

  async create(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const [created] = await this.db<Expense>(ExpenseRepository.TABLE)
        .insert(expense)
        .returning('*');
      return created;
    } catch (e: any) {
      console.error('Error ExpenseRepository.create', e);
      throw e;
    }
  }

  async getAll(filters: ExpenseListFilters) {
    const startDate = filters.startDate ?? null;
    const endDate = filters.endDate ?? null;

    try {
      const query = this.db<Expense>(ExpenseRepository.TABLE)
        .select('*')
        .orderBy('startDate', 'desc');

      // Filtrar por rango de fechas si se proporcionan
      if (startDate && endDate) {
        query.where(function() {
          // Para gastos con fecha de fin: verificar que haya solapamiento con el rango
          this.where(function() {
            this.whereNotNull('endDate')
              .andWhere(function() {
                this.where('startDate', '<=', endDate)
                  .andWhere('endDate', '>=', startDate);
              });
          })
          // Para gastos sin fecha de fin (fijos): verificar que la fecha de inicio esté antes o durante el rango
          .orWhere(function() {
            this.whereNull('endDate')
              .andWhere('startDate', '<=', endDate);
          });
        });
      }

      const data = await query;

      return data;
    } catch (e: any) {
      console.error('Error ExpenseRepository.getAll', e);
      throw e;
    }
  }

  async getAllWithEffect(filters: ExpenseListFilters) {
    const startDate = filters.startDate ?? null;
    const endDate = filters.endDate ?? null;

    try {
      const query = this.db<Expense>(ExpenseRepository.TABLE)
        .select('*')
        .where('status', 'with-effect') // Solo gastos con efecto
        .orderBy('startDate', 'desc');

      // Filtrar por rango de fechas si se proporcionan
      if (startDate && endDate) {
        query.where(function() {
          // Para gastos con fecha de fin: verificar que haya solapamiento con el rango
          this.where(function() {
            this.whereNotNull('endDate')
              .andWhere(function() {
                this.where('startDate', '<=', endDate)
                  .andWhere('endDate', '>=', startDate);
              });
          })
          // Para gastos sin fecha de fin (fijos): verificar que la fecha de inicio esté antes o durante el rango
          .orWhere(function() {
            this.whereNull('endDate')
              .andWhere('startDate', '<=', endDate);
          });
        });
      }

      const data = await query;
      return data;
    } catch (e: any) {
      console.error('Error ExpenseRepository.getAllWithEffect', e);
      throw e;
    }
  }

    async delete(id: number) {
        try {
            const deleted = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .del();
            return deleted;
        } catch (e: any) {
            console.error('Error ExpenseRepository.delete', e);
            throw e;
        }
    }

    async toggleStatus(id: number) {
        try {
            // Primero obtener el gasto actual
            const expense = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .first();

            if (!expense) {
                throw new Error('Gasto no encontrado');
            }

            // Cambiar el status
            const newStatus = expense.status === 'with-effect' ? 'without-effect' : 'with-effect';
            
            const updated = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .update({ status: newStatus });

            return { updated, newStatus };
        } catch (e: any) {
            console.error('Error ExpenseRepository.toggleStatus', e);
            throw e;
        }
    }

    async update(id: number, data: any) {
        try {
            const updated = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .update({
                    concept: data.concept,
                    amount: data.amount,
                    startDate: data.startDate,
                    endDate: data.endDate || null,
                    description: data.description,
                    updated_at: new Date().toISOString()
                });

            if (!updated || updated === 0) {
                throw new Error('Gasto no encontrado');
            }

            // Retornar el gasto actualizado
            const updatedExpense = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .first();

            return updatedExpense;
        } catch (e: any) {
            console.error('Error ExpenseRepository.update', e);
            throw e;
        }
    }

    async completeExpense(id: number, completionDate: string) {
        try {
            // Primero obtener el gasto actual
            const expense = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .first();

            if (!expense) {
                throw new Error('Gasto no encontrado');
            }

            // Verificar que sea un gasto fijo
            if (expense.type !== 'fixed') {
                throw new Error('Solo se pueden culminar gastos fijos');
            }

            // Cambiar el tipo a temporal y establecer la fecha de culminación
            const updated = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .update({
                    type: 'temporary',
                    endDate: completionDate,
                    editable: false, // Los gastos temporales no son editables
                    updated_at: new Date().toISOString()
                });

            if (updated === 0) {
                throw new Error('Error al actualizar el gasto');
            }

            // Retornar el gasto actualizado
            const completedExpense = await this.db<Expense>(ExpenseRepository.TABLE)
                .where('id', id)
                .first();

            return completedExpense;
        } catch (e: any) {
            console.error('Error ExpenseRepository.completeExpense', e);
            throw e;
        }
    }

}
