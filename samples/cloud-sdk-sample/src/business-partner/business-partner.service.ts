import { Injectable } from '@nestjs/common';
import {
  businessPartnerService,
  BusinessPartner,
} from '../../services/business-partner-service';

@Injectable()
export class BusinessPartnerService {
  async getAllBusinessPartners(): Promise<BusinessPartner[]> {
    const { businessPartnerApi } = businessPartnerService();
    return await businessPartnerApi.requestBuilder().getAll().execute({
      destinationName: 'MockServer',
    });
  }
}
