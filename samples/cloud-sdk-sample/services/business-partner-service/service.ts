/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { AddressEmailAddressApi } from './AddressEmailAddressApi';
import { AddressFaxNumberApi } from './AddressFaxNumberApi';
import { AddressHomePageUrlApi } from './AddressHomePageUrlApi';
import { AddressPhoneNumberApi } from './AddressPhoneNumberApi';
import { BpAddrDepdntIntlLocNumberApi } from './BpAddrDepdntIntlLocNumberApi';
import { BpAddressIndependentEmailApi } from './BpAddressIndependentEmailApi';
import { BpAddressIndependentFaxApi } from './BpAddressIndependentFaxApi';
import { BpAddressIndependentMobileApi } from './BpAddressIndependentMobileApi';
import { BpAddressIndependentPhoneApi } from './BpAddressIndependentPhoneApi';
import { BpAddressIndependentWebsiteApi } from './BpAddressIndependentWebsiteApi';
import { BpContactToAddressApi } from './BpContactToAddressApi';
import { BpContactToFuncAndDeptApi } from './BpContactToFuncAndDeptApi';
import { BpCreditWorthinessApi } from './BpCreditWorthinessApi';
import { BpDataControllerApi } from './BpDataControllerApi';
import { BpEmploymentApi } from './BpEmploymentApi';
import { BpFinancialServicesExtnApi } from './BpFinancialServicesExtnApi';
import { BpFinancialServicesReportingApi } from './BpFinancialServicesReportingApi';
import { BpFiscalYearInformationApi } from './BpFiscalYearInformationApi';
import { BpIntlAddressVersionApi } from './BpIntlAddressVersionApi';
import { BpRelationshipApi } from './BpRelationshipApi';
import { BuPaAddressUsageApi } from './BuPaAddressUsageApi';
import { BuPaIdentificationApi } from './BuPaIdentificationApi';
import { BuPaIndustryApi } from './BuPaIndustryApi';
import { BusinessPartnerApi } from './BusinessPartnerApi';
import { BusinessPartnerAddressApi } from './BusinessPartnerAddressApi';
import { BusinessPartnerAliasApi } from './BusinessPartnerAliasApi';
import { BusinessPartnerBankApi } from './BusinessPartnerBankApi';
import { BusinessPartnerContactApi } from './BusinessPartnerContactApi';
import { BusinessPartnerIsBankApi } from './BusinessPartnerIsBankApi';
import { BusinessPartnerPaymentCardApi } from './BusinessPartnerPaymentCardApi';
import { BusinessPartnerRatingApi } from './BusinessPartnerRatingApi';
import { BusinessPartnerRoleApi } from './BusinessPartnerRoleApi';
import { BusinessPartnerTaxNumberApi } from './BusinessPartnerTaxNumberApi';
import { BusPartAddrDepdntTaxNmbrApi } from './BusPartAddrDepdntTaxNmbrApi';
import { CustAddrDepdntExtIdentifierApi } from './CustAddrDepdntExtIdentifierApi';
import { CustAddrDepdntInformationApi } from './CustAddrDepdntInformationApi';
import { CustomerApi } from './CustomerApi';
import { CustomerCompanyApi } from './CustomerCompanyApi';
import { CustomerCompanyTextApi } from './CustomerCompanyTextApi';
import { CustomerDunningApi } from './CustomerDunningApi';
import { CustomerSalesAreaApi } from './CustomerSalesAreaApi';
import { CustomerSalesAreaTaxApi } from './CustomerSalesAreaTaxApi';
import { CustomerSalesAreaTextApi } from './CustomerSalesAreaTextApi';
import { CustomerTaxGroupingApi } from './CustomerTaxGroupingApi';
import { CustomerTextApi } from './CustomerTextApi';
import { CustomerUnloadingPointApi } from './CustomerUnloadingPointApi';
import { CustomerWithHoldingTaxApi } from './CustomerWithHoldingTaxApi';
import { CustSalesPartnerFuncApi } from './CustSalesPartnerFuncApi';
import { CustSlsAreaAddrDepdntInfoApi } from './CustSlsAreaAddrDepdntInfoApi';
import { CustSlsAreaAddrDepdntTaxInfoApi } from './CustSlsAreaAddrDepdntTaxInfoApi';
import { CustUnldgPtAddrDepdntInfoApi } from './CustUnldgPtAddrDepdntInfoApi';
import { SupplierApi } from './SupplierApi';
import { SupplierCompanyApi } from './SupplierCompanyApi';
import { SupplierCompanyTextApi } from './SupplierCompanyTextApi';
import { SupplierDunningApi } from './SupplierDunningApi';
import { SupplierPartnerFuncApi } from './SupplierPartnerFuncApi';
import { SupplierPurchasingOrgApi } from './SupplierPurchasingOrgApi';
import { SupplierPurchasingOrgTextApi } from './SupplierPurchasingOrgTextApi';
import { SupplierTextApi } from './SupplierTextApi';
import { SupplierWithHoldingTaxApi } from './SupplierWithHoldingTaxApi';
import { BigNumber } from 'bignumber.js';
import { Moment } from 'moment';
import {
  defaultDeSerializers,
  DeSerializers,
  DefaultDeSerializers,
  mergeDefaultDeSerializersWith,
  Time,
} from '@sap-cloud-sdk/odata-v2';
import { batch, changeset } from './BatchRequest';

