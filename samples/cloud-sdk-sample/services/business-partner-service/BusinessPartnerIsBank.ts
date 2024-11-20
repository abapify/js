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
import type { BusinessPartnerIsBankApi } from './BusinessPartnerIsBankApi';

/**
 * This class represents the entity "A_BusinessPartnerIsBank" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerIsBank<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusinessPartnerIsBankType<T>
{
  /**
   * Technical entity name for BusinessPartnerIsBank.
   */
  static override _entityName = 'A_BusinessPartnerIsBank';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerIsBank entity.
   */
  static _keys = ['BusinessPartner'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Bank Keys.
   * Maximum length: 15.
   * @nullable
   */
  declare bankKey?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Bank Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare bankCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Minimum Reserve Requirement for Bank.
   * Maximum length: 1.
   * @nullable
   */
  declare bpMinimumReserve?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerIsBankApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerIsBankType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bankKey?: DeserializedType<T, 'Edm.String'> | null;
  bankCountry?: DeserializedType<T, 'Edm.String'> | null;
  bpMinimumReserve?: DeserializedType<T, 'Edm.String'> | null;
}
