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
import type { BusPartAddrDepdntTaxNmbrApi } from './BusPartAddrDepdntTaxNmbrApi';

/**
 * This class represents the entity "A_BusPartAddrDepdntTaxNmbr" of service "API_BUSINESS_PARTNER".
 */
export class BusPartAddrDepdntTaxNmbr<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusPartAddrDepdntTaxNmbrType<T>
{
  /**
   * Technical entity name for BusPartAddrDepdntTaxNmbr.
   */
  static override _entityName = 'A_BusPartAddrDepdntTaxNmbr';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusPartAddrDepdntTaxNmbr entity.
   */
  static _keys = ['BusinessPartner', 'AddressID', 'BPTaxType'];
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
   * Tax Number Category.
   * Maximum length: 4.
   */
  declare bpTaxType: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Tax Number.
   * Maximum length: 20.
   * @nullable
   */
  declare bpTaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Tax Number.
   * Maximum length: 60.
   * @nullable
   */
  declare bpTaxLongNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusPartAddrDepdntTaxNmbrApi<T>) {
    super(_entityApi);
  }
}

export interface BusPartAddrDepdntTaxNmbrType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  bpTaxType: DeserializedType<T, 'Edm.String'>;
  bpTaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  bpTaxLongNumber?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
