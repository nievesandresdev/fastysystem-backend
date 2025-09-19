import type { ClientData } from '@models/client.model';
import { ClientRepository } from '@repositories/client.repository';
import { ClientService } from '@services/client.service';

export class ClientService {
  constructor(private repo: ClientRepository) {}

  async save(request: Omit<ClientData, 'created_at' | 'updated_at'>) {
    try{
        //validate
        const existing = await this.repo.getOne({ document: request?.document });
        if (existing) {
            return this.repo.update(request);
        }
        return this.repo.create(request);
    }catch(e: any){
        console.log('error ClientService.save',e);
        throw new Error(e);        
    }
  }


  async getAll(filters :{ search: string}) {
    try{
        const clients = await this.repo.getAll(filters);
        return clients;
    }catch(e: any){
        console.log('error ClientService.get',e);
        throw new Error('error ClientService.get');        
    }
  }

  async searchClient(search: string) {
    try{
        const clients = await this.repo.searchClient(search);
        return clients;
    }catch(e: any){
        console.log('error ClientService.searchClient',e);
        throw new Error('error ClientService.searchClient');        
    }
  }

}