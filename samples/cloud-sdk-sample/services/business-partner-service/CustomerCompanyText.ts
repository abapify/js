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
import type { CustomerCompanyTextApi } from './CustomerCompanyTextApi';

/**
 * This class represents the entity "A_CustomerCompanyText" of service "API_BUSINESS_PARTNER".
 */
export class CustomerCompanyText<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements CustomerCompanyTextType<T>
{
  /**
   * Technical entity name for CustomerCompanyText.
   */
  static override _entityName = 'A_CustomerCompanyText';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustomerCompanyText entity.
   */
  static _keys = ['Customer', 'CompanyCode', 'Language', 'LongTextID'];
  /**
   * Customer Number.
   * Maximum length: 10.
   */
  declare customer: DeserializedType<T, 'Edm.String'>;
  /**
   * Company Code.
   * Maximum length: 4.
   */
  declare companyCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Language key.
   * Maximum length: 2.
   */
  declare language: DeserializedType<T, 'Edm.String'>;
  /**
   * Text ID.
   * Maximum length: 4.
   */
  declare longTextId: DeserializedType<T, 'Edm.String'>;
  /**
   * String.
   * @nullable
   */
  declare longText?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: CustomerCompanyTextApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerCompanyTextType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  companyCode: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  longTextId: DeserializedType<T, 'Edm.String'>;
  longText?: DeserializedType<T, 'Edm.String'> | null;
}
