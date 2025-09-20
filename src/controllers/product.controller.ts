import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { ProductService } from '@services/product.service';
import { MeasurementUnitService } from '@services/measurementUnit.service';
import { respond } from '@common/response';
import { EnumResponse } from '@common/EnumResponse';
import { serializeError } from '@common/helpers';
import AuthError from '@common/errors/AuthError'
import { validateRequired } from '@utils/validator'

export class ProductController {
  constructor(
    private product: ProductService,
    private measurementUnit: MeasurementUnitService
  ) {}

  // POST /api/product/create  { username, password }
  save = async (req: Request, res: Response) => {
    
    try {
      const formData = req.body;
      const errors = validateRequired(
        formData,
        ["name", "typeStockId","priceCExchange","priceRExchange","priceCLocal","priceRLocal", "stock","minStock"],
        {
          name: "Nombre del producto",
          typeStockId: "Unidad de Medición",
          priceCExchange: "Precio costo al cambio",
          priceRExchange: "Precio venta al cambio",
          priceCLocal: "Precio costo en Bs",
          priceRLocal: "Precio venta  en Bs",
          stock: "Stock",
          minStock: "Mínimo stock",
        }
      );
      //
      if(errors.length) return respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validacion');
      //
      let msgReq = "Producto creado con exito!";
      let save;
      if(formData.id){
        save = await this.product.update(req.body);
        msgReq = "Producto actualizado!";
      }else{
        save = await this.product.create(req.body);
      }
      return respond(res, EnumResponse.SUCCESS, save, msgReq);
    } catch (e: any) {
      console.log('error ProductController.save',e);
      let msgError: string = 'error ProductController.save';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }

  };

  getAll = async (req: Request, res: Response) => {
    
    try {
      const getAll = await this.product.getAll(req.query);
      return respond(res, EnumResponse.SUCCESS, getAll, 'Lista de productos');
    } catch (e: any) {
      console.log('error ProductController.getAll',e);
      let msgError: string = 'error ProductController.getAll';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };

  getMeasurementUnits = async (req: Request, res: Response) => {
    
    try {
      const getMeasurementUnits = await this.measurementUnit.getAll();
      return respond(res, EnumResponse.SUCCESS, getMeasurementUnits, 'Lista de tipos de unidad');
    } catch (e: any) {
      console.log('error ProductController.getMeasurementUnits',e);
      let msgError: string = 'error ProductController.getMeasurementUnits';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };

  delete = async (req: Request, res: Response) => {
    
    try {
      const data = req.params;
      const errors = validateRequired(
        data,
        ["id"],
        {
          id: "ID requerido"
        }
      );
      //
      if(errors.length) return respond(res, EnumResponse.BAD_REQUEST, { error: errors[0] }, 'Error de validacion');
      //
      const del = await this.product.delete(data.id);
      return respond(res, EnumResponse.SUCCESS, del, "Producto eliminado!");
    } catch (e: any) {
      console.log('error ProductController.delete',e);
      let msgError: string = 'error ProductController.delete';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }

  };

  searchProduct = async (req: Request, res: Response) => {
    
    try {

      const products = await this.product.searchProduct(req.query.search);
      return respond(res, EnumResponse.SUCCESS, products, 'Lista de productos');
    } catch (e: any) {
      console.log('error ProductController.searchProduct',e);
      let msgError: string = 'error ProductController.searchProduct';
      let statusError: string = EnumResponse.INTERNAL_SERVER_ERROR;
      return respond(res, statusError, { error: serializeError(e) }, msgError);
    }
    
  };
}

