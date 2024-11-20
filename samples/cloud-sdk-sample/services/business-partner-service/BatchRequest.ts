/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeleteRequestBuilder,
  DeSerializers,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  ODataBatchRequestBuilder,
  UpdateRequestBuilder,
  BatchChangeSet,
} from '@sap-cloud-sdk/odata-v2';
import { transformVariadicArgumentToArray } from '@sap-cloud-sdk/util';
import {
  AddressEmailAddress,
  AddressFaxNumber,
  AddressHomePageUrl,
  AddressPhoneNumber,
  BpAddrDepdntIntlLocNumber,
  BpAddressIndependentEmail,
  BpAddressIndependentFax,
  BpAddressIndependentMobile,
  BpAddressIndependentPhone,
  BpAddressIndependentWebsite,
  BpContactToAddress,
  BpContactToFuncAndDept,
  BpCreditWorthiness,
  BpDataController,
  BpEmployment,
  BpFinancialServicesExtn,
  BpFinancialServicesReporting,
  BpFiscalYearInformation,
  BpIntlAddressVersion,
  BpRelationship,
  BuPaAddressUsage,
  BuPaIdentification,
  BuPaIndustry,
  BusinessPartner,
  BusinessPartnerAddress,
  BusinessPartnerAlias,
  BusinessPartnerBank,
  BusinessPartnerContact,
  BusinessPartnerIsBank,
  BusinessPartnerPaymentCard,
  BusinessPartnerRating,
  BusinessPartnerRole,
  BusinessPartnerTaxNumber,
  BusPartAddrDepdntTaxNmbr,
  CustAddrDepdntExtIdentifier,
  CustAddrDepdntInformation,
  Customer,
  CustomerCompany,
  CustomerCompanyText,
  CustomerDunning,
  CustomerSalesArea,
  CustomerSalesAreaTax,
  CustomerSalesAreaText,
  CustomerTaxGrouping,
  CustomerText,
  CustomerUnloadingPoint,
  CustomerWithHoldingTax,
  CustSalesPartnerFunc,
  CustSlsAreaAddrDepdntInfo,
  CustSlsAreaAddrDepdntTaxInfo,
  CustUnldgPtAddrDepdntInfo,
  Supplier,
  SupplierCompany,
  SupplierCompanyText,
  SupplierDunning,
  SupplierPartnerFunc,
  SupplierPurchasingOrg,
  SupplierPurchasingOrgText,
  SupplierText,
  SupplierWithHoldingTax,
} from './index';

/**
 * Batch builder for operations supported on the Business Partner Service.
 * @param requests The requests of the batch.
 * @returns A request builder for batch.
 */
export function batch<DeSerializersT extends DeSerializers>(
  ...requests: Array<
    | ReadBusinessPartnerServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  requests: Array<
    | ReadBusinessPartnerServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >,
): ODataBatchRequestBuilder<DeSerializersT>;
export function batch<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | ReadBusinessPartnerServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
    | Array<
        | ReadBusinessPartnerServiceRequestBuilder<DeSerializersT>
        | BatchChangeSet<DeSerializersT>
      >,
  ...rest: Array<
    | ReadBusinessPartnerServiceRequestBuilder<DeSerializersT>
    | BatchChangeSet<DeSerializersT>
  >
): ODataBatchRequestBuilder<DeSerializersT> {
  return new ODataBatchRequestBuilder(
    defaultBusinessPartnerServicePath,
    transformVariadicArgumentToArray(first, rest),
  );
}

/**
 * Change set constructor consists of write operations supported on the Business Partner Service.
 * @param requests The requests of the change set.
 * @returns A change set for batch.
 */
export function changeset<DeSerializersT extends DeSerializers>(
  ...requests: Array<WriteBusinessPartnerServiceRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  requests: Array<WriteBusinessPartnerServiceRequestBuilder<DeSerializersT>>,
): BatchChangeSet<DeSerializersT>;
export function changeset<DeSerializersT extends DeSerializers>(
  first:
    | undefined
    | WriteBusinessPartnerServiceRequestBuilder<DeSerializersT>
    | Array<WriteBusinessPartnerServiceRequestBuilder<DeSerializersT>>,
  ...rest: Array<WriteBusinessPartnerServiceRequestBuilder<DeSerializersT>>
): BatchChangeSet<DeSerializersT> {
  return new BatchChangeSet(transformVariadicArgumentToArray(first, rest));
}

export const defaultBusinessPartnerServicePath =
  '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
export type ReadBusinessPartnerServiceRequestBuilder<
  DeSerializersT extends DeSerializers,
