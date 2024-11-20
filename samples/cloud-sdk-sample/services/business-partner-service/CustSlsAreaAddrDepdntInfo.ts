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
import type { CustSlsAreaAddrDepdntInfoApi } from './CustSlsAreaAddrDepdntInfoApi';

/**
 * This class represents the entity "A_CustSlsAreaAddrDepdntInfo" of service "API_BUSINESS_PARTNER".
 */
export class CustSlsAreaAddrDepdntInfo<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements CustSlsAreaAddrDepdntInfoType<T>
{
  /**
   * Technical entity name for CustSlsAreaAddrDepdntInfo.
   */
  static override _entityName = 'A_CustSlsAreaAddrDepdntInfo';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustSlsAreaAddrDepdntInfo entity.
   */
  static _keys = [
    'Customer',
    'SalesOrganization',
    'DistributionChannel',
    'Division',
    'AddressID',
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
   * Business Partner Address Number (from BUT020).
   * Maximum length: 10.
   */
  declare addressId: DeserializedType<T, 'Edm.String'>;
  /**
   * Incoterms (Part 1).
   * Maximum length: 3.
   * @nullable
   */
  declare incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 1.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 2.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnLoc1AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnLoc2AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnDvtgLocAddlUuid?: DeserializedType<
    T,
    'Edm.Guid'
  > | null;
  /**
   * Customer delivery block (sales area).
   * Maximum length: 2.
   * @nullable
   */
  declare deliveryIsBlocked?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Sales Office.
   * Maximum length: 4.
   * @nullable
   */
  declare salesOffice?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Sales Group.
   * Maximum length: 3.
   * @nullable
   */
  declare salesGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Shipping Conditions.
   * Maximum length: 2.
   * @nullable
   */
  declare shippingCondition?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Delivering Plant (Own or External).
   * Maximum length: 4.
   * @nullable
   */
  declare supplyingPlant?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Version.
   * Maximum length: 4.
   * @nullable
   */
  declare incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: CustSlsAreaAddrDepdntInfoApi<T>) {
    super(_entityApi);
  }
}

export interface CustSlsAreaAddrDepdntInfoType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  salesOrganization: DeserializedType<T, 'Edm.String'>;
  distributionChannel: DeserializedType<T, 'Edm.String'>;
  division: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  incotermsSupChnLoc1AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  incotermsSupChnLoc2AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  incotermsSupChnDvtgLocAddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  deliveryIsBlocked?: DeserializedType<T, 'Edm.String'> | null;
  salesOffice?: DeserializedType<T, 'Edm.String'> | null;
  salesGroup?: DeserializedType<T, 'Edm.String'> | null;
  shippingCondition?: DeserializedType<T, 'Edm.String'> | null;
  supplyingPlant?: DeserializedType<T, 'Edm.String'> | null;
  incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;
}
