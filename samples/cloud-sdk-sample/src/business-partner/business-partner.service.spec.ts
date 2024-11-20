import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPartnerService } from './business-partner.service';

describe('BusinessPartnerService', () => {
  let service: BusinessPartnerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusinessPartnerService],
    }).compile();

    service = module.get<BusinessPartnerService>(BusinessPartnerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
