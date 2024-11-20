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
import type { AddressFaxNumberApi } from './AddressFaxNumberApi';

/**
 * This class represents the entity "A_AddressFaxNumber" of service "API_BUSINESS_PARTNER".
 */
export class AddressFaxNumber<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements AddressFaxNumberType<T>
{
  /**
   * Technical entity name for AddressFaxNumber.
   */
  static override _entityName = 'A_AddressFaxNumber';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the AddressFaxNumber entity.
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
   * Standard Sender Address in this Communication Type.
   * @nullable
   */
  declare isDefaultFaxNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
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
  declare faxNumber?: DeserializedType<T, 'Edm.String'> | null;
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
   * Communication link notes.
   * Maximum length: 50.
   * @nullable
   */
  declare addressCommunicationRemarkText?: DeserializedType<
    T,
    'Edm.String'
  > | null;

  constructor(_entityApi: AddressFaxNumberApi<T>) {
    super(_entityApi);
  }
}

export interface AddressFaxNumberType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  addressId: DeserializedType<T, 'Edm.String'>;
  person: DeserializedType<T, 'Edm.String'>;
  ordinalNumber: DeserializedType<T, 'Edm.String'>;
  isDefaultFaxNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  faxCountry?: DeserializedType<T, 'Edm.String'> | null;
  faxNumber?: DeserializedType<T, 'Edm.String'> | null;
  faxNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  internationalFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  addressCommunicationRemarkText?: DeserializedType<T, 'Edm.String'> | null;
}
