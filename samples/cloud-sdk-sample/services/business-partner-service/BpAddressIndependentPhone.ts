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
import type { BpAddressIndependentPhoneApi } from './BpAddressIndependentPhoneApi';

/**
 * This class represents the entity "A_BPAddressIndependentPhone" of service "API_BUSINESS_PARTNER".
 */
export class BpAddressIndependentPhone<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpAddressIndependentPhoneType<T>
{
  /**
   * Technical entity name for BpAddressIndependentPhone.
   */
  static override _entityName = 'A_BPAddressIndependentPhone';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpAddressIndependentPhone entity.
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
  declare destinationLocationCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Complete Number: Dialing Code+Number+Extension.
   * Maximum length: 30.
   * @nullable
   */
  declare internationalPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Data element for domain BOOLE: TRUE (='X') and FALSE (=' ').
   * @nullable
   */
  declare isDefaultPhoneNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Telephone No.: Dialing Code and Number.
   * Maximum length: 30.
   * @nullable
   */
  declare phoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Telephone no.: Extension.
   * Maximum length: 10.
   * @nullable
   */
  declare phoneNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Phone Number Type.
   * Maximum length: 1.
   * @nullable
   */
  declare phoneNumberType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Validity Start Date.
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Validity End Date.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;

  constructor(_entityApi: BpAddressIndependentPhoneApi<T>) {
    super(_entityApi);
  }
}

export interface BpAddressIndependentPhoneType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  person: DeserializedType<T, 'Edm.String'>;
  ordinalNumber: DeserializedType<T, 'Edm.String'>;
  destinationLocationCountry?: DeserializedType<T, 'Edm.String'> | null;
  internationalPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  isDefaultPhoneNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  phoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumberType?: DeserializedType<T, 'Edm.String'> | null;
  validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
}
