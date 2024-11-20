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
import type { SupplierTextApi } from './SupplierTextApi';

/**
 * This class represents the entity "A_SupplierText" of service "API_BUSINESS_PARTNER".
 */
export class SupplierText<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SupplierTextType<T>
{
  /**
   * Technical entity name for SupplierText.
   */
  static override _entityName = 'A_SupplierText';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the SupplierText entity.
   */
  static _keys = ['Supplier', 'Language', 'LongTextID'];
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
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

  constructor(_entityApi: SupplierTextApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierTextType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  supplier: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  longTextId: DeserializedType<T, 'Edm.String'>;
  longText?: DeserializedType<T, 'Edm.String'> | null;
}
