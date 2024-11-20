/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpFinancialServicesReporting } from './BpFinancialServicesReporting';
import { BpFinancialServicesReportingRequestBuilder } from './BpFinancialServicesReportingRequestBuilder';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField,
} from '@sap-cloud-sdk/odata-v2';
export class BpFinancialServicesReportingApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements
    EntityApi<BpFinancialServicesReporting<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any,
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers,
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any,
  ): BpFinancialServicesReportingApi<DeSerializersT> {
    return new BpFinancialServicesReportingApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpFinancialServicesReporting;

  requestBuilder(): BpFinancialServicesReportingRequestBuilder<DeSerializersT> {
    return new BpFinancialServicesReportingRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpFinancialServicesReporting<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BpFinancialServicesReporting<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpFinancialServicesReporting<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof BpFinancialServicesReporting,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpFinancialServicesReporting,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_IS_NON_RESIDENT: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_NON_RESIDENCY_START_DATE: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_IS_MULTIMILLION_LOAN_RECIPIENT: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_LOAN_REPORTING_BORROWER_NUMBER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LOAN_RPTG_BORROWER_ENTITY_NUMBER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CREDIT_STANDING_REVIEW: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CREDIT_STANDING_REVIEW_DATE: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BUSINESS_PARTNER_LOAN_TO_MANAGER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_COMPANY_RELATIONSHIP: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LOAN_REPORTING_CREDITOR_NUMBER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_OE_NB_IDENT_NUMBER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_OE_NB_TARGET_GROUP: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_OE_NB_IDENT_NUMBER_ASSIGNED: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_OE_NB_INSTITUTE_NUMBER: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_IS_OE_NB_INSTITUTE: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BUSINESS_PARTNER_GROUP: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_GROUP_ASSIGNMENT_CATEGORY: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_GROUP_NAME: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_LEGAL_ENTITY: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_GER_AST_RGLN_RESTRICTED_AST_QUOTA: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_DEBTOR_GROUP: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_BUSINESS_PURPOSE: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_RISK_GROUP: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_RISK_GROUPING_DATE: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_HAS_GROUP_AFFILIATION: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_IS_MONETARY_FIN_INSTITUTION: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_CRDT_STANDING_REVIEW_IS_REQUIRED: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_LOAN_MONITORING_IS_REQUIRED: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_HAS_CREDITING_RELIEF: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_INVEST_IN_RSTRCD_AST_IS_AUTHZD: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_CENTRAL_BANK_COUNTRY_REGION: OrderableEdmTypeField<
      BpFinancialServicesReporting<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpFinancialServicesReporting<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link businessPartner} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER: fieldBuilder.buildEdmTypeField(
          'BusinessPartner',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpIsNonResident} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IS_NON_RESIDENT: fieldBuilder.buildEdmTypeField(
          'BPIsNonResident',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpNonResidencyStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_NON_RESIDENCY_START_DATE: fieldBuilder.buildEdmTypeField(
          'BPNonResidencyStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpIsMultimillionLoanRecipient} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IS_MULTIMILLION_LOAN_RECIPIENT: fieldBuilder.buildEdmTypeField(
          'BPIsMultimillionLoanRecipient',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpLoanReportingBorrowerNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LOAN_REPORTING_BORROWER_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPLoanReportingBorrowerNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpLoanRptgBorrowerEntityNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LOAN_RPTG_BORROWER_ENTITY_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPLoanRptgBorrowerEntityNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingReview} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_REVIEW: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingReview',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingReviewDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_REVIEW_DATE: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingReviewDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerLoanToManager} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_LOAN_TO_MANAGER: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerLoanToManager',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCompanyRelationship} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_COMPANY_RELATIONSHIP: fieldBuilder.buildEdmTypeField(
          'BPCompanyRelationship',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpLoanReportingCreditorNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LOAN_REPORTING_CREDITOR_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPLoanReportingCreditorNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpOeNbIdentNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_OE_NB_IDENT_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPOeNBIdentNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpOeNbTargetGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_OE_NB_TARGET_GROUP: fieldBuilder.buildEdmTypeField(
          'BPOeNBTargetGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpOeNbIdentNumberAssigned} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_OE_NB_IDENT_NUMBER_ASSIGNED: fieldBuilder.buildEdmTypeField(
          'BPOeNBIdentNumberAssigned',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpOeNbInstituteNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_OE_NB_INSTITUTE_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPOeNBInstituteNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerIsOeNbInstitute} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_IS_OE_NB_INSTITUTE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIsOeNBInstitute',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpGroupAssignmentCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_GROUP_ASSIGNMENT_CATEGORY: fieldBuilder.buildEdmTypeField(
          'BPGroupAssignmentCategory',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerGroupName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_GROUP_NAME: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerGroupName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerLegalEntity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_LEGAL_ENTITY: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerLegalEntity',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpGerAstRglnRestrictedAstQuota} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_GER_AST_RGLN_RESTRICTED_AST_QUOTA: fieldBuilder.buildEdmTypeField(
          'BPGerAstRglnRestrictedAstQuota',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerDebtorGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_DEBTOR_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerDebtorGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerBusinessPurpose} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_BUSINESS_PURPOSE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerBusinessPurpose',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRiskGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RISK_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRiskGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpRiskGroupingDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RISK_GROUPING_DATE: fieldBuilder.buildEdmTypeField(
          'BPRiskGroupingDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpHasGroupAffiliation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_HAS_GROUP_AFFILIATION: fieldBuilder.buildEdmTypeField(
          'BPHasGroupAffiliation',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpIsMonetaryFinInstitution} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IS_MONETARY_FIN_INSTITUTION: fieldBuilder.buildEdmTypeField(
          'BPIsMonetaryFinInstitution',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpCrdtStandingReviewIsRequired} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CRDT_STANDING_REVIEW_IS_REQUIRED: fieldBuilder.buildEdmTypeField(
          'BPCrdtStandingReviewIsRequired',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpLoanMonitoringIsRequired} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LOAN_MONITORING_IS_REQUIRED: fieldBuilder.buildEdmTypeField(
          'BPLoanMonitoringIsRequired',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpHasCreditingRelief} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_HAS_CREDITING_RELIEF: fieldBuilder.buildEdmTypeField(
          'BPHasCreditingRelief',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpInvestInRstrcdAstIsAuthzd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_INVEST_IN_RSTRCD_AST_IS_AUTHZD: fieldBuilder.buildEdmTypeField(
          'BPInvestInRstrcdAstIsAuthzd',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpCentralBankCountryRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CENTRAL_BANK_COUNTRY_REGION: fieldBuilder.buildEdmTypeField(
          'BPCentralBankCountryRegion',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpFinancialServicesReporting),
      };
    }

    return this._schema;
  }
}
