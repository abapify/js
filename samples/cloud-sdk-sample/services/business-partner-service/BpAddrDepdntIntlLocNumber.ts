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
import type { BpAddrDepdntIntlLocNumberApi } from './BpAddrDepdntIntlLocNumberApi';

/**
 * This class represents the entity "A_BPAddrDepdntIntlLocNumber" of service "API_BUSINESS_PARTNER".
 */
export class BpAddrDepdntIntlLocNumber<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpAddrDepdntIntlLocNumberType<T>
{
  /**
   * Technical entity name for BpAddrDepdntIntlLocNumber.
   */
  static override _entityName = 'A_BPAddrDepdntIntlLocNumber';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpAddrDepdntIntlLocNumber entity.
   */
  static _keys = ['BusinessPartner', 'AddressID'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Address Number.
   * Maximum length: 10.
   */
  declare addressId: DeserializedType<T, 'Edm.String'>;
  /**
   * International location number  (part 1).
   * Maximum length: 7.
   * @nullable
   */
  declare internationalLocationNumber1?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * International location number (Part 2).
   * Maximum length: 5.
   * @nullable
   */
  declare internationalLocationNumber2?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Check digit for the international location number.
   * Maximum length: 1.
   * @nullable
   */
  declare internationalLocationNumber3?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  constructor(_entityApi: BpAddrDepdntIntlLocNumberApi<T>) {
    super(_entityApi);
  }
}

export interface BpAddrDepdntIntlLocNumberType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  internationalLocationNumber1?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber2?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber3?: DeserializedType<T, 'Edm.String'> | null;
}
