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
import type { CustomerSalesAreaTextApi } from './CustomerSalesAreaTextApi';

/**
 * This class represents the entity "A_CustomerSalesAreaText" of service "API_BUSINESS_PARTNER".
 */
export class CustomerSalesAreaText<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements CustomerSalesAreaTextType<T>
{
  /**
   * Technical entity name for CustomerSalesAreaText.
   */
  static override _entityName = 'A_CustomerSalesAreaText';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustomerSalesAreaText entity.
   */
  static _keys = [
    'Customer',
    'SalesOrganization',
    'DistributionChannel',
    'Division',
    'Language',
    'LongTextID',
  ];
  /**
   * Customer Number.
   * Maximum length: 10.
   */
  declare customer: DeserializedType<T, 'Edm.String'>;
  /**
   * Sales Organization.
   * Maximum length: 4.
   */
  declare salesOrganization: DeserializedType<T, 'Edm.String'>;
  /**
   * Distribution Channel.
   * Maximum length: 2.
   */
  declare distributionChannel: DeserializedType<T, 'Edm.String'>;
  /**
   * Division.
   * Maximum length: 2.
   */
  declare division: DeserializedType<T, 'Edm.String'>;
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

  constructor(_entityApi: CustomerSalesAreaTextApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerSalesAreaTextType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  salesOrganization: DeserializedType<T, 'Edm.String'>;
  distributionChannel: DeserializedType<T, 'Edm.String'>;
  division: DeserializedType<T, 'Edm.String'>;
  language: DeserializedType<T, 'Edm.String'>;
  longTextId: DeserializedType<T, 'Edm.String'>;
  longText?: DeserializedType<T, 'Edm.String'> | null;
}
