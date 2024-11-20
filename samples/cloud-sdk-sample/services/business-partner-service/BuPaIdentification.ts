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
import type { BuPaIdentificationApi } from './BuPaIdentificationApi';

/**
 * This class represents the entity "A_BuPaIdentification" of service "API_BUSINESS_PARTNER".
 */
export class BuPaIdentification<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BuPaIdentificationType<T>
{
  /**
   * Technical entity name for BuPaIdentification.
   */
  static override _entityName = 'A_BuPaIdentification';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BuPaIdentification entity.
   */
  static _keys = [
    'BusinessPartner',
    'BPIdentificationType',
    'BPIdentificationNumber',
  ];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Identification Type.
   * Maximum length: 6.
   */
  declare bpIdentificationType: DeserializedType<T, 'Edm.String'>;
  /**
   * Identification Number.
   * Maximum length: 60.
   */
  declare bpIdentificationNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Responsible Institution for ID Number.
   * Maximum length: 40.
   * @nullable
   */
  declare bpIdnNmbrIssuingInstitute?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Entry for ID Number.
   * @nullable
   */
  declare bpIdentificationEntryDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Country/Region in Which ID Number is Valid or Was Assigned.
   * Maximum length: 3.
   * @nullable
   */
  declare country?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Region (State, Province, County).
   * Maximum length: 3.
   * @nullable
   */
  declare region?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Validity Start for ID Number.
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Validity End for ID Number.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BuPaIdentificationApi<T>) {
    super(_entityApi);
  }
}

export interface BuPaIdentificationType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bpIdentificationType: DeserializedType<T, 'Edm.String'>;
  bpIdentificationNumber: DeserializedType<T, 'Edm.String'>;
  bpIdnNmbrIssuingInstitute?: DeserializedType<T, 'Edm.String'> | null;
  bpIdentificationEntryDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  country?: DeserializedType<T, 'Edm.String'> | null;
  region?: DeserializedType<T, 'Edm.String'> | null;
  validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
