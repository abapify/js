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
import type { BpAddressIndependentWebsiteApi } from './BpAddressIndependentWebsiteApi';

/**
 * This class represents the entity "A_BPAddressIndependentWebsite" of service "API_BUSINESS_PARTNER".
 */
export class BpAddressIndependentWebsite<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpAddressIndependentWebsiteType<T>
{
  /**
   * Technical entity name for BpAddressIndependentWebsite.
   */
  static override _entityName = 'A_BPAddressIndependentWebsite';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpAddressIndependentWebsite entity.
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
   * Flag: this address is the default address.
   * @nullable
   */
  declare isDefaultUrlAddress?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Url Field Length.
   * @nullable
   */
  declare urlFieldLength?: DeserializedType<T, 'Edm.Int32'> | null;
  /**
   * Website Url.
   * Maximum length: 2048.
   * @nullable
   */
  declare websiteUrl?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BpAddressIndependentWebsiteApi<T>) {
    super(_entityApi);
  }
}

export interface BpAddressIndependentWebsiteType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  person: DeserializedType<T, 'Edm.String'>;
  ordinalNumber: DeserializedType<T, 'Edm.String'>;
  isDefaultUrlAddress?: DeserializedType<T, 'Edm.Boolean'> | null;
  urlFieldLength?: DeserializedType<T, 'Edm.Int32'> | null;
  websiteUrl?: DeserializedType<T, 'Edm.String'> | null;
}
