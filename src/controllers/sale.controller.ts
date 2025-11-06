import { Request, Response } from "express";
import { SaleService } from "@services/sale.service";
import { respond } from "@common/response";
import { EnumResponse } from "@common/EnumResponse";
import { serializeError } from "@common/helpers";
import { AuthRequest } from "@middleware/auth.middleware";

export class SaleController {
  constructor(private service: SaleService) {}

  save = async (req: AuthRequest, res: Response) => {
    try {
      // Obtener el userId del token de autenticación
      const userId = req.user?.sub;
      if (!userId) {
        return respond(
          res,
          EnumResponse.UNAUTHORIZED,
          { error: 'Usuario no autenticado' },
          "Error de autenticación"
        );
      }

      const sale = await this.service.save({ ...req.body, userId: Number(userId) });
      return respond(res, EnumResponse.SUCCESS, sale, "Venta guardada!");
    } catch (e: any) {
      console.error("error SaleController.save", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al guardar venta"
      );
    }
  };

  getStats = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return respond(
          res,
          EnumResponse.BAD_REQUEST,
          { error: 'startDate and endDate are required' },
          'Fechas de inicio y fin son requeridas'
        );
      }

      const stats = await this.service.getSalesStats(startDate as string, endDate as string);
      return respond(res, EnumResponse.SUCCESS, stats, "Estadísticas de ventas obtenidas");
    } catch (e: any) {
      console.error("error SaleController.getStats", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al obtener estadísticas de ventas"
      );
    }
  };

  getMonthlyReport = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return respond(
          res,
          EnumResponse.BAD_REQUEST,
          { error: 'startDate and endDate are required' },
          'Fechas de inicio y fin son requeridas'
        );
      }

      const report = await this.service.getMonthlyReport(startDate as string, endDate as string);
      return respond(res, EnumResponse.SUCCESS, report, "Reporte mensual obtenido");
    } catch (e: any) {
      console.error("error SaleController.getMonthlyReport", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al obtener reporte mensual"
      );
    }
  };

  getCurrentPeriodStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.service.getCurrentPeriodStats();
      return respond(res, EnumResponse.SUCCESS, stats, "Estadísticas del período actual obtenidas");
    } catch (e: any) {
      console.error("error SaleController.getCurrentPeriodStats", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al obtener estadísticas del período actual"
      );
    }
  };

  getTopProductsAndLowStock = async (req: Request, res: Response) => {
    try {
      const data = await this.service.getTopProductsAndLowStock();
      return respond(res, EnumResponse.SUCCESS, data, "Productos top y con stock bajo obtenidos");
    } catch (e: any) {
      console.error("error SaleController.getTopProductsAndLowStock", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al obtener productos top y con stock bajo"
      );
    }
  };
}
