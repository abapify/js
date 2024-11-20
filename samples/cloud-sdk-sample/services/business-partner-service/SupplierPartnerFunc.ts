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
import type { SupplierPartnerFuncApi } from './SupplierPartnerFuncApi';

/**
 * This class represents the entity "A_SupplierPartnerFunc" of service "API_BUSINESS_PARTNER".
 */
export class SupplierPartnerFunc<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SupplierPartnerFuncType<T>
{
  /**
   * Technical entity name for SupplierPartnerFunc.
   */
  static override _entityName = 'A_SupplierPartnerFunc';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the SupplierPartnerFunc entity.
   */
  static _keys = [
    'Supplier',
    'PurchasingOrganization',
    'SupplierSubrange',
    'Plant',
    'PartnerFunction',
    'PartnerCounter',
  ];
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchasing Organization.
   * Maximum length: 4.
   */
  declare purchasingOrganization: DeserializedType<T, 'Edm.String'>;
  /**
   * Supplier Subrange.
   * Maximum length: 6.
   */
  declare supplierSubrange: DeserializedType<T, 'Edm.String'>;
  /**
   * Plant.
   * Maximum length: 4.
   */
  declare plant: DeserializedType<T, 'Edm.String'>;
  /**
   * Partner Function.
   * Maximum length: 2.
   */
  declare partnerFunction: DeserializedType<T, 'Edm.String'>;
  /**
   * Partner counter.
   * Maximum length: 3.
   */
  declare partnerCounter: DeserializedType<T, 'Edm.String'>;
  /**
   * Default Partner.
   * @nullable
   */
  declare defaultPartner?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Record Creation Date.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Name of Person Responsible for Creating the Object.
   * Maximum length: 12.
   * @nullable
   */
  declare createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Reference to other supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare referenceSupplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: SupplierPartnerFuncApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierPartnerFuncType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  supplier: DeserializedType<T, 'Edm.String'>;
  purchasingOrganization: DeserializedType<T, 'Edm.String'>;
  supplierSubrange: DeserializedType<T, 'Edm.String'>;
  plant: DeserializedType<T, 'Edm.String'>;
  partnerFunction: DeserializedType<T, 'Edm.String'>;
  partnerCounter: DeserializedType<T, 'Edm.String'>;
  defaultPartner?: DeserializedType<T, 'Edm.Boolean'> | null;
  creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  referenceSupplier?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
