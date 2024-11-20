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
import type { BusinessPartnerRoleApi } from './BusinessPartnerRoleApi';

/**
 * This class represents the entity "A_BusinessPartnerRole" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerRole<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BusinessPartnerRoleType<T>
{
  /**
   * Technical entity name for BusinessPartnerRole.
   */
  static override _entityName = 'A_BusinessPartnerRole';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerRole entity.
   */
  static _keys = ['BusinessPartner', 'BusinessPartnerRole'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * BP Role.
   * Maximum length: 6.
   */
  declare businessPartnerRole: DeserializedType<T, 'Edm.String'>;
  /**
   * Validity Start of a BP Role.
   * @nullable
   */
  declare validFrom?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * Validity End of a BP Role.
   * @nullable
   */
  declare validTo?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerRoleApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerRoleType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  businessPartnerRole: DeserializedType<T, 'Edm.String'>;
  validFrom?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  validTo?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
