import { Request, Response } from 'express';
import { ExpenseService } from '@services/expense.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import { validateRequired } from '@utils/validator'

export class ExpenseController {
  constructor(
    private expense: ExpenseService
  ) {}

  // POST /api/expense  { concept, amount, type, startDate, endDate, description }
  save = async (req: Request, res: Response) => {
    
    try {
      const formData = req.body;
      
      // Validar campos base
      const errors = validateRequired(
        formData,
        ["concept", "amount", "type", "startDate"],
        {
          concept: "Concepto del gasto",
          amount: "Monto del gasto",
          type: "Tipo de gasto",
          startDate: "Fecha de inicio"
        }
      );
      
      // Si el tipo es "temporary", endDate es obligatorio
      if (formData.type === "temporary") {
        const endDateErrors = validateRequired(
          formData,
          ["endDate"],
          {
            endDate: "Fecha de culminación"
          }
        );
        errors.push(...endDateErrors);
      }
      
      // Establecer editable según el tipo
      if (formData.type === "fixed") {
        formData.editable = true;
        formData.endDate = null; // asegurar que endDate sea null para fixed
      } else if (formData.type === "temporary") {
        formData.editable = false;
      }
      
      //
      if(errors.length) return respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validacion');
      //
      let msgReq = "Gasto creado con éxito!";
      let save;
      if(formData.id){
        save = await this.expense.create(req.body);
        msgReq = "Gasto actualizado!";
      }else{
        save = await this.expense.create(req.body);
      }
      return respond(res, EnumResponse.SUCCESS, save, msgReq);
    } catch (e: any) {
      console.log('error ExpenseController.save',e);
      let msgError: string = 'error ExpenseController.save';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
    }

  };

  getAll = async (req: Request, res: Response) => {
    
    try {
      const getAll = await this.expense.getAll(req.query);
      return respond(res, EnumResponse.SUCCESS, getAll, 'Lista de gastos');
    } catch (e: any) {
      console.log('error ExpenseController.getAll',e);
      let msgError: string = 'error ExpenseController.getAll';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
    }
    
  };

    delete = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.expense.delete(parseInt(id));
            return respond(res, EnumResponse.SUCCESS, null, 'Gasto eliminado exitosamente');
        } catch (e: any) {
            console.log('error ExpenseController.delete', e);
            let msgError: string = 'error ExpenseController.delete';
            let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
            return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
        }
    };

    toggleStatus = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const result = await this.expense.toggleStatus(parseInt(id));
            const message = result.newStatus === 'with-effect' 
                ? 'Gasto activado exitosamente' 
                : 'Gasto desactivado exitosamente';
            return respond(res, EnumResponse.SUCCESS, result, message);
        } catch (e: any) {
            console.log('error ExpenseController.toggleStatus', e);
            let msgError: string = 'error ExpenseController.toggleStatus';
            let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
            return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
        }
    };

    update = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const data = req.body;
            
            // Validaciones básicas
            if (!data.concept || !data.amount || !data.startDate) {
                return respond(
                    res,
                    EnumResponse.BAD_REQUEST,
                    { error: 'Concepto, monto y fecha de inicio son requeridos' },
                    'Datos requeridos faltantes'
                );
            }

            const updatedExpense = await this.expense.update(parseInt(id), data);
            return respond(res, EnumResponse.SUCCESS, updatedExpense, 'Gasto actualizado exitosamente');
        } catch (e: any) {
            console.log('error ExpenseController.update', e);
            let msgError: string = 'error ExpenseController.update';
            let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
            return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
        }
    };

    completeExpense = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { completionDate } = req.body;
            
            // Validaciones básicas
            if (!completionDate) {
                return respond(
                    res,
                    EnumResponse.BAD_REQUEST,
                    { error: 'La fecha de culminación es requerida' },
                    'Fecha de culminación requerida'
                );
            }

            const completedExpense = await this.expense.completeExpense(parseInt(id), completionDate);
            return respond(res, EnumResponse.SUCCESS, completedExpense, 'Gasto culminado exitosamente');
        } catch (e: any) {
            console.log('error ExpenseController.completeExpense', e);
            let msgError: string = 'error ExpenseController.completeExpense';
            let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
            return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
        }
    };

    getAllWithEffect = async (req: Request, res: Response) => {
        try {
            const filters = req.query as any;
            const expenses = await this.expense.getAllWithEffect(filters);
            return respond(res, EnumResponse.SUCCESS, expenses, "Gastos con efecto obtenidos");
        } catch (e: any) {
            console.log('error ExpenseController.getAllWithEffect', e);
            let msgError: string = 'error ExpenseController.getAllWithEffect';
            let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
            return respond(res, statusError as EnumResponse, { error: serializeError(e) }, msgError);
        }
    };

}


