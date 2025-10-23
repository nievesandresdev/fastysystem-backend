import { Request, Response } from "express";
import { SaleService } from "@services/sale.service";
import { respond } from "@common/response";
import { EnumResponse } from "@common/EnumResponse";
import { serializeError } from "@common/helpers";

export class SaleController {
  constructor(private service: SaleService) {}

  save = async (req: Request, res: Response) => {
    try {
      const sale = await this.service.save(req.body);
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
}
