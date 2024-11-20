/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType,
} from '@sap-cloud-sdk/odata-v2';
import type { BuPaIndustryApi } from './BuPaIndustryApi';

/**
 * This class represents the entity "A_BuPaIndustry" of service "API_BUSINESS_PARTNER".
 */
export class BuPaIndustry<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BuPaIndustryType<T>
{
  /**
   * Technical entity name for BuPaIndustry.
   */
  static override _entityName = 'A_BuPaIndustry';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BuPaIndustry entity.
   */
  static _keys = ['IndustrySector', 'IndustrySystemType', 'BusinessPartner'];
  /**
   * Industry.
   * Maximum length: 10.
   */
  declare industrySector: DeserializedType<T, 'Edm.String'>;
  /**
   * Industry System.
   * Maximum length: 4.
   */
  declare industrySystemType: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Industry is Standard for BP in Industry System.
   * Maximum length: 1.
   * @nullable
   */
  declare isStandardIndustry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Description.
   * Maximum length: 100.
   * @nullable
   */
  declare industryKeyDescription?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BuPaIndustryApi<T>) {
    super(_entityApi);
  }
}

export interface BuPaIndustryType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  industrySector: DeserializedType<T, 'Edm.String'>;
  industrySystemType: DeserializedType<T, 'Edm.String'>;
  businessPartner: DeserializedType<T, 'Edm.String'>;
  isStandardIndustry?: DeserializedType<T, 'Edm.String'> | null;
  industryKeyDescription?: DeserializedType<T, 'Edm.String'> | null;
}
