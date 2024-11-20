/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpFinancialServicesExtn } from './BpFinancialServicesExtn';
import { BpFinancialServicesExtnRequestBuilder } from './BpFinancialServicesExtnRequestBuilder';
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
export class BpFinancialServicesExtnApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpFinancialServicesExtn<DeSerializersT>, DeSerializersT>
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
  ): BpFinancialServicesExtnApi<DeSerializersT> {
    return new BpFinancialServicesExtnApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpFinancialServicesExtn;

  requestBuilder(): BpFinancialServicesExtnRequestBuilder<DeSerializersT> {
    return new BpFinancialServicesExtnRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpFinancialServicesExtn<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BpFinancialServicesExtn<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpFinancialServicesExtn<DeSerializersT>,
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
    typeof BpFinancialServicesExtn,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpFinancialServicesExtn,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_IS_VIP: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    TRADING_PARTNER: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FACTORY_CALENDAR: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_OFFICE_COUNTRY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_OFFICE_REGION: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_REGISTERED_OFFICE_NAME: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_BALANCE_SHEET_CURRENCY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LAST_CPTL_INCR_AMT_IN_BAL_SHT_CRCY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_LAST_CAPITAL_INCREASE_YEAR: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_BALANCE_SHEET_DISPLAY_TYPE: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_CITIZENSHIP: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_MARITAL_PROPERTY_REGIME: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_INCOME_CURRENCY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_NUMBER_OF_CHILDREN: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_NUMBER_OF_HOUSEHOLD_MEMBERS: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ANNUAL_NET_INC_AMT_IN_INCOME_CRCY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_MONTHLY_NET_INC_AMT_IN_INCOME_CRCY: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    BP_ANNUAL_NET_INCOME_YEAR: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_MONTHLY_NET_INCOME_MONTH: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_MONTHLY_NET_INCOME_YEAR: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_PLACE_OF_DEATH_NAME: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_IS_UNWANTED: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    UNDESIRABILITY_REASON: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    UNDESIRABILITY_COMMENT: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    LAST_CUSTOMER_CONTACT_DATE: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_GROUPING_CHARACTER: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LETTER_SALUTATION: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_TARGET_GROUP: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_EMPLOYEE_GROUP: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_IS_EMPLOYEE: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_TERMN_BUS_RELATIONS_BANK_DATE: OrderableEdmTypeField<
      BpFinancialServicesExtn<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpFinancialServicesExtn<DeSerializers>>;
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
         * Static representation of the {@link businessPartnerIsVip} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_IS_VIP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIsVIP',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link tradingPartner} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRADING_PARTNER: fieldBuilder.buildEdmTypeField(
          'TradingPartner',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link factoryCalendar} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FACTORY_CALENDAR: fieldBuilder.buildEdmTypeField(
          'FactoryCalendar',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerOfficeCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_OFFICE_COUNTRY: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerOfficeCountry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerOfficeRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_OFFICE_REGION: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerOfficeRegion',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpRegisteredOfficeName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_REGISTERED_OFFICE_NAME: fieldBuilder.buildEdmTypeField(
          'BPRegisteredOfficeName',
          'Edm.String',
          true,
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
         * Static representation of the {@link bpLastCptlIncrAmtInBalShtCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LAST_CPTL_INCR_AMT_IN_BAL_SHT_CRCY: fieldBuilder.buildEdmTypeField(
          'BPLastCptlIncrAmtInBalShtCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpLastCapitalIncreaseYear} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LAST_CAPITAL_INCREASE_YEAR: fieldBuilder.buildEdmTypeField(
          'BPLastCapitalIncreaseYear',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpBalanceSheetDisplayType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_BALANCE_SHEET_DISPLAY_TYPE: fieldBuilder.buildEdmTypeField(
          'BPBalanceSheetDisplayType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerCitizenship} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_CITIZENSHIP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerCitizenship',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpMaritalPropertyRegime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_MARITAL_PROPERTY_REGIME: fieldBuilder.buildEdmTypeField(
          'BPMaritalPropertyRegime',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerIncomeCurrency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_INCOME_CURRENCY: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIncomeCurrency',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpNumberOfChildren} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_NUMBER_OF_CHILDREN: fieldBuilder.buildEdmTypeField(
          'BPNumberOfChildren',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpNumberOfHouseholdMembers} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_NUMBER_OF_HOUSEHOLD_MEMBERS: fieldBuilder.buildEdmTypeField(
          'BPNumberOfHouseholdMembers',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualNetIncAmtInIncomeCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_NET_INC_AMT_IN_INCOME_CRCY: fieldBuilder.buildEdmTypeField(
          'BPAnnualNetIncAmtInIncomeCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpMonthlyNetIncAmtInIncomeCrcy} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_MONTHLY_NET_INC_AMT_IN_INCOME_CRCY: fieldBuilder.buildEdmTypeField(
          'BPMonthlyNetIncAmtInIncomeCrcy',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link bpAnnualNetIncomeYear} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ANNUAL_NET_INCOME_YEAR: fieldBuilder.buildEdmTypeField(
          'BPAnnualNetIncomeYear',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpMonthlyNetIncomeMonth} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_MONTHLY_NET_INCOME_MONTH: fieldBuilder.buildEdmTypeField(
          'BPMonthlyNetIncomeMonth',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpMonthlyNetIncomeYear} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_MONTHLY_NET_INCOME_YEAR: fieldBuilder.buildEdmTypeField(
          'BPMonthlyNetIncomeYear',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpPlaceOfDeathName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_PLACE_OF_DEATH_NAME: fieldBuilder.buildEdmTypeField(
          'BPPlaceOfDeathName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerIsUnwanted} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_IS_UNWANTED: fieldBuilder.buildEdmTypeField(
          'CustomerIsUnwanted',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link undesirabilityReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNDESIRABILITY_REASON: fieldBuilder.buildEdmTypeField(
          'UndesirabilityReason',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link undesirabilityComment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNDESIRABILITY_COMMENT: fieldBuilder.buildEdmTypeField(
          'UndesirabilityComment',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link lastCustomerContactDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CUSTOMER_CONTACT_DATE: fieldBuilder.buildEdmTypeField(
          'LastCustomerContactDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpGroupingCharacter} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_GROUPING_CHARACTER: fieldBuilder.buildEdmTypeField(
          'BPGroupingCharacter',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpLetterSalutation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LETTER_SALUTATION: fieldBuilder.buildEdmTypeField(
          'BPLetterSalutation',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerTargetGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_TARGET_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerTargetGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerEmployeeGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_EMPLOYEE_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerEmployeeGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerIsEmployee} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_IS_EMPLOYEE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIsEmployee',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpTermnBusRelationsBankDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_TERMN_BUS_RELATIONS_BANK_DATE: fieldBuilder.buildEdmTypeField(
          'BPTermnBusRelationsBankDate',
          'Edm.DateTime',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpFinancialServicesExtn),
      };
    }

    return this._schema;
  }
}
