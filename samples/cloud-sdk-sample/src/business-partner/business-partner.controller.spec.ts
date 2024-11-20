import { Test, TestingModule } from '@nestjs/testing';
import { BusinessPartnerController } from './business-partner.controller';

describe('BusinessPartnerController', () => {
  let controller: BusinessPartnerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusinessPartnerController],
    }).compile();

    controller = module.get<BusinessPartnerController>(
      BusinessPartnerController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
