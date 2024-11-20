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
import type { CustomerCompanyApi } from './CustomerCompanyApi';
import {
  CustomerCompanyText,
  CustomerCompanyTextType,
} from './CustomerCompanyText';
import { CustomerDunning, CustomerDunningType } from './CustomerDunning';
import {
  CustomerWithHoldingTax,
  CustomerWithHoldingTaxType,
} from './CustomerWithHoldingTax';

/**
 * This class represents the entity "A_CustomerCompany" of service "API_BUSINESS_PARTNER".
 */
export class CustomerCompany<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements CustomerCompanyType<T>
{
  /**
   * Technical entity name for CustomerCompany.
   */
  static override _entityName = 'A_CustomerCompany';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustomerCompany entity.
   */
  static _keys = ['Customer', 'CompanyCode'];
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
   * Tolerance Group for Business Partner/G/L Account.
   * Maximum length: 4.
   * @nullable
   */
  declare aparToleranceGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Our Account Number at Customer.
   * Maximum length: 12.
   * @nullable
   */
  declare accountByCustomer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Accounting Clerk Abbreviation.
   * Maximum length: 2.
   * @nullable
   */
  declare accountingClerk?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Accounting clerk's fax number at the customer/vendor.
   * Maximum length: 31.
   * @nullable
   */
  declare accountingClerkFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Internet address of partner company clerk.
   * Maximum length: 130.
   * @nullable
   */
  declare accountingClerkInternetAddress?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Accounting clerk's telephone number at business partner.
   * Maximum length: 30.
   * @nullable
   */
  declare accountingClerkPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account number of an alternative payer.
   * Maximum length: 10.
   * @nullable
   */
  declare alternativePayerAccount?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Collective Invoice Variant.
   * Maximum length: 1.
   * @nullable
   */
  declare collectiveInvoiceVariant?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Memo.
   * Maximum length: 30.
   * @nullable
   */
  declare customerAccountNote?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Head Office Account Number (in branch accounts).
   * Maximum length: 10.
   * @nullable
   */
  declare customerHeadOffice?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: Clearing between customer and vendor ?.
   * @nullable
   */
  declare customerSupplierClearingIsUsed?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Short Key for a House Bank.
   * Maximum length: 5.
   * @nullable
   */
  declare houseBank?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Interest Indicator.
   * Maximum length: 2.
   * @nullable
   */
  declare interestCalculationCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Key Date of Last Interest Calculation.
   * @nullable
   */
  declare interestCalculationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Interest Calculation Frequency in Months.
   * Maximum length: 2.
   * @nullable
   */
  declare intrstCalcFrequencyInMonths?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Indicator: Local Processing?.
   * @nullable
   */
  declare isToBeLocallyProcessed?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Indicator: Pay All Items Separately?.
   * @nullable
   */
  declare itemIsToBePaidSeparately?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Key for sorting according to assignment numbers.
   * Maximum length: 3.
   * @nullable
   */
  declare layoutSortingRule?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Block Key for Payment.
   * Maximum length: 1.
   * @nullable
   */
  declare paymentBlockingReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * List of Respected Payment Methods.
   * Maximum length: 10.
   * @nullable
   */
  declare paymentMethodsList?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment Reason.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Key for Terms of Payment.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: Send Payment Advices by EDI.
   * @nullable
   */
  declare paytAdviceIsSentbyEdi?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Posting block for company code.
   * @nullable
   */
  declare physicalInventoryBlockInd?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Reconciliation Account in General Ledger.
   * Maximum length: 10.
   * @nullable
   */
  declare reconciliationAccount?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: Record Payment History ?.
   * @nullable
   */
  declare recordPaymentHistoryIndicator?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * User at customer.
   * Maximum length: 15.
   * @nullable
   */
  declare userAtCustomer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Deletion Flag for Master Record (Company Code Level).
   * @nullable
   */
  declare deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Planning Group.
   * Maximum length: 10.
   * @nullable
   */
  declare cashPlanningGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Short Key for Known/Negotiated Leave.
   * Maximum length: 4.
   * @nullable
   */
  declare knownOrNegotiatedLeave?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Value Adjustment Key.
   * Maximum length: 2.
   * @nullable
   */
  declare valueAdjustmentKey?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Customer Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare customerAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link CustomerCompanyText} entity.
   */
  declare toCompanyText: CustomerCompanyText<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerDunning} entity.
   */
  declare toCustomerDunning: CustomerDunning<T>[];
  /**
   * One-to-many navigation property to the {@link CustomerWithHoldingTax} entity.
   */
  declare toWithHoldingTax: CustomerWithHoldingTax<T>[];

  constructor(_entityApi: CustomerCompanyApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerCompanyType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  companyCode: DeserializedType<T, 'Edm.String'>;
  aparToleranceGroup?: DeserializedType<T, 'Edm.String'> | null;
  accountByCustomer?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerk?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerkFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerkInternetAddress?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerkPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  alternativePayerAccount?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  collectiveInvoiceVariant?: DeserializedType<T, 'Edm.String'> | null;
  customerAccountNote?: DeserializedType<T, 'Edm.String'> | null;
  customerHeadOffice?: DeserializedType<T, 'Edm.String'> | null;
  customerSupplierClearingIsUsed?: DeserializedType<T, 'Edm.Boolean'> | null;
  houseBank?: DeserializedType<T, 'Edm.String'> | null;
  interestCalculationCode?: DeserializedType<T, 'Edm.String'> | null;
  interestCalculationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  intrstCalcFrequencyInMonths?: DeserializedType<T, 'Edm.String'> | null;
  isToBeLocallyProcessed?: DeserializedType<T, 'Edm.Boolean'> | null;
  itemIsToBePaidSeparately?: DeserializedType<T, 'Edm.Boolean'> | null;
  layoutSortingRule?: DeserializedType<T, 'Edm.String'> | null;
  paymentBlockingReason?: DeserializedType<T, 'Edm.String'> | null;
  paymentMethodsList?: DeserializedType<T, 'Edm.String'> | null;
  paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  paytAdviceIsSentbyEdi?: DeserializedType<T, 'Edm.Boolean'> | null;
  physicalInventoryBlockInd?: DeserializedType<T, 'Edm.Boolean'> | null;
  reconciliationAccount?: DeserializedType<T, 'Edm.String'> | null;
  recordPaymentHistoryIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  userAtCustomer?: DeserializedType<T, 'Edm.String'> | null;
  deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  cashPlanningGroup?: DeserializedType<T, 'Edm.String'> | null;
  knownOrNegotiatedLeave?: DeserializedType<T, 'Edm.String'> | null;
  valueAdjustmentKey?: DeserializedType<T, 'Edm.String'> | null;
  customerAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  toCompanyText: CustomerCompanyTextType<T>[];
  toCustomerDunning: CustomerDunningType<T>[];
  toWithHoldingTax: CustomerWithHoldingTaxType<T>[];
}
