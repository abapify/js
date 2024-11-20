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
import type { BpFinancialServicesReportingApi } from './BpFinancialServicesReportingApi';

/**
 * This class represents the entity "A_BPFinancialServicesReporting" of service "API_BUSINESS_PARTNER".
 */
export class BpFinancialServicesReporting<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpFinancialServicesReportingType<T>
{
  /**
   * Technical entity name for BpFinancialServicesReporting.
   */
  static override _entityName = 'A_BPFinancialServicesReporting';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpFinancialServicesReporting entity.
   */
  static _keys = ['BusinessPartner'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Non-Resident According to Paragraph 4 AWG.
   * @nullable
   */
  declare bpIsNonResident?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Start of Non-Residency According to Paragraph 4 AWG.
   * @nullable
   */
  declare bpNonResidencyStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Recipient of Multimillion Loan According to Paragraph 14 GBA.
   * @nullable
   */
  declare bpIsMultimillionLoanRecipient?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Borrower Number for Reporting a Loan According to GBA.
   * Maximum length: 8.
   * @nullable
   */
  declare bpLoanReportingBorrowerNumber?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Borrower Entity Number Used to Report Loan acc. to GBA.
   * Maximum length: 8.
   * @nullable
   */
  declare bpLoanRptgBorrowerEntityNumber?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Credit Standing Review According to Paragraph 18 GBA.
   * Maximum length: 2.
   * @nullable
   */
  declare bpCreditStandingReview?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Credit Standing Review According to Paragraph 18 GBA.
   * @nullable
   */
  declare bpCreditStandingReviewDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Loan to Manager According to Paragraph 15 German Banking Act.
   * Maximum length: 2.
   * @nullable
   */
  declare businessPartnerLoanToManager?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Organization Relationship.
   * Maximum length: 1.
   * @nullable
   */
  declare bpCompanyRelationship?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Creditor Number for Reporting a Loan According to GBA.
   * Maximum length: 8.
   * @nullable
   */
  declare bpLoanReportingCreditorNumber?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * (OeNB) Ident Number.
   * Maximum length: 11.
   * @nullable
   */
  declare bpOeNbIdentNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Target Group According to OeNB.
   * Maximum length: 2.
   * @nullable
   */
  declare bpOeNbTargetGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Assign (OeNB) Ident Number.
   * Maximum length: 1.
   * @nullable
   */
  declare bpOeNbIdentNumberAssigned?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Institute Number According to OeNB.
   * Maximum length: 7.
   * @nullable
   */
  declare bpOeNbInstituteNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Institute Subject to Austrian Reg. Reporting Requirements.
   * @nullable
   */
  declare businessPartnerIsOeNbInstitute?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Group ID.
   * Maximum length: 15.
   * @nullable
   */
  declare businessPartnerGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Group Assignment Category.
   * Maximum length: 1.
   * @nullable
   */
  declare bpGroupAssignmentCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Group Name.
   * Maximum length: 50.
   * @nullable
   */
  declare businessPartnerGroupName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Legal Entity for Business Partner.
   * Maximum length: 2.
   * @nullable
   */
  declare businessPartnerLegalEntity?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Acc. to Para. 4, Sec. 2 of Asset Regulation.
   * Maximum length: 1.
   * @nullable
   */
  declare bpGerAstRglnRestrictedAstQuota?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Debtor Group According to German Law (BerVersV, Template 5).
   * Maximum length: 1.
   * @nullable
   */
  declare businessPartnerDebtorGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Category of Business Purpose.
   * Maximum length: 2.
   * @nullable
   */
  declare businessPartnerBusinessPurpose?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Risk Group.
   * Maximum length: 1.
   * @nullable
   */
  declare businessPartnerRiskGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Risk Grouping.
   * @nullable
   */
  declare bpRiskGroupingDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Group Affiliation Exists.
   * @nullable
   */
  declare bpHasGroupAffiliation?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Monetary Financial Institution.
   * @nullable
   */
  declare bpIsMonetaryFinInstitution?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Obligation to Submit to Credit Standing Review - Para.18 GBA.
   * @nullable
   */
  declare bpCrdtStandingReviewIsRequired?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Large-Scale Loan Monitoring According to Paragraph 13b GBA.
   * @nullable
   */
  declare bpLoanMonitoringIsRequired?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Crediting Relief in Accordance with Paragraph 13/3 GBA.
   * @nullable
   */
  declare bpHasCreditingRelief?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Authorized Acc. to Para. 2(1)18b of German Asset Regulation.
   * @nullable
   */
  declare bpInvestInRstrcdAstIsAuthzd?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Numeric Code for State Central Bank Country/Region Indicator.
   * Maximum length: 4.
   * @nullable
   */
  declare bpCentralBankCountryRegion?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BpFinancialServicesReportingApi<T>) {
    super(_entityApi);
  }
}

export interface BpFinancialServicesReportingType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bpIsNonResident?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpNonResidencyStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bpIsMultimillionLoanRecipient?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpLoanReportingBorrowerNumber?: DeserializedType<T, 'Edm.String'> | null;
  bpLoanRptgBorrowerEntityNumber?: DeserializedType<T, 'Edm.String'> | null;
  bpCreditStandingReview?: DeserializedType<T, 'Edm.String'> | null;
  bpCreditStandingReviewDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  businessPartnerLoanToManager?: DeserializedType<T, 'Edm.String'> | null;
  bpCompanyRelationship?: DeserializedType<T, 'Edm.String'> | null;
  bpLoanReportingCreditorNumber?: DeserializedType<T, 'Edm.String'> | null;
  bpOeNbIdentNumber?: DeserializedType<T, 'Edm.String'> | null;
  bpOeNbTargetGroup?: DeserializedType<T, 'Edm.String'> | null;
  bpOeNbIdentNumberAssigned?: DeserializedType<T, 'Edm.String'> | null;
  bpOeNbInstituteNumber?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerIsOeNbInstitute?: DeserializedType<T, 'Edm.Boolean'> | null;
  businessPartnerGroup?: DeserializedType<T, 'Edm.String'> | null;
  bpGroupAssignmentCategory?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerGroupName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerLegalEntity?: DeserializedType<T, 'Edm.String'> | null;
  bpGerAstRglnRestrictedAstQuota?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerDebtorGroup?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerBusinessPurpose?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerRiskGroup?: DeserializedType<T, 'Edm.String'> | null;
  bpRiskGroupingDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bpHasGroupAffiliation?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpIsMonetaryFinInstitution?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpCrdtStandingReviewIsRequired?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpLoanMonitoringIsRequired?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpHasCreditingRelief?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpInvestInRstrcdAstIsAuthzd?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpCentralBankCountryRegion?: DeserializedType<T, 'Edm.String'> | null;
}
