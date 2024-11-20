/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpFiscalYearInformation } from './BpFiscalYearInformation';
import { BpFiscalYearInformationRequestBuilder } from './BpFiscalYearInformationRequestBuilder';
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
export class BpFiscalYearInformationApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpFiscalYearInformation<DeSerializersT>, DeSerializersT>
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
  ): BpFiscalYearInformationApi<DeSerializersT> {
    return new BpFiscalYearInformationApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpFiscalYearInformation;

  requestBuilder(): BpFiscalYearInformationRequestBuilder<DeSerializersT> {
    return new BpFiscalYearInformationRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpFiscalYearInformation<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BpFiscalYearInformation<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpFiscalYearInformation<DeSerializersT>,
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
    typeof BpFiscalYearInformation,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpFiscalYearInformation,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_FISCAL_YEAR: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_BALANCE_SHEET_CURRENCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_ANNUAL_STOCKHOLDER_MEETING_DATE: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_FISCAL_YEAR_START_DATE: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_FISCAL_YEAR_END_DATE: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_FISCAL_YEAR_IS_CLOSED: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_FISCAL_YEAR_CLOSING_DATE: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_FSCL_YR_CNSLDTD_FIN_STATEMENT_DTE: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_CAPITAL_STOCK_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ISSD_STOCK_CPTL_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_PARTCIPN_CERT_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_EQUITY_CAPITAL_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_GROSS_PREMIUM_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_NET_PREMIUM_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ANNUAL_SALES_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ANNUAL_NET_INC_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_DIVIDEND_DISTR_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_DEBT_RATIO_IN_YEARS: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ANNUAL_PN_L_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_BAL_SHEET_TOTAL_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_NUMBER_OF_EMPLOYEES: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CPTL_RESERVE_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_LGL_REVN_RSRV_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    REVN_RSRV_OWN_STK_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_STATRY_RESERVE_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_OTH_REVN_RSRV_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_PN_L_CARRYFWD_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_SUBORDD_LBLTY_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_RET_ON_TOTAL_CPTL_EMPLD_IN_PERCENT: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_DEBT_CLEARANCE_PERIOD_IN_YEARS: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_FINANCING_COEFF_IN_PERCENT: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_EQUITY_RATIO_IN_PERCENT: OrderableEdmTypeField<
      BpFiscalYearInformation<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpFiscalYearInformation<DeSerializers>>;
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
         * Static representation of the {@link businessPartnerFiscalYear} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_FISCAL_YEAR: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerFiscalYear',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpBalanceSheetCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_BALANCE_SHEET_CURRENCY: fieldBuilder.buildEdmTypeField(
          'BPBalanceSheetCurrency',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualStockholderMeetingDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_STOCKHOLDER_MEETING_DATE: fieldBuilder.buildEdmTypeField(
          'BPAnnualStockholderMeetingDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpFiscalYearStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FISCAL_YEAR_START_DATE: fieldBuilder.buildEdmTypeField(
          'BPFiscalYearStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpFiscalYearEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FISCAL_YEAR_END_DATE: fieldBuilder.buildEdmTypeField(
          'BPFiscalYearEndDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpFiscalYearIsClosed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FISCAL_YEAR_IS_CLOSED: fieldBuilder.buildEdmTypeField(
          'BPFiscalYearIsClosed',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpFiscalYearClosingDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FISCAL_YEAR_CLOSING_DATE: fieldBuilder.buildEdmTypeField(
          'BPFiscalYearClosingDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpFsclYrCnsldtdFinStatementDte} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FSCL_YR_CNSLDTD_FIN_STATEMENT_DTE: fieldBuilder.buildEdmTypeField(
          'BPFsclYrCnsldtdFinStatementDte',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpCapitalStockAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CAPITAL_STOCK_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPCapitalStockAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpIssdStockCptlAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ISSD_STOCK_CPTL_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPIssdStockCptlAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpPartcipnCertAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_PARTCIPN_CERT_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPPartcipnCertAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpEquityCapitalAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_EQUITY_CAPITAL_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPEquityCapitalAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpGrossPremiumAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_GROSS_PREMIUM_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPGrossPremiumAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpNetPremiumAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_NET_PREMIUM_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPNetPremiumAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualSalesAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_SALES_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPAnnualSalesAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualNetIncAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_NET_INC_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPAnnualNetIncAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpDividendDistrAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_DIVIDEND_DISTR_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPDividendDistrAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpDebtRatioInYears} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_DEBT_RATIO_IN_YEARS: fieldBuilder.buildEdmTypeField(
          'BPDebtRatioInYears',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualPnLAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_PN_L_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPAnnualPnLAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpBalSheetTotalAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_BAL_SHEET_TOTAL_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPBalSheetTotalAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpNumberOfEmployees} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_NUMBER_OF_EMPLOYEES: fieldBuilder.buildEdmTypeField(
          'BPNumberOfEmployees',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCptlReserveAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CPTL_RESERVE_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPCptlReserveAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpLglRevnRsrvAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LGL_REVN_RSRV_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPLglRevnRsrvAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link revnRsrvOwnStkAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REVN_RSRV_OWN_STK_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'RevnRsrvOwnStkAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpStatryReserveAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_STATRY_RESERVE_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPStatryReserveAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpOthRevnRsrvAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_OTH_REVN_RSRV_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPOthRevnRsrvAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpPnLCarryfwdAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_PN_L_CARRYFWD_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPPnLCarryfwdAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpSuborddLbltyAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_SUBORDD_LBLTY_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPSuborddLbltyAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpRetOnTotalCptlEmpldInPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RET_ON_TOTAL_CPTL_EMPLD_IN_PERCENT: fieldBuilder.buildEdmTypeField(
          'BPRetOnTotalCptlEmpldInPercent',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpDebtClearancePeriodInYears} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_DEBT_CLEARANCE_PERIOD_IN_YEARS: fieldBuilder.buildEdmTypeField(
          'BPDebtClearancePeriodInYears',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpFinancingCoeffInPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FINANCING_COEFF_IN_PERCENT: fieldBuilder.buildEdmTypeField(
          'BPFinancingCoeffInPercent',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpEquityRatioInPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_EQUITY_RATIO_IN_PERCENT: fieldBuilder.buildEdmTypeField(
          'BPEquityRatioInPercent',
          'Edm.Decimal',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpFiscalYearInformation),
      };
    }

    return this._schema;
  }
}
