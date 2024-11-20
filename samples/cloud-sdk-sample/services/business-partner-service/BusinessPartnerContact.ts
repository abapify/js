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
import type { BusinessPartnerContactApi } from './BusinessPartnerContactApi';
import {
  BpContactToAddress,
  BpContactToAddressType,
} from './BpContactToAddress';
import {
  BpContactToFuncAndDept,
  BpContactToFuncAndDeptType,
} from './BpContactToFuncAndDept';

/**
 * This class represents the entity "A_BusinessPartnerContact" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerContact<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusinessPartnerContactType<T>
{
  /**
   * Technical entity name for BusinessPartnerContact.
   */
  static override _entityName = 'A_BusinessPartnerContact';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerContact entity.
   */
  static _keys = [
    'RelationshipNumber',
    'BusinessPartnerCompany',
    'BusinessPartnerPerson',
    'ValidityEndDate',
  ];
  /**
   * BP Relationship Number.
   * Maximum length: 12.
   */
  declare relationshipNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartnerCompany: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartnerPerson: DeserializedType<T, 'Edm.String'>;
  /**
   * Validity Date (Valid To).
   */
  declare validityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  /**
   * Validity Date (Valid From).
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Standard Relationship.
   * @nullable
   */
  declare isStandardRelationship?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Business Partner Relationship Category.
   * Maximum length: 6.
   * @nullable
   */
  declare relationshipCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link BpContactToAddress} entity.
   */
  declare toContactAddress: BpContactToAddress<T>[];
  /**
   * One-to-one navigation property to the {@link BpContactToFuncAndDept} entity.
   */
  declare toContactRelationship?: BpContactToFuncAndDept<T> | null;

  constructor(_entityApi: BusinessPartnerContactApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerContactType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  relationshipNumber: DeserializedType<T, 'Edm.String'>;
  businessPartnerCompany: DeserializedType<T, 'Edm.String'>;
  businessPartnerPerson: DeserializedType<T, 'Edm.String'>;
  validityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  validityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  isStandardRelationship?: DeserializedType<T, 'Edm.Boolean'> | null;
  relationshipCategory?: DeserializedType<T, 'Edm.String'> | null;
  toContactAddress: BpContactToAddressType<T>[];
  toContactRelationship?: BpContactToFuncAndDeptType<T> | null;
}
