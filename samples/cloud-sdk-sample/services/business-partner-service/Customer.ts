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
import type { CustomerApi } from './CustomerApi';
import {
  CustAddrDepdntExtIdentifier,
  CustAddrDepdntExtIdentifierType,
} from './CustAddrDepdntExtIdentifier';
import {
  CustAddrDepdntInformation,
  CustAddrDepdntInformationType,
} from './CustAddrDepdntInformation';
import { CustomerCompany, CustomerCompanyType } from './CustomerCompany';
import { CustomerSalesArea, CustomerSalesAreaType } from './CustomerSalesArea';
import {
  CustomerTaxGrouping,
  CustomerTaxGroupingType,
} from './CustomerTaxGrouping';
import { CustomerText, CustomerTextType } from './CustomerText';
import {
  CustomerUnloadingPoint,
  CustomerUnloadingPointType,
} from './CustomerUnloadingPoint';
import {
  CustUnldgPtAddrDepdntInfo,
  CustUnldgPtAddrDepdntInfoType,
} from './CustUnldgPtAddrDepdntInfo';

/**
 * This class represents the entity "A_Customer" of service "API_BUSINESS_PARTNER".
 */
export class Customer<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements CustomerType<T>
{
  /**
   * Technical entity name for Customer.
   */
  static override _entityName = 'A_Customer';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the Customer entity.
   */
  static _keys = ['Customer'];
  /**
   * Customer Number.
   * Maximum length: 10.
   */
  declare customer: DeserializedType<T, 'Edm.String'>;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central billing block for customer.
   * Maximum length: 2.
   * @nullable
   */
  declare billingIsBlockedForCustomer?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Name of Person who Created the Object.
   * Maximum length: 12.
   * @nullable
   */
  declare createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Record Created On.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Customer Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare customerAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer Classification.
   * Maximum length: 2.
   * @nullable
   */
  declare customerClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer Full Name.
   * Maximum length: 220.
   * @nullable
   */
  declare customerFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer Full Name.
   * Maximum length: 220.
   * @nullable
   */
  declare bpCustomerFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Customer.
   * Maximum length: 80.
   * @nullable
   */
  declare customerName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer Name.
   * Maximum length: 81.
   * @nullable
   */
  declare bpCustomerName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central delivery block for the customer.
   * Maximum length: 2.
   * @nullable
   */
  declare deliveryIsBlocked?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 1.
   * Maximum length: 2.
   * @nullable
   */
  declare freeDefinedAttribute01?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 2.
   * Maximum length: 2.
   * @nullable
   */
  declare freeDefinedAttribute02?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 3.
   * Maximum length: 2.
   * @nullable
   */
  declare freeDefinedAttribute03?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 4.
   * Maximum length: 2.
   * @nullable
   */
  declare freeDefinedAttribute04?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 5.
   * Maximum length: 2.
   * @nullable
   */
  declare freeDefinedAttribute05?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 6.
   * Maximum length: 3.
   * @nullable
   */
  declare freeDefinedAttribute06?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 7.
   * Maximum length: 3.
   * @nullable
   */
  declare freeDefinedAttribute07?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 8.
   * Maximum length: 3.
   * @nullable
   */
  declare freeDefinedAttribute08?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 9.
   * Maximum length: 3.
   * @nullable
   */
  declare freeDefinedAttribute09?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Attribute 10.
   * Maximum length: 3.
   * @nullable
   */
  declare freeDefinedAttribute10?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Natural Person.
   * Maximum length: 1.
   * @nullable
   */
  declare nfPartnerIsNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central Order Block for Customer.
   * Maximum length: 2.
   * @nullable
   */
  declare orderIsBlockedForCustomer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central Posting Block.
   * @nullable
   */
  declare postingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare supplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Group Key.
   * Maximum length: 10.
   * @nullable
   */
  declare customerCorporateGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account number of the master record with the fiscal address.
   * Maximum length: 10.
   * @nullable
   */
  declare fiscalAddress?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Key.
   * Maximum length: 4.
   * @nullable
   */
  declare industry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Code 1.
   * Maximum length: 10.
   * @nullable
   */
  declare industryCode1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Code 2.
   * Maximum length: 10.
   * @nullable
   */
  declare industryCode2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Code 3.
   * Maximum length: 10.
   * @nullable
   */
  declare industryCode3?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Code 4.
   * Maximum length: 10.
   * @nullable
   */
  declare industryCode4?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Code 5.
   * Maximum length: 10.
   * @nullable
   */
  declare industryCode5?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * International location number  (part 1).
   * Maximum length: 7.
   * @nullable
   */
  declare internationalLocationNumber1?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * International location number (Part 2).
   * Maximum length: 5.
   * @nullable
   */
  declare internationalLocationNumber2?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Check digit for the international location number.
   * Maximum length: 1.
   * @nullable
   */
  declare internationalLocationNumber3?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Nielsen ID.
   * Maximum length: 2.
   * @nullable
   */
  declare nielsenRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment Reason.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Type.
   * Maximum length: 2.
   * @nullable
   */
  declare responsibleType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 1.
   * Maximum length: 16.
   * @nullable
   */
  declare taxNumber1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 2.
   * Maximum length: 11.
   * @nullable
   */
  declare taxNumber2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 3.
   * Maximum length: 18.
   * @nullable
   */
  declare taxNumber3?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 4.
   * Maximum length: 18.
   * @nullable
   */
  declare taxNumber4?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 5.
   * Maximum length: 60.
   * @nullable
   */
  declare taxNumber5?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number Type.
   * Maximum length: 2.
   * @nullable
   */
  declare taxNumberType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * VAT Registration Number.
   * Maximum length: 20.
   * @nullable
   */
  declare vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central Deletion Flag for Master Record.
   * @nullable
   */
  declare deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Express train station.
   * Maximum length: 25.
   * @nullable
   */
  declare expressTrainStationName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Train station.
   * Maximum length: 25.
   * @nullable
   */
  declare trainStationName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City Code.
   * Maximum length: 4.
   * @nullable
   */
  declare cityCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * County Code.
   * Maximum length: 3.
   * @nullable
   */
  declare county?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link CustAddrDepdntExtIdentifier} entity.
   */
  declare toCustAddrDepdntExtIdentifier: CustAddrDepdntExtIdentifier<T>[];
  /**
   * One-to-many navigation property to the {@link CustAddrDepdntInformation} entity.
   */
  declare toCustAddrDepdntInformation: CustAddrDepdntInformation<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerCompany} entity.
   */
  declare toCustomerCompany: CustomerCompany<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerSalesArea} entity.
   */
  declare toCustomerSalesArea: CustomerSalesArea<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerTaxGrouping} entity.
   */
  declare toCustomerTaxGrouping: CustomerTaxGrouping<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerText} entity.
   */
  declare toCustomerText: CustomerText<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerUnloadingPoint} entity.
   */
  declare toCustomerUnloadingPoint: CustomerUnloadingPoint<T>[];
  /**
   * One-to-many navigation property to the {@link CustUnldgPtAddrDepdntInfo} entity.
   */
  declare toCustUnldgPtAddrDepdntInfo: CustUnldgPtAddrDepdntInfo<T>[];

  constructor(_entityApi: CustomerApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerType<T extends DeSerializers = DefaultDeSerializers> {
  customer: DeserializedType<T, 'Edm.String'>;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  billingIsBlockedForCustomer?: DeserializedType<T, 'Edm.String'> | null;
  createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  customerAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  customerClassification?: DeserializedType<T, 'Edm.String'> | null;
  customerFullName?: DeserializedType<T, 'Edm.String'> | null;
  bpCustomerFullName?: DeserializedType<T, 'Edm.String'> | null;
  customerName?: DeserializedType<T, 'Edm.String'> | null;
  bpCustomerName?: DeserializedType<T, 'Edm.String'> | null;
  deliveryIsBlocked?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute01?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute02?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute03?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute04?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute05?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute06?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute07?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute08?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute09?: DeserializedType<T, 'Edm.String'> | null;
  freeDefinedAttribute10?: DeserializedType<T, 'Edm.String'> | null;
  nfPartnerIsNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  orderIsBlockedForCustomer?: DeserializedType<T, 'Edm.String'> | null;
  postingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  supplier?: DeserializedType<T, 'Edm.String'> | null;
  customerCorporateGroup?: DeserializedType<T, 'Edm.String'> | null;
  fiscalAddress?: DeserializedType<T, 'Edm.String'> | null;
  industry?: DeserializedType<T, 'Edm.String'> | null;
  industryCode1?: DeserializedType<T, 'Edm.String'> | null;
  industryCode2?: DeserializedType<T, 'Edm.String'> | null;
  industryCode3?: DeserializedType<T, 'Edm.String'> | null;
  industryCode4?: DeserializedType<T, 'Edm.String'> | null;
  industryCode5?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber1?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber2?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber3?: DeserializedType<T, 'Edm.String'> | null;
  nielsenRegion?: DeserializedType<T, 'Edm.String'> | null;
  paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  responsibleType?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber1?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber2?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber3?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber4?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber5?: DeserializedType<T, 'Edm.String'> | null;
  taxNumberType?: DeserializedType<T, 'Edm.String'> | null;
  vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  expressTrainStationName?: DeserializedType<T, 'Edm.String'> | null;
  trainStationName?: DeserializedType<T, 'Edm.String'> | null;
  cityCode?: DeserializedType<T, 'Edm.String'> | null;
  county?: DeserializedType<T, 'Edm.String'> | null;
  toCustAddrDepdntExtIdentifier: CustAddrDepdntExtIdentifierType<T>[];
  toCustAddrDepdntInformation: CustAddrDepdntInformationType<T>[];
  toCustomerCompany: CustomerCompanyType<T>[];
  toCustomerSalesArea: CustomerSalesAreaType<T>[];
  toCustomerTaxGrouping: CustomerTaxGroupingType<T>[];
  toCustomerText: CustomerTextType<T>[];
  toCustomerUnloadingPoint: CustomerUnloadingPointType<T>[];
  toCustUnldgPtAddrDepdntInfo: CustUnldgPtAddrDepdntInfoType<T>[];
}