export function businessPartnerService<
  BinaryT = string,
  BooleanT = boolean,
  ByteT = number,
  DecimalT = BigNumber,
  DoubleT = number,
  FloatT = number,
  Int16T = number,
  Int32T = number,
  Int64T = BigNumber,
  GuidT = string,
  SByteT = number,
  SingleT = number,
  StringT = string,
  AnyT = any,
  DateTimeOffsetT = Moment,
  DateTimeT = Moment,
  TimeT = Time,
>(
  deSerializers: Partial<
    DeSerializers<
      BinaryT,
      BooleanT,
      ByteT,
      DecimalT,
      DoubleT,
      FloatT,
      Int16T,
      Int32T,
      Int64T,
      GuidT,
      SByteT,
      SingleT,
      StringT,
      AnyT,
      DateTimeOffsetT,
      DateTimeT,
      TimeT
    >
  > = defaultDeSerializers as any,
): BusinessPartnerService<
  DeSerializers<
    BinaryT,
    BooleanT,
    ByteT,
    DecimalT,
    DoubleT,
    FloatT,
    Int16T,
    Int32T,
    Int64T,
    GuidT,
    SByteT,
    SingleT,
    StringT,
    AnyT,
    DateTimeOffsetT,
    DateTimeT,
    TimeT
  >
> {
  return new BusinessPartnerService(
    mergeDefaultDeSerializersWith(deSerializers),
  );
}
class BusinessPartnerService<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> {
  private apis: Record<string, any> = {};
  private deSerializers: DeSerializersT;

  constructor(deSerializers: DeSerializersT) {
    this.deSerializers = deSerializers;
  }

  private initApi(key: string, entityApi: any): any {
    if (!this.apis[key]) {
      this.apis[key] = entityApi._privateFactory(this.deSerializers);
    }
    return this.apis[key];
  }

  get addressEmailAddressApi(): AddressEmailAddressApi<DeSerializersT> {
    return this.initApi('addressEmailAddressApi', AddressEmailAddressApi);
  }

  get addressFaxNumberApi(): AddressFaxNumberApi<DeSerializersT> {
    return this.initApi('addressFaxNumberApi', AddressFaxNumberApi);
  }

  get addressHomePageUrlApi(): AddressHomePageUrlApi<DeSerializersT> {
    return this.initApi('addressHomePageUrlApi', AddressHomePageUrlApi);
  }

  get addressPhoneNumberApi(): AddressPhoneNumberApi<DeSerializersT> {
    return this.initApi('addressPhoneNumberApi', AddressPhoneNumberApi);
  }

  get bpAddrDepdntIntlLocNumberApi(): BpAddrDepdntIntlLocNumberApi<DeSerializersT> {
    return this.initApi(
      'bpAddrDepdntIntlLocNumberApi',
      BpAddrDepdntIntlLocNumberApi,
    );
  }

  get bpAddressIndependentEmailApi(): BpAddressIndependentEmailApi<DeSerializersT> {
    return this.initApi(
      'bpAddressIndependentEmailApi',
      BpAddressIndependentEmailApi,
    );
  }

  get bpAddressIndependentFaxApi(): BpAddressIndependentFaxApi<DeSerializersT> {
    return this.initApi(
      'bpAddressIndependentFaxApi',
      BpAddressIndependentFaxApi,
    );
  }

