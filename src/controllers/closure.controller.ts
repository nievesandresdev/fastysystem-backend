import { Request, Response } from "express";
import { ClosureService } from "@services/closure.service";
import { respond } from "@common/response";
import { EnumResponse } from "@common/EnumResponse";
import { serializeError } from "@common/helpers";

export class ClosureController {
  constructor(private service: ClosureService) {}

  create = async (req: Request, res: Response) => {
    try {
      const result = await this.service.createClosure();
      return respond(res, EnumResponse.SUCCESS, result, "Cierre realizado con éxito");
    } catch (e: any) {
      console.error("error ClosureController.create", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al realizar cierre"
      );
    }
  };

  getAll = async (req: Request, res: Response) => {
    try {
      const { startDate, endDate, page, perPage } = req.query;
      const filters = {
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        page: page ? Number(page) : 1,
        perPage: perPage ? Number(perPage) : 10,
      };
      const result = await this.service.getAllClosures(filters);
      return respond(res, EnumResponse.SUCCESS, result, "Cierres obtenidos con éxito");
    } catch (e: any) {
      console.error("error ClosureController.getAll", e);
      return respond(
        res,
        EnumResponse.INTERNAL_SERVER_ERROR,
        { error: serializeError(e) },
        "Error al obtener cierres"
      );
    }
  };
}

