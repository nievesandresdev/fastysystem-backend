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
}