> =
  | GetAllRequestBuilder<AddressEmailAddress<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<AddressPhoneNumber<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      BpAddrDepdntIntlLocNumber<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpAddressIndependentEmail<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpAddressIndependentMobile<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpAddressIndependentPhone<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpAddressIndependentWebsite<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<BpContactToAddress<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BpContactToFuncAndDept<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BpDataController<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BpEmployment<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<BpIntlAddressVersion<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BpRelationship<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BuPaAddressUsage<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartner<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerAddress<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerContact<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<BusinessPartnerRating<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<BusinessPartnerRole<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      BusinessPartnerTaxNumber<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      CustAddrDepdntExtIdentifier<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<Customer<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerCompanyText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerDunning<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerSalesAreaText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerUnloadingPoint<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustomerWithHoldingTax<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<CustSalesPartnerFunc<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      CustSlsAreaAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<
      CustUnldgPtAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<Supplier<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierCompany<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierCompanyText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierDunning<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierPartnerFunc<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierPurchasingOrg<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<
      SupplierPurchasingOrgText<DeSerializersT>,
      DeSerializersT
    >
  | GetAllRequestBuilder<SupplierText<DeSerializersT>, DeSerializersT>
  | GetAllRequestBuilder<SupplierWithHoldingTax<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<AddressEmailAddress<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<AddressPhoneNumber<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BpAddrDepdntIntlLocNumber<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpAddressIndependentEmail<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpAddressIndependentMobile<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpAddressIndependentPhone<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpAddressIndependentWebsite<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<BpContactToAddress<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BpContactToFuncAndDept<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BpDataController<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BpEmployment<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<BpIntlAddressVersion<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BpRelationship<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BuPaAddressUsage<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BusinessPartner<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BusinessPartnerIsBank<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BusinessPartnerRating<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<BusinessPartnerRole<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      BusinessPartnerTaxNumber<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      CustAddrDepdntExtIdentifier<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<Customer<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerCompanyText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerDunning<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      CustomerSalesAreaText<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<CustomerText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      CustomerUnloadingPoint<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      CustomerWithHoldingTax<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<CustSalesPartnerFunc<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      CustSlsAreaAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      CustUnldgPtAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<Supplier<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SupplierCompany<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SupplierCompanyText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SupplierDunning<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<SupplierPartnerFunc<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      SupplierPurchasingOrg<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<
      SupplierPurchasingOrgText<DeSerializersT>,
      DeSerializersT
    >
  | GetByKeyRequestBuilder<SupplierText<DeSerializersT>, DeSerializersT>
  | GetByKeyRequestBuilder<
      SupplierWithHoldingTax<DeSerializersT>,
      DeSerializersT
    >;
export type WriteBusinessPartnerServiceRequestBuilder<
  DeSerializersT extends DeSerializers,
> =
  | CreateRequestBuilder<AddressEmailAddress<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<AddressEmailAddress<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<AddressEmailAddress<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<AddressPhoneNumber<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<AddressPhoneNumber<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<AddressPhoneNumber<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      BpAddrDepdntIntlLocNumber<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddrDepdntIntlLocNumber<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddrDepdntIntlLocNumber<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpAddressIndependentEmail<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddressIndependentEmail<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddressIndependentEmail<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpAddressIndependentMobile<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddressIndependentMobile<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddressIndependentMobile<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpAddressIndependentPhone<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddressIndependentPhone<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddressIndependentPhone<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpAddressIndependentWebsite<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpAddressIndependentWebsite<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpAddressIndependentWebsite<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<BpContactToAddress<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpContactToAddress<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpContactToAddress<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BpContactToFuncAndDept<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpContactToFuncAndDept<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpContactToFuncAndDept<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BpDataController<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpDataController<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpDataController<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BpEmployment<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpEmployment<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpEmployment<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<BpIntlAddressVersion<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpIntlAddressVersion<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpIntlAddressVersion<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BpRelationship<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BpRelationship<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BpRelationship<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BuPaAddressUsage<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BuPaAddressUsage<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BuPaAddressUsage<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartner<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartner<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartner<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerAddress<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerAddress<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerAddress<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerContact<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerContact<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerContact<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<BusinessPartnerRating<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerRating<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerRating<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<BusinessPartnerRole<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<BusinessPartnerRole<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<BusinessPartnerRole<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      BusinessPartnerTaxNumber<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BusinessPartnerTaxNumber<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BusinessPartnerTaxNumber<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      CustAddrDepdntExtIdentifier<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      CustAddrDepdntExtIdentifier<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      CustAddrDepdntExtIdentifier<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<Customer<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<Customer<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<Customer<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerCompanyText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerCompanyText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerCompanyText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerDunning<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerDunning<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerDunning<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerSalesAreaText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerSalesAreaText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerSalesAreaText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerUnloadingPoint<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerUnloadingPoint<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerUnloadingPoint<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustomerWithHoldingTax<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustomerWithHoldingTax<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustomerWithHoldingTax<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<CustSalesPartnerFunc<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<CustSalesPartnerFunc<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<CustSalesPartnerFunc<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      CustSlsAreaAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      CustSlsAreaAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      CustSlsAreaAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<
      CustUnldgPtAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      CustUnldgPtAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      CustUnldgPtAddrDepdntInfo<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<Supplier<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<Supplier<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<Supplier<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierCompany<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierCompany<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierCompany<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierCompanyText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierCompanyText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierCompanyText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierDunning<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierDunning<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierDunning<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierPartnerFunc<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierPartnerFunc<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierPartnerFunc<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierPurchasingOrg<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierPurchasingOrg<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierPurchasingOrg<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<
      SupplierPurchasingOrgText<DeSerializersT>,
      DeSerializersT
    >
  | UpdateRequestBuilder<
      SupplierPurchasingOrgText<DeSerializersT>,
      DeSerializersT
    >
  | DeleteRequestBuilder<
      SupplierPurchasingOrgText<DeSerializersT>,
      DeSerializersT
    >
  | CreateRequestBuilder<SupplierText<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierText<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<SupplierText<DeSerializersT>, DeSerializersT>
  | CreateRequestBuilder<SupplierWithHoldingTax<DeSerializersT>, DeSerializersT>
  | UpdateRequestBuilder<SupplierWithHoldingTax<DeSerializersT>, DeSerializersT>
  | DeleteRequestBuilder<
      SupplierWithHoldingTax<DeSerializersT>,
      DeSerializersT
    >;
