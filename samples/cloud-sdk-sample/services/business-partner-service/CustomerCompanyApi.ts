/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerCompany } from './CustomerCompany';
import { CustomerCompanyRequestBuilder } from './CustomerCompanyRequestBuilder';
import { CustomerCompanyTextApi } from './CustomerCompanyTextApi';
import { CustomerDunningApi } from './CustomerDunningApi';
import { CustomerWithHoldingTaxApi } from './CustomerWithHoldingTaxApi';
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
  Link,
} from '@sap-cloud-sdk/odata-v2';
export class CustomerCompanyApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerCompany<DeSerializersT>, DeSerializersT>
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
  ): CustomerCompanyApi<DeSerializersT> {
    return new CustomerCompanyApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toCompanyText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_COMPANY_TEXT: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerCompanyTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerDunning} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_DUNNING: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerDunningApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toWithHoldingTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_WITH_HOLDING_TAX: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerWithHoldingTaxApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      CustomerCompanyTextApi<DeSerializersT>,
      CustomerDunningApi<DeSerializersT>,
      CustomerWithHoldingTaxApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_COMPANY_TEXT: new Link('to_CompanyText', this, linkedApis[0]),
      TO_CUSTOMER_DUNNING: new Link('to_CustomerDunning', this, linkedApis[1]),
      TO_WITH_HOLDING_TAX: new Link('to_WithHoldingTax', this, linkedApis[2]),
    };
    return this;
  }

  entityConstructor = CustomerCompany;

  requestBuilder(): CustomerCompanyRequestBuilder<DeSerializersT> {
    return new CustomerCompanyRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerCompany<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<CustomerCompany<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<CustomerCompany<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof CustomerCompany, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerCompany,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COMPANY_CODE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    APAR_TOLERANCE_GROUP: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNT_BY_CUSTOMER: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNTING_CLERK: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNTING_CLERK_FAX_NUMBER: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNTING_CLERK_INTERNET_ADDRESS: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ACCOUNTING_CLERK_PHONE_NUMBER: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALTERNATIVE_PAYER_ACCOUNT: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COLLECTIVE_INVOICE_VARIANT: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_ACCOUNT_NOTE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_HEAD_OFFICE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_SUPPLIER_CLEARING_IS_USED: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    HOUSE_BANK: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTEREST_CALCULATION_CODE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTEREST_CALCULATION_DATE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    INTRST_CALC_FREQUENCY_IN_MONTHS: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_TO_BE_LOCALLY_PROCESSED: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    ITEM_IS_TO_BE_PAID_SEPARATELY: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    LAYOUT_SORTING_RULE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_BLOCKING_REASON: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_METHODS_LIST: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_REASON: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_TERMS: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYT_ADVICE_IS_SENTBY_EDI: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PHYSICAL_INVENTORY_BLOCK_IND: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    RECONCILIATION_ACCOUNT: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    RECORD_PAYMENT_HISTORY_INDICATOR: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    USER_AT_CUSTOMER: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELETION_INDICATOR: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CASH_PLANNING_GROUP: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    KNOWN_OR_NEGOTIATED_LEAVE: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VALUE_ADJUSTMENT_KEY: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_ACCOUNT_GROUP: OrderableEdmTypeField<
      CustomerCompany<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCompanyText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_COMPANY_TEXT: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerCompanyTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerDunning} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_DUNNING: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerDunningApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toWithHoldingTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_WITH_HOLDING_TAX: Link<
      CustomerCompany<DeSerializersT>,
      DeSerializersT,
      CustomerWithHoldingTaxApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<CustomerCompany<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link customer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER: fieldBuilder.buildEdmTypeField(
          'Customer',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link companyCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPANY_CODE: fieldBuilder.buildEdmTypeField(
          'CompanyCode',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link aparToleranceGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        APAR_TOLERANCE_GROUP: fieldBuilder.buildEdmTypeField(
          'APARToleranceGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link accountByCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNT_BY_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'AccountByCustomer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link accountingClerk} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNTING_CLERK: fieldBuilder.buildEdmTypeField(
          'AccountingClerk',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link accountingClerkFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNTING_CLERK_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'AccountingClerkFaxNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link accountingClerkInternetAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNTING_CLERK_INTERNET_ADDRESS: fieldBuilder.buildEdmTypeField(
          'AccountingClerkInternetAddress',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link accountingClerkPhoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ACCOUNTING_CLERK_PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'AccountingClerkPhoneNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link alternativePayerAccount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ALTERNATIVE_PAYER_ACCOUNT: fieldBuilder.buildEdmTypeField(
          'AlternativePayerAccount',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link authorizationGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        AUTHORIZATION_GROUP: fieldBuilder.buildEdmTypeField(
          'AuthorizationGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link collectiveInvoiceVariant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COLLECTIVE_INVOICE_VARIANT: fieldBuilder.buildEdmTypeField(
          'CollectiveInvoiceVariant',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerAccountNote} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_ACCOUNT_NOTE: fieldBuilder.buildEdmTypeField(
          'CustomerAccountNote',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerHeadOffice} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_HEAD_OFFICE: fieldBuilder.buildEdmTypeField(
          'CustomerHeadOffice',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerSupplierClearingIsUsed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_SUPPLIER_CLEARING_IS_USED: fieldBuilder.buildEdmTypeField(
          'CustomerSupplierClearingIsUsed',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link houseBank} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HOUSE_BANK: fieldBuilder.buildEdmTypeField(
          'HouseBank',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link interestCalculationCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTEREST_CALCULATION_CODE: fieldBuilder.buildEdmTypeField(
          'InterestCalculationCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link interestCalculationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTEREST_CALCULATION_DATE: fieldBuilder.buildEdmTypeField(
          'InterestCalculationDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link intrstCalcFrequencyInMonths} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTRST_CALC_FREQUENCY_IN_MONTHS: fieldBuilder.buildEdmTypeField(
          'IntrstCalcFrequencyInMonths',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link isToBeLocallyProcessed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_TO_BE_LOCALLY_PROCESSED: fieldBuilder.buildEdmTypeField(
          'IsToBeLocallyProcessed',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link itemIsToBePaidSeparately} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_IS_TO_BE_PAID_SEPARATELY: fieldBuilder.buildEdmTypeField(
          'ItemIsToBePaidSeparately',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link layoutSortingRule} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAYOUT_SORTING_RULE: fieldBuilder.buildEdmTypeField(
          'LayoutSortingRule',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentBlockingReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_BLOCKING_REASON: fieldBuilder.buildEdmTypeField(
          'PaymentBlockingReason',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentMethodsList} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_METHODS_LIST: fieldBuilder.buildEdmTypeField(
          'PaymentMethodsList',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_REASON: fieldBuilder.buildEdmTypeField(
          'PaymentReason',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentTerms} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_TERMS: fieldBuilder.buildEdmTypeField(
          'PaymentTerms',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paytAdviceIsSentbyEdi} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYT_ADVICE_IS_SENTBY_EDI: fieldBuilder.buildEdmTypeField(
          'PaytAdviceIsSentbyEDI',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link physicalInventoryBlockInd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PHYSICAL_INVENTORY_BLOCK_IND: fieldBuilder.buildEdmTypeField(
          'PhysicalInventoryBlockInd',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link reconciliationAccount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECONCILIATION_ACCOUNT: fieldBuilder.buildEdmTypeField(
          'ReconciliationAccount',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link recordPaymentHistoryIndicator} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECORD_PAYMENT_HISTORY_INDICATOR: fieldBuilder.buildEdmTypeField(
          'RecordPaymentHistoryIndicator',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link userAtCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        USER_AT_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'UserAtCustomer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deletionIndicator} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELETION_INDICATOR: fieldBuilder.buildEdmTypeField(
          'DeletionIndicator',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link cashPlanningGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CASH_PLANNING_GROUP: fieldBuilder.buildEdmTypeField(
          'CashPlanningGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link knownOrNegotiatedLeave} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        KNOWN_OR_NEGOTIATED_LEAVE: fieldBuilder.buildEdmTypeField(
          'KnownOrNegotiatedLeave',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link valueAdjustmentKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALUE_ADJUSTMENT_KEY: fieldBuilder.buildEdmTypeField(
          'ValueAdjustmentKey',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerAccountGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_ACCOUNT_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerAccountGroup',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', CustomerCompany),
      };
    }

    return this._schema;
  }
}
