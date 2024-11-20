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
import type { AddressPhoneNumberApi } from './AddressPhoneNumberApi';

/**
 * This class represents the entity "A_AddressPhoneNumber" of service "API_BUSINESS_PARTNER".
 */
export class AddressPhoneNumber<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements AddressPhoneNumberType<T>
{
  /**
   * Technical entity name for AddressPhoneNumber.
   */
  static override _entityName = 'A_AddressPhoneNumber';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the AddressPhoneNumber entity.
   */
  static _keys = ['AddressID', 'Person', 'OrdinalNumber'];
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
   * Standard Sender Address in this Communication Type.
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
   * Complete Number: Dialing Code+Number+Extension.
   * Maximum length: 30.
   * @nullable
   */
  declare internationalPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: Telephone is a Mobile Telephone.
   * Maximum length: 1.
   * @nullable
   */
  declare phoneNumberType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Communication link notes.
   * Maximum length: 50.
   * @nullable
   */
  declare addressCommunicationRemarkText?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  constructor(_entityApi: AddressPhoneNumberApi<T>) {
    super(_entityApi);
  }
}

export interface AddressPhoneNumberType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  addressId: DeserializedType<T, 'Edm.String'>;
  person: DeserializedType<T, 'Edm.String'>;
  ordinalNumber: DeserializedType<T, 'Edm.String'>;
  destinationLocationCountry?: DeserializedType<T, 'Edm.String'> | null;
  isDefaultPhoneNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  phoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  internationalPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumberType?: DeserializedType<T, 'Edm.String'> | null;
  addressCommunicationRemarkText?: DeserializedType<T, 'Edm.String'> | null;
}
