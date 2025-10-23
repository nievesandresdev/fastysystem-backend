// src/models/expense.model.ts
export type Expense = {
  id: number;
  concept: string;
  amount: string;
  type: string; // fixed, temporary
  status: string; // with-effect, without-effect
  editable: boolean; // true para fixed, false para temporary
  startDate: string;
  endDate: string | null; // nullable - solo requerido para tipo "temporary"
  description: string;
  created_at: string;
  updated_at: string;
}

export type ExpenseListFilters = {
  startDate?: string;
  endDate?: string;
}

