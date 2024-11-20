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
import type { BpEmploymentApi } from './BpEmploymentApi';

/**
 * This class represents the entity "A_BPEmployment" of service "API_BUSINESS_PARTNER".
 */
export class BpEmployment<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BpEmploymentType<T>
{
  /**
   * Technical entity name for BpEmployment.
   */
  static override _entityName = 'A_BPEmployment';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpEmployment entity.
   */
  static _keys = ['BusinessPartner', 'BPEmploymentStartDate'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Employed from.
   */
  declare bpEmploymentStartDate: DeserializedType<T, 'Edm.DateTime'>;
  /**
   * Employed Until.
   * @nullable
   */
  declare bpEmploymentEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Employment Status.
   * Maximum length: 2.
   * @nullable
   */
  declare bpEmploymentStatus?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry.
   * Maximum length: 10.
   * @nullable
   */
  declare busPartEmplrIndstryCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Employer of a Natural Person.
   * Maximum length: 35.
   * @nullable
   */
  declare businessPartnerEmployerName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Occupation/group.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerOccupationGroup?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  constructor(_entityApi: BpEmploymentApi<T>) {
    super(_entityApi);
  }
}

export interface BpEmploymentType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bpEmploymentStartDate: DeserializedType<T, 'Edm.DateTime'>;
  bpEmploymentEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bpEmploymentStatus?: DeserializedType<T, 'Edm.String'> | null;
  busPartEmplrIndstryCode?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerEmployerName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerOccupationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
