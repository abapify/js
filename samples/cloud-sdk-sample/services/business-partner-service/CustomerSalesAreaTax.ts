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
import type { CustomerSalesAreaTaxApi } from './CustomerSalesAreaTaxApi';
import {
  CustSlsAreaAddrDepdntTaxInfo,
  CustSlsAreaAddrDepdntTaxInfoType,
} from './CustSlsAreaAddrDepdntTaxInfo';

/**
 * This class represents the entity "A_CustomerSalesAreaTax" of service "API_BUSINESS_PARTNER".
 */
export class CustomerSalesAreaTax<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements CustomerSalesAreaTaxType<T>
{
  /**
   * Technical entity name for CustomerSalesAreaTax.
   */
  static override _entityName = 'A_CustomerSalesAreaTax';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustomerSalesAreaTax entity.
   */
  static _keys = [
    'Customer',
    'SalesOrganization',
    'DistributionChannel',
    'Division',
    'DepartureCountry',
    'CustomerTaxCategory',
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
   * Reference distrib.channel for cust.and material masters.
   * Maximum length: 2.
   */
  declare distributionChannel: DeserializedType<T, 'Edm.String'>;
  /**
   * Division.
   * Maximum length: 2.
   */
  declare division: DeserializedType<T, 'Edm.String'>;
  /**
   * Departure Country/Region (from which the goods are sent).
   * Maximum length: 3.
   */
  declare departureCountry: DeserializedType<T, 'Edm.String'>;
  /**
   * Tax Condition Type (Sales Tax, Value-Added Tax,...).
   * Maximum length: 4.
   */
  declare customerTaxCategory: DeserializedType<T, 'Edm.String'>;
  /**
   * Tax Classification for Customer.
   * Maximum length: 1.
   * @nullable
   */
  declare customerTaxClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link CustSlsAreaAddrDepdntTaxInfo} entity.
   */
  declare toSlsAreaAddrDepdntTax: CustSlsAreaAddrDepdntTaxInfo<T>[];

  constructor(_entityApi: CustomerSalesAreaTaxApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerSalesAreaTaxType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  salesOrganization: DeserializedType<T, 'Edm.String'>;
  distributionChannel: DeserializedType<T, 'Edm.String'>;
  division: DeserializedType<T, 'Edm.String'>;
  departureCountry: DeserializedType<T, 'Edm.String'>;
  customerTaxCategory: DeserializedType<T, 'Edm.String'>;
  customerTaxClassification?: DeserializedType<T, 'Edm.String'> | null;
  toSlsAreaAddrDepdntTax: CustSlsAreaAddrDepdntTaxInfoType<T>[];
}
