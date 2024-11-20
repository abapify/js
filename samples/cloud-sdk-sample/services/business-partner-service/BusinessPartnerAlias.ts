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
import type { BusinessPartnerAliasApi } from './BusinessPartnerAliasApi';

/**
 * This class represents the entity "A_BusinessPartnerAlias" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerAlias<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusinessPartnerAliasType<T>
{
  /**
   * Technical entity name for BusinessPartnerAlias.
   */
  static override _entityName = 'A_BusinessPartnerAlias';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerAlias entity.
   */
  static _keys = ['BusinessPartner', 'BPAliasPositionNumber'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Items with Business Partner Name/Alias.
   * Maximum length: 3.
   */
  declare bpAliasPositionNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Alias.
   * Maximum length: 80.
   * @nullable
   */
  declare businessPartnerAliasName?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerAliasApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerAliasType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bpAliasPositionNumber: DeserializedType<T, 'Edm.String'>;
  businessPartnerAliasName?: DeserializedType<T, 'Edm.String'> | null;
}
