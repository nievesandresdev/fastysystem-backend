import { Request, Response } from 'express';
import { ExchangeService } from '@services/exchange.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import { validateRequired } from '@utils/validator'

export class ExchangeController {
  constructor(private exchange: ExchangeService) {}

  // POST /api/exchange/create  { username, password }
  create = async (req: Request, res: Response) => {
    
    try {
      let request = req.body;
      const errors = validateRequired(request,["exchange"],{exchange: "Tasa de cambio"});
      //
      if(errors.length) return respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validacion');
      //
      const findActive = await this.exchange.findActive();
      let msgReq = "Tasa de cambio creada!";
      let response;
      if(!findActive || !findActive.id){
        response = await this.exchange.create(request);
      }else{
        msgReq = "Tasa de cambio actualizada!";
        response = await this.exchange.replace(findActive.id, request);
      }
      return respond(res, EnumResponse.SUCCESS, response, msgReq);
    } catch (e: any) {
      console.log('error ExchangeController.create',e);
      let msgError: string = 'error ExchangeController.create';
      let statusError: EnumResponse = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }

  };

  findActive = async (req: Request, res: Response) => {
    
    try {
      const findActive = await this.exchange.findActive();
      return respond(res, EnumResponse.SUCCESS, findActive, 'Tasa de cambio actual');
    } catch (e: any) {
      console.log('error ExchangeController.findActive',e);
      let msgError: string = 'error ExchangeController.findActive';
      let statusError: EnumResponse = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };


}

