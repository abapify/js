import { Controller, Get, HttpException } from '@nestjs/common';
import { BusinessPartner } from '../../services/business-partner-service';
import { BusinessPartnerService } from './business-partner.service';

@Controller('business-partner')
export class BusinessPartnerController {
  constructor(private businessPartnerService: BusinessPartnerService) {}

  @Get()
  async getBusinessPartners(): Promise<BusinessPartner[]> {
    return await this.businessPartnerService
      .getAllBusinessPartners()
      .catch((error) => {
        throw new HttpException(
          `Failed to get business partners - ${error.message}`,
          500,
        );
      });
  }
}
