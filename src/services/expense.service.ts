// src/services/expense.service.ts
import type { Expense, ExpenseListFilters } from '@models/expense.model';
import { ExpenseRepository } from '@repositories/expense.repository';

export class ExpenseService {
  constructor(private repo: ExpenseRepository) {}

  async create(expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
    try{
        return this.repo.create(expenseData);
    }catch(e: any){
        console.log('error ExpenseService.create',e);
        throw new Error(e);        
    }
  }

  async getAll(filters: ExpenseListFilters) {
    try{
        return this.repo.getAll(filters);
    }catch(e: any){
        console.log('error ExpenseService.getAll',e);
        throw new Error(e);        
    }
  }

    async delete(id: number) {
        try{
            return this.repo.delete(id);
        }catch(e: any){
            console.log('error ExpenseService.delete',e);
            throw new Error(e);        
        }
    }

    async toggleStatus(id: number) {
        try{
            return this.repo.toggleStatus(id);
        }catch(e: any){
            console.log('error ExpenseService.toggleStatus',e);
            throw new Error(e);        
        }
    }

    async update(id: number, data: any) {
        try{
            return this.repo.update(id, data);
        }catch(e: any){
            console.log('error ExpenseService.update',e);
            throw new Error(e);        
        }
    }

    async completeExpense(id: number, completionDate: string) {
        try{
            return this.repo.completeExpense(id, completionDate);
        }catch(e: any){
            console.log('error ExpenseService.completeExpense',e);
            throw new Error(e);        
        }
    }

    async getAllWithEffect(filters: ExpenseListFilters) {
        try{
            return this.repo.getAllWithEffect(filters);
        }catch(e: any){
            console.log('error ExpenseService.getAllWithEffect',e);
            throw new Error(e);        
        }
    }

}


