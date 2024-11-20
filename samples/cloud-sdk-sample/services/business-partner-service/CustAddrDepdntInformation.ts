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
import type { CustAddrDepdntInformationApi } from './CustAddrDepdntInformationApi';

/**
 * This class represents the entity "A_CustAddrDepdntInformation" of service "API_BUSINESS_PARTNER".
 */
export class CustAddrDepdntInformation<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements CustAddrDepdntInformationType<T>
{
  /**
   * Technical entity name for CustAddrDepdntInformation.
   */
  static override _entityName = 'A_CustAddrDepdntInformation';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustAddrDepdntInformation entity.
   */
  static _keys = ['Customer', 'AddressID'];
  /**
   * Customer Number.
   * Maximum length: 10.
   */
  declare customer: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Address Number (from BUT020).
   * Maximum length: 10.
   */
  declare addressId: DeserializedType<T, 'Edm.String'>;
  /**
   * Express train station.
   * Maximum length: 25.
   * @nullable
   */
  declare expressTrainStationName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Train station.
   * Maximum length: 25.
   * @nullable
   */
  declare trainStationName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City Code.
   * Maximum length: 4.
   * @nullable
   */
  declare cityCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * County Code.
   * Maximum length: 3.
   * @nullable
   */
  declare county?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: CustAddrDepdntInformationApi<T>) {
    super(_entityApi);
  }
}

export interface CustAddrDepdntInformationType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  expressTrainStationName?: DeserializedType<T, 'Edm.String'> | null;
  trainStationName?: DeserializedType<T, 'Edm.String'> | null;
  cityCode?: DeserializedType<T, 'Edm.String'> | null;
  county?: DeserializedType<T, 'Edm.String'> | null;
}
