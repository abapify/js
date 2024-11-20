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
import type { BpAddressIndependentFaxApi } from './BpAddressIndependentFaxApi';

/**
 * This class represents the entity "A_BPAddressIndependentFax" of service "API_BUSINESS_PARTNER".
 */
export class BpAddressIndependentFax<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpAddressIndependentFaxType<T>
{
  /**
   * Technical entity name for BpAddressIndependentFax.
   */
  static override _entityName = 'A_BPAddressIndependentFax';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpAddressIndependentFax entity.
   */
  static _keys = ['BusinessPartner', 'AddressID', 'Person', 'OrdinalNumber'];
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
   * Person Number.
   * Maximum length: 10.
   */
  declare person: DeserializedType<T, 'Edm.String'>;
  /**
   * Sequence Number.
   * Maximum length: 3.
   */
  declare ordinalNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Country/Region for Telephone/Fax Number.
   * Maximum length: 3.
   * @nullable
   */
  declare faxCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Fax Number: Dialing Code and Number.
   * Maximum length: 30.
   * @nullable
   */
  declare faxAreaCodeSubscriberNumber?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Fax no.: Extension.
   * Maximum length: 10.
   * @nullable
   */
  declare faxNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Complete Number: Dialing Code+Number+Extension.
   * Maximum length: 30.
   * @nullable
   */
  declare internationalFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator : Current Default Fax Number.
   * @nullable
   */
  declare isDefaultFaxNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Validity End Date.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Validity Start Date.
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;

  constructor(_entityApi: BpAddressIndependentFaxApi<T>) {
    super(_entityApi);
  }
}

export interface BpAddressIndependentFaxType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  person: DeserializedType<T, 'Edm.String'>;
  ordinalNumber: DeserializedType<T, 'Edm.String'>;
  faxCountry?: DeserializedType<T, 'Edm.String'> | null;
  faxAreaCodeSubscriberNumber?: DeserializedType<T, 'Edm.String'> | null;
  faxNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  internationalFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  isDefaultFaxNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
}
