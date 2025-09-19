import { Request, Response } from 'express';
import { ClientService } from '@services/client.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import { validateRequired } from '@utils/validator'

export class ClientController {
  constructor(private client: ClientService) {}

  save = async (req: Request, res: Response) => {
    
    try {
      let request = req.body;
      const errors = validateRequired(
        request,
        ["document","name"],
        {document: "Numero de cedula", name: "Nombre"}
      );
      //
      if(errors.length) return respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validacion');
      //
      const save = await this.client.save(request);
      return respond(res, EnumResponse.SUCCESS, save, "Datos del cliente actualizados!");
    } catch (e: any) {
      console.log('error ClientController.save',e);
      let msgError: string = 'error ClientController.save';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }

  };

  getClientsByDocument = async (req: Request, res: Response) => {
    try {
      const getAll = await this.client.getAll(req.query);
      return respond(res, EnumResponse.SUCCESS, getAll, 'Lista de clientes');
    } catch (e: any) {
      console.log('error ClientController.getClientsByDocument',e);
      let msgError: string = 'error ClientController.getClientsByDocument';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };


  searchClient = async (req: Request, res: Response) => {
    
    try {

      const clients = await this.client.searchClient(req.query.search);
      return respond(res, EnumResponse.SUCCESS, clients, 'Lista de clientes');
    } catch (e: any) {
      console.log('error ClientController.searchClient',e);
      let msgError: string = 'error ClientController.searchClient';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };
}