  get bpAddressIndependentMobileApi(): BpAddressIndependentMobileApi<DeSerializersT> {
    return this.initApi(
      'bpAddressIndependentMobileApi',
      BpAddressIndependentMobileApi,
    );
  }

  get bpAddressIndependentPhoneApi(): BpAddressIndependentPhoneApi<DeSerializersT> {
    return this.initApi(
      'bpAddressIndependentPhoneApi',
      BpAddressIndependentPhoneApi,
    );
  }

  get bpAddressIndependentWebsiteApi(): BpAddressIndependentWebsiteApi<DeSerializersT> {
    return this.initApi(
      'bpAddressIndependentWebsiteApi',
      BpAddressIndependentWebsiteApi,
    );
  }

  get bpContactToAddressApi(): BpContactToAddressApi<DeSerializersT> {
    const api = this.initApi('bpContactToAddressApi', BpContactToAddressApi);
    const linkedApis = [
      this.initApi('addressEmailAddressApi', AddressEmailAddressApi),
      this.initApi('addressFaxNumberApi', AddressFaxNumberApi),
      this.initApi('addressPhoneNumberApi', AddressPhoneNumberApi),
      this.initApi('addressPhoneNumberApi', AddressPhoneNumberApi),
      this.initApi('addressHomePageUrlApi', AddressHomePageUrlApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get bpContactToFuncAndDeptApi(): BpContactToFuncAndDeptApi<DeSerializersT> {
    return this.initApi('bpContactToFuncAndDeptApi', BpContactToFuncAndDeptApi);
  }

  get bpCreditWorthinessApi(): BpCreditWorthinessApi<DeSerializersT> {
    return this.initApi('bpCreditWorthinessApi', BpCreditWorthinessApi);
  }

  get bpDataControllerApi(): BpDataControllerApi<DeSerializersT> {
    return this.initApi('bpDataControllerApi', BpDataControllerApi);
  }

  get bpEmploymentApi(): BpEmploymentApi<DeSerializersT> {
    return this.initApi('bpEmploymentApi', BpEmploymentApi);
  }

  get bpFinancialServicesExtnApi(): BpFinancialServicesExtnApi<DeSerializersT> {
    return this.initApi(
      'bpFinancialServicesExtnApi',
      BpFinancialServicesExtnApi,
    );
  }

  get bpFinancialServicesReportingApi(): BpFinancialServicesReportingApi<DeSerializersT> {
    return this.initApi(
      'bpFinancialServicesReportingApi',
      BpFinancialServicesReportingApi,
    );
  }

  get bpFiscalYearInformationApi(): BpFiscalYearInformationApi<DeSerializersT> {
    return this.initApi(
      'bpFiscalYearInformationApi',
      BpFiscalYearInformationApi,
    );
  }

  get bpIntlAddressVersionApi(): BpIntlAddressVersionApi<DeSerializersT> {
    return this.initApi('bpIntlAddressVersionApi', BpIntlAddressVersionApi);
  }

  get bpRelationshipApi(): BpRelationshipApi<DeSerializersT> {
    return this.initApi('bpRelationshipApi', BpRelationshipApi);
  }

  get buPaAddressUsageApi(): BuPaAddressUsageApi<DeSerializersT> {
    return this.initApi('buPaAddressUsageApi', BuPaAddressUsageApi);
  }

  get buPaIdentificationApi(): BuPaIdentificationApi<DeSerializersT> {
    return this.initApi('buPaIdentificationApi', BuPaIdentificationApi);
  }

  get buPaIndustryApi(): BuPaIndustryApi<DeSerializersT> {
    return this.initApi('buPaIndustryApi', BuPaIndustryApi);
  }

  get businessPartnerApi(): BusinessPartnerApi<DeSerializersT> {
    const api = this.initApi('businessPartnerApi', BusinessPartnerApi);
    const linkedApis = [
      this.initApi(
        'bpAddressIndependentEmailApi',
        BpAddressIndependentEmailApi,
      ),
      this.initApi('bpAddressIndependentFaxApi', BpAddressIndependentFaxApi),
      this.initApi(
        'bpAddressIndependentMobileApi',
        BpAddressIndependentMobileApi,
      ),
      this.initApi(
        'bpAddressIndependentPhoneApi',
        BpAddressIndependentPhoneApi,
      ),
      this.initApi(
        'bpAddressIndependentWebsiteApi',
        BpAddressIndependentWebsiteApi,
      ),
      this.initApi('bpCreditWorthinessApi', BpCreditWorthinessApi),
      this.initApi('bpDataControllerApi', BpDataControllerApi),
      this.initApi('bpEmploymentApi', BpEmploymentApi),
      this.initApi(
        'bpFinancialServicesReportingApi',
        BpFinancialServicesReportingApi,
      ),
      this.initApi('bpFiscalYearInformationApi', BpFiscalYearInformationApi),
      this.initApi('bpRelationshipApi', BpRelationshipApi),
      this.initApi('buPaIdentificationApi', BuPaIdentificationApi),
      this.initApi('buPaIndustryApi', BuPaIndustryApi),
      this.initApi('bpFinancialServicesExtnApi', BpFinancialServicesExtnApi),
      this.initApi('businessPartnerAddressApi', BusinessPartnerAddressApi),
      this.initApi('businessPartnerAliasApi', BusinessPartnerAliasApi),
      this.initApi('businessPartnerBankApi', BusinessPartnerBankApi),
      this.initApi('businessPartnerContactApi', BusinessPartnerContactApi),
      this.initApi('businessPartnerIsBankApi', BusinessPartnerIsBankApi),
      this.initApi('businessPartnerRatingApi', BusinessPartnerRatingApi),
      this.initApi('businessPartnerRoleApi', BusinessPartnerRoleApi),
      this.initApi('businessPartnerTaxNumberApi', BusinessPartnerTaxNumberApi),
      this.initApi('busPartAddrDepdntTaxNmbrApi', BusPartAddrDepdntTaxNmbrApi),
      this.initApi('customerApi', CustomerApi),
      this.initApi(
        'businessPartnerPaymentCardApi',
        BusinessPartnerPaymentCardApi,
      ),
      this.initApi('supplierApi', SupplierApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get businessPartnerAddressApi(): BusinessPartnerAddressApi<DeSerializersT> {
    const api = this.initApi(
      'businessPartnerAddressApi',
      BusinessPartnerAddressApi,
    );
    const linkedApis = [
      this.initApi('buPaAddressUsageApi', BuPaAddressUsageApi),
      this.initApi(
        'bpAddrDepdntIntlLocNumberApi',
        BpAddrDepdntIntlLocNumberApi,
      ),
      this.initApi('bpIntlAddressVersionApi', BpIntlAddressVersionApi),
      this.initApi('addressEmailAddressApi', AddressEmailAddressApi),
      this.initApi('addressFaxNumberApi', AddressFaxNumberApi),
      this.initApi('addressPhoneNumberApi', AddressPhoneNumberApi),
      this.initApi('addressPhoneNumberApi', AddressPhoneNumberApi),
      this.initApi('addressHomePageUrlApi', AddressHomePageUrlApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get businessPartnerAliasApi(): BusinessPartnerAliasApi<DeSerializersT> {
    return this.initApi('businessPartnerAliasApi', BusinessPartnerAliasApi);
  }

  get businessPartnerBankApi(): BusinessPartnerBankApi<DeSerializersT> {
    return this.initApi('businessPartnerBankApi', BusinessPartnerBankApi);
  }

  get businessPartnerContactApi(): BusinessPartnerContactApi<DeSerializersT> {
    const api = this.initApi(
      'businessPartnerContactApi',
      BusinessPartnerContactApi,
    );
    const linkedApis = [
      this.initApi('bpContactToAddressApi', BpContactToAddressApi),
      this.initApi('bpContactToFuncAndDeptApi', BpContactToFuncAndDeptApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get businessPartnerIsBankApi(): BusinessPartnerIsBankApi<DeSerializersT> {
    return this.initApi('businessPartnerIsBankApi', BusinessPartnerIsBankApi);
  }

  get businessPartnerPaymentCardApi(): BusinessPartnerPaymentCardApi<DeSerializersT> {
    return this.initApi(
      'businessPartnerPaymentCardApi',
      BusinessPartnerPaymentCardApi,
    );
  }

  get businessPartnerRatingApi(): BusinessPartnerRatingApi<DeSerializersT> {
    return this.initApi('businessPartnerRatingApi', BusinessPartnerRatingApi);
  }

  get businessPartnerRoleApi(): BusinessPartnerRoleApi<DeSerializersT> {
    return this.initApi('businessPartnerRoleApi', BusinessPartnerRoleApi);
  }

  get businessPartnerTaxNumberApi(): BusinessPartnerTaxNumberApi<DeSerializersT> {
    return this.initApi(
      'businessPartnerTaxNumberApi',
      BusinessPartnerTaxNumberApi,
    );
  }

  get busPartAddrDepdntTaxNmbrApi(): BusPartAddrDepdntTaxNmbrApi<DeSerializersT> {
    return this.initApi(
      'busPartAddrDepdntTaxNmbrApi',
      BusPartAddrDepdntTaxNmbrApi,
    );
  }

  get custAddrDepdntExtIdentifierApi(): CustAddrDepdntExtIdentifierApi<DeSerializersT> {
    return this.initApi(
      'custAddrDepdntExtIdentifierApi',
      CustAddrDepdntExtIdentifierApi,
    );
  }

  get custAddrDepdntInformationApi(): CustAddrDepdntInformationApi<DeSerializersT> {
    return this.initApi(
      'custAddrDepdntInformationApi',
      CustAddrDepdntInformationApi,
    );
  }

  get customerApi(): CustomerApi<DeSerializersT> {
    const api = this.initApi('customerApi', CustomerApi);
    const linkedApis = [
      this.initApi(
        'custAddrDepdntExtIdentifierApi',
        CustAddrDepdntExtIdentifierApi,
      ),
      this.initApi(
        'custAddrDepdntInformationApi',
        CustAddrDepdntInformationApi,
      ),
      this.initApi('customerCompanyApi', CustomerCompanyApi),
      this.initApi('customerSalesAreaApi', CustomerSalesAreaApi),
      this.initApi('customerTaxGroupingApi', CustomerTaxGroupingApi),
      this.initApi('customerTextApi', CustomerTextApi),
      this.initApi('customerUnloadingPointApi', CustomerUnloadingPointApi),
      this.initApi(
        'custUnldgPtAddrDepdntInfoApi',
        CustUnldgPtAddrDepdntInfoApi,
      ),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get customerCompanyApi(): CustomerCompanyApi<DeSerializersT> {
    const api = this.initApi('customerCompanyApi', CustomerCompanyApi);
    const linkedApis = [
      this.initApi('customerCompanyTextApi', CustomerCompanyTextApi),
      this.initApi('customerDunningApi', CustomerDunningApi),
      this.initApi('customerWithHoldingTaxApi', CustomerWithHoldingTaxApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get customerCompanyTextApi(): CustomerCompanyTextApi<DeSerializersT> {
    return this.initApi('customerCompanyTextApi', CustomerCompanyTextApi);
  }

  get customerDunningApi(): CustomerDunningApi<DeSerializersT> {
    return this.initApi('customerDunningApi', CustomerDunningApi);
  }

  get customerSalesAreaApi(): CustomerSalesAreaApi<DeSerializersT> {
    const api = this.initApi('customerSalesAreaApi', CustomerSalesAreaApi);
    const linkedApis = [
      this.initApi('custSalesPartnerFuncApi', CustSalesPartnerFuncApi),
      this.initApi('customerSalesAreaTaxApi', CustomerSalesAreaTaxApi),
      this.initApi('customerSalesAreaTextApi', CustomerSalesAreaTextApi),
      this.initApi(
        'custSlsAreaAddrDepdntInfoApi',
        CustSlsAreaAddrDepdntInfoApi,
      ),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get customerSalesAreaTaxApi(): CustomerSalesAreaTaxApi<DeSerializersT> {
    const api = this.initApi(
      'customerSalesAreaTaxApi',
      CustomerSalesAreaTaxApi,
    );
    const linkedApis = [
      this.initApi(
        'custSlsAreaAddrDepdntTaxInfoApi',
        CustSlsAreaAddrDepdntTaxInfoApi,
      ),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get customerSalesAreaTextApi(): CustomerSalesAreaTextApi<DeSerializersT> {
    return this.initApi('customerSalesAreaTextApi', CustomerSalesAreaTextApi);
  }

  get customerTaxGroupingApi(): CustomerTaxGroupingApi<DeSerializersT> {
    return this.initApi('customerTaxGroupingApi', CustomerTaxGroupingApi);
  }

  get customerTextApi(): CustomerTextApi<DeSerializersT> {
    return this.initApi('customerTextApi', CustomerTextApi);
  }

  get customerUnloadingPointApi(): CustomerUnloadingPointApi<DeSerializersT> {
    return this.initApi('customerUnloadingPointApi', CustomerUnloadingPointApi);
  }

  get customerWithHoldingTaxApi(): CustomerWithHoldingTaxApi<DeSerializersT> {
    return this.initApi('customerWithHoldingTaxApi', CustomerWithHoldingTaxApi);
  }

  get custSalesPartnerFuncApi(): CustSalesPartnerFuncApi<DeSerializersT> {
    return this.initApi('custSalesPartnerFuncApi', CustSalesPartnerFuncApi);
  }

  get custSlsAreaAddrDepdntInfoApi(): CustSlsAreaAddrDepdntInfoApi<DeSerializersT> {
    return this.initApi(
      'custSlsAreaAddrDepdntInfoApi',
      CustSlsAreaAddrDepdntInfoApi,
    );
  }

  get custSlsAreaAddrDepdntTaxInfoApi(): CustSlsAreaAddrDepdntTaxInfoApi<DeSerializersT> {
    return this.initApi(
      'custSlsAreaAddrDepdntTaxInfoApi',
      CustSlsAreaAddrDepdntTaxInfoApi,
    );
  }

  get custUnldgPtAddrDepdntInfoApi(): CustUnldgPtAddrDepdntInfoApi<DeSerializersT> {
    return this.initApi(
      'custUnldgPtAddrDepdntInfoApi',
      CustUnldgPtAddrDepdntInfoApi,
    );
  }

  get supplierApi(): SupplierApi<DeSerializersT> {
    const api = this.initApi('supplierApi', SupplierApi);
    const linkedApis = [
      this.initApi('supplierCompanyApi', SupplierCompanyApi),
      this.initApi('supplierPurchasingOrgApi', SupplierPurchasingOrgApi),
      this.initApi('supplierTextApi', SupplierTextApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get supplierCompanyApi(): SupplierCompanyApi<DeSerializersT> {
    const api = this.initApi('supplierCompanyApi', SupplierCompanyApi);
    const linkedApis = [
      this.initApi('supplierCompanyTextApi', SupplierCompanyTextApi),
      this.initApi('supplierApi', SupplierApi),
      this.initApi('supplierDunningApi', SupplierDunningApi),
      this.initApi('supplierWithHoldingTaxApi', SupplierWithHoldingTaxApi),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get supplierCompanyTextApi(): SupplierCompanyTextApi<DeSerializersT> {
    return this.initApi('supplierCompanyTextApi', SupplierCompanyTextApi);
  }

  get supplierDunningApi(): SupplierDunningApi<DeSerializersT> {
    return this.initApi('supplierDunningApi', SupplierDunningApi);
  }

  get supplierPartnerFuncApi(): SupplierPartnerFuncApi<DeSerializersT> {
    return this.initApi('supplierPartnerFuncApi', SupplierPartnerFuncApi);
  }

  get supplierPurchasingOrgApi(): SupplierPurchasingOrgApi<DeSerializersT> {
    const api = this.initApi(
      'supplierPurchasingOrgApi',
      SupplierPurchasingOrgApi,
    );
    const linkedApis = [
      this.initApi('supplierPartnerFuncApi', SupplierPartnerFuncApi),
      this.initApi(
        'supplierPurchasingOrgTextApi',
        SupplierPurchasingOrgTextApi,
      ),
    ];
    api._addNavigationProperties(linkedApis);
    return api;
  }

  get supplierPurchasingOrgTextApi(): SupplierPurchasingOrgTextApi<DeSerializersT> {
    return this.initApi(
      'supplierPurchasingOrgTextApi',
      SupplierPurchasingOrgTextApi,
    );
  }

  get supplierTextApi(): SupplierTextApi<DeSerializersT> {
    return this.initApi('supplierTextApi', SupplierTextApi);
  }

  get supplierWithHoldingTaxApi(): SupplierWithHoldingTaxApi<DeSerializersT> {
    return this.initApi('supplierWithHoldingTaxApi', SupplierWithHoldingTaxApi);
  }

  get batch(): typeof batch {
    return batch;
  }

  get changeset(): typeof changeset {
    return changeset;
  }
}
