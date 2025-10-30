import { Request, Response } from 'express';
import { CoinService } from '@services/coin.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import { validateRequired } from '@utils/validator'

export class CoinController {
  constructor(private coin: CoinService) {}

  getAll = async (req: Request, res: Response) => {
    
    try {
      const getAll = await this.coin.getAll();
      return respond(res, EnumResponse.SUCCESS, getAll, 'Monedas de cambio');
    } catch (e: any) {
      console.log('error CoinController.getAll',e);
      let msgError: string = 'error CoinController.getAll';
      let statusError: EnumResponse = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };


}

