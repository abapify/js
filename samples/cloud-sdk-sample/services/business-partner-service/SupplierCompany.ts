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
import type { SupplierCompanyApi } from './SupplierCompanyApi';
import {
  SupplierCompanyText,
  SupplierCompanyTextType,
} from './SupplierCompanyText';
import { Supplier, SupplierType } from './Supplier';
import { SupplierDunning, SupplierDunningType } from './SupplierDunning';
import {
  SupplierWithHoldingTax,
  SupplierWithHoldingTaxType,
} from './SupplierWithHoldingTax';

/**
 * This class represents the entity "A_SupplierCompany" of service "API_BUSINESS_PARTNER".
 */
export class SupplierCompany<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SupplierCompanyType<T>
{
  /**
   * Technical entity name for SupplierCompany.
   */
  static override _entityName = 'A_SupplierCompany';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the SupplierCompany entity.
   */
  static _keys = ['Supplier', 'CompanyCode'];
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
  /**
   * Company Code.
   * Maximum length: 4.
   */
  declare companyCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Company Code or Company.
   * Maximum length: 25.
   * @nullable
   */
  declare companyCodeName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Block Key for Payment.
   * Maximum length: 1.
   * @nullable
   */
  declare paymentBlockingReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Posting block for company code.
   * @nullable
   */
  declare supplierIsBlockedForPosting?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
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
   * Accounting clerk's telephone number at business partner.
   * Maximum length: 30.
   * @nullable
   */
  declare accountingClerkPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Clerk at vendor.
   * Maximum length: 15.
   * @nullable
   */
  declare supplierClerk?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Internet address of partner company clerk.
   * Maximum length: 130.
   * @nullable
   */
  declare supplierClerkUrl?: DeserializedType<T, 'Edm.String'> | null;
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
   * Indicator: Clearing Between Customer and Supplier?.
   * @nullable
   */
  declare clearCustomerSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
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
   * Indicator: Send Payment Advices by EDI.
   * @nullable
   */
  declare paymentIsToBeSentByEdi?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Short Key for a House Bank.
   * Maximum length: 5.
   * @nullable
   */
  declare houseBank?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Probable Time Until Check Is Paid.
   * @nullable
   */
  declare checkPaidDurationInDays?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Currency Key.
   * Maximum length: 5.
   * @nullable
   */
  declare currency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Bill of Exchange Limit (in Local Currency).
   * @nullable
   */
  declare billOfExchLmtAmtInCoCodeCrcy?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Our account number with the vendor.
   * Maximum length: 12.
   * @nullable
   */
  declare supplierClerkIdBySupplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Reconciliation Account in General Ledger.
   * Maximum length: 10.
   * @nullable
   */
  declare reconciliationAccount?: DeserializedType<T, 'Edm.String'> | null;
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
   * Head Office Account Number.
   * Maximum length: 10.
   * @nullable
   */
  declare supplierHeadOffice?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account number of the alternative payee.
   * Maximum length: 10.
   * @nullable
   */
  declare alternativePayee?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Key for sorting according to assignment numbers.
   * Maximum length: 3.
   * @nullable
   */
  declare layoutSortingRule?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tolerance Group for Business Partner/G/L Account.
   * Maximum length: 4.
   * @nullable
   */
  declare aparToleranceGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Certification Date.
   * @nullable
   */
  declare supplierCertificationDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Memo.
   * Maximum length: 30.
   * @nullable
   */
  declare supplierAccountNote?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Withholding Tax Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare withholdingTaxCountry?: DeserializedType<T, 'Edm.String'> | null;
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
   * Check Flag for Double Invoices or Credit Memos.
   * @nullable
   */
  declare isToBeCheckedForDuplicates?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Minority Indicator.
   * Maximum length: 3.
   * @nullable
   */
  declare minorityGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link SupplierCompanyText} entity.
   */
  declare toCompanyText: SupplierCompanyText<T>[];
  /**
   * One-to-one navigation property to the {@link Supplier} entity.
   */
  declare toSupplier?: Supplier<T> | null;
  /**
   * One-to-many navigation property to the {@link SupplierDunning} entity.
   */
  declare toSupplierDunning: SupplierDunning<T>[];
  /**
   * One-to-many navigation property to the {@link SupplierWithHoldingTax} entity.
   */
  declare toSupplierWithHoldingTax: SupplierWithHoldingTax<T>[];

  constructor(_entityApi: SupplierCompanyApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierCompanyType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  supplier: DeserializedType<T, 'Edm.String'>;
  companyCode: DeserializedType<T, 'Edm.String'>;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  companyCodeName?: DeserializedType<T, 'Edm.String'> | null;
  paymentBlockingReason?: DeserializedType<T, 'Edm.String'> | null;
  supplierIsBlockedForPosting?: DeserializedType<T, 'Edm.Boolean'> | null;
  accountingClerk?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerkFaxNumber?: DeserializedType<T, 'Edm.String'> | null;
  accountingClerkPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  supplierClerk?: DeserializedType<T, 'Edm.String'> | null;
  supplierClerkUrl?: DeserializedType<T, 'Edm.String'> | null;
  paymentMethodsList?: DeserializedType<T, 'Edm.String'> | null;
  paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  clearCustomerSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
  isToBeLocallyProcessed?: DeserializedType<T, 'Edm.Boolean'> | null;
  itemIsToBePaidSeparately?: DeserializedType<T, 'Edm.Boolean'> | null;
  paymentIsToBeSentByEdi?: DeserializedType<T, 'Edm.Boolean'> | null;
  houseBank?: DeserializedType<T, 'Edm.String'> | null;
  checkPaidDurationInDays?: DeserializedType<T, 'Edm.Decimal'> | null;
  currency?: DeserializedType<T, 'Edm.String'> | null;
  billOfExchLmtAmtInCoCodeCrcy?: DeserializedType<T, 'Edm.Decimal'> | null;
  supplierClerkIdBySupplier?: DeserializedType<T, 'Edm.String'> | null;
  reconciliationAccount?: DeserializedType<T, 'Edm.String'> | null;
  interestCalculationCode?: DeserializedType<T, 'Edm.String'> | null;
  interestCalculationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  intrstCalcFrequencyInMonths?: DeserializedType<T, 'Edm.String'> | null;
  supplierHeadOffice?: DeserializedType<T, 'Edm.String'> | null;
  alternativePayee?: DeserializedType<T, 'Edm.String'> | null;
  layoutSortingRule?: DeserializedType<T, 'Edm.String'> | null;
  aparToleranceGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierCertificationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  supplierAccountNote?: DeserializedType<T, 'Edm.String'> | null;
  withholdingTaxCountry?: DeserializedType<T, 'Edm.String'> | null;
  deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  cashPlanningGroup?: DeserializedType<T, 'Edm.String'> | null;
  isToBeCheckedForDuplicates?: DeserializedType<T, 'Edm.Boolean'> | null;
  minorityGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  toCompanyText: SupplierCompanyTextType<T>[];
  toSupplier?: SupplierType<T> | null;
  toSupplierDunning: SupplierDunningType<T>[];
  toSupplierWithHoldingTax: SupplierWithHoldingTaxType<T>[];
}
