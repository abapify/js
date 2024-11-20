/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerSalesArea } from './CustomerSalesArea';
import { CustomerSalesAreaRequestBuilder } from './CustomerSalesAreaRequestBuilder';
import { CustSalesPartnerFuncApi } from './CustSalesPartnerFuncApi';
import { CustomerSalesAreaTaxApi } from './CustomerSalesAreaTaxApi';
import { CustomerSalesAreaTextApi } from './CustomerSalesAreaTextApi';
import { CustSlsAreaAddrDepdntInfoApi } from './CustSlsAreaAddrDepdntInfoApi';
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
export class CustomerSalesAreaApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerSalesArea<DeSerializersT>, DeSerializersT>
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
  ): CustomerSalesAreaApi<DeSerializersT> {
    return new CustomerSalesAreaApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toPartnerFunction} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PARTNER_FUNCTION: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustSalesPartnerFuncApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSalesAreaTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SALES_AREA_TAX: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaTaxApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSalesAreaText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SALES_AREA_TEXT: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSlsAreaAddrDepdntInfo} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SLS_AREA_ADDR_DEPDNT_INFO: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustSlsAreaAddrDepdntInfoApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      CustSalesPartnerFuncApi<DeSerializersT>,
      CustomerSalesAreaTaxApi<DeSerializersT>,
      CustomerSalesAreaTextApi<DeSerializersT>,
      CustSlsAreaAddrDepdntInfoApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_PARTNER_FUNCTION: new Link('to_PartnerFunction', this, linkedApis[0]),
      TO_SALES_AREA_TAX: new Link('to_SalesAreaTax', this, linkedApis[1]),
      TO_SALES_AREA_TEXT: new Link('to_SalesAreaText', this, linkedApis[2]),
      TO_SLS_AREA_ADDR_DEPDNT_INFO: new Link(
        'to_SlsAreaAddrDepdntInfo',
        this,
        linkedApis[3],
      ),
    };
    return this;
  }

  entityConstructor = CustomerSalesArea;

  requestBuilder(): CustomerSalesAreaRequestBuilder<DeSerializersT> {
    return new CustomerSalesAreaRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerSalesArea<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<CustomerSalesArea<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<CustomerSalesArea<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof CustomerSalesArea,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerSalesArea,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORGANIZATION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DISTRIBUTION_CHANNEL: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DIVISION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ACCOUNT_BY_CUSTOMER: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BILLING_IS_BLOCKED_FOR_CUSTOMER: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COMPLETE_DELIVERY_IS_DEFINED: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CREDIT_CONTROL_AREA: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CURRENCY: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUST_IS_RLVT_FOR_SETTLMT_MGMT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CUSTOMER_ABC_CLASSIFICATION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_ACCOUNT_ASSIGNMENT_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_IS_REBATE_RELEVANT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CUSTOMER_PAYMENT_TERMS: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_PRICE_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_PRICING_PROCEDURE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUST_PROD_PROPOSAL_PROCEDURE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_IS_BLOCKED_FOR_CUSTOMER: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_PRIORITY: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_CLASSIFICATION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_2: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_VERSION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_LOCATION_1: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INCOTERMS_SUP_CHN_LOC_1_ADDL_UUID: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Guid',
      true,
      true
    >;
    INCOTERMS_SUP_CHN_LOC_2_ADDL_UUID: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Guid',
      true,
      true
    >;
    INCOTERMS_SUP_CHN_DVTG_LOC_ADDL_UUID: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Guid',
      true,
      true
    >;
    DELETION_INDICATOR: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    INCOTERMS_TRANSFER_LOCATION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INSP_SBST_HAS_NO_TIME_OR_QUANTITY: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    INVOICE_DATE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ITEM_ORDER_PROBABILITY_IN_PERCENT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MANUAL_INVOICE_MAINT_IS_RELEVANT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    MAX_NMBR_OF_PARTIAL_DELIVERY: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    ORDER_COMBINATION_IS_ALLOWED: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    ORDER_IS_BLOCKED_FOR_CUSTOMER: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    OVERDELIV_TOLRTD_LMT_RATIO_IN_PCT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    PARTIAL_DELIVERY_IS_ALLOWED: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRICE_LIST_TYPE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRODUCT_UNIT_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PROOF_OF_DELIVERY_TIME_VALUE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    SALES_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_ITEM_PROPOSAL: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_OFFICE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SHIPPING_CONDITION: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SLS_DOC_IS_RLVT_FOR_PROOF_OF_DELIV: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    SLS_UNLMTD_OVRDELIV_IS_ALLWD: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    SUPPLYING_PLANT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SALES_DISTRICT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    UNDERDELIV_TOLRTD_LMT_RATIO_IN_PCT: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    INVOICE_LIST_SCHEDULE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EXCHANGE_RATE_TYPE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_1: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_2: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_3: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_4: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_CUSTOMER_GROUP_5: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_GUARANTEE_PROCEDURE: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_ACCOUNT_GROUP: OrderableEdmTypeField<
      CustomerSalesArea<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPartnerFunction} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PARTNER_FUNCTION: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustSalesPartnerFuncApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSalesAreaTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SALES_AREA_TAX: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaTaxApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSalesAreaText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SALES_AREA_TEXT: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSlsAreaAddrDepdntInfo} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SLS_AREA_ADDR_DEPDNT_INFO: Link<
      CustomerSalesArea<DeSerializersT>,
      DeSerializersT,
      CustSlsAreaAddrDepdntInfoApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<CustomerSalesArea<DeSerializers>>;
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
         * Static representation of the {@link salesOrganization} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ORGANIZATION: fieldBuilder.buildEdmTypeField(
          'SalesOrganization',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link distributionChannel} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DISTRIBUTION_CHANNEL: fieldBuilder.buildEdmTypeField(
          'DistributionChannel',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link division} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DIVISION: fieldBuilder.buildEdmTypeField(
          'Division',
          'Edm.String',
          false,
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
         * Static representation of the {@link authorizationGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        AUTHORIZATION_GROUP: fieldBuilder.buildEdmTypeField(
          'AuthorizationGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link billingIsBlockedForCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BILLING_IS_BLOCKED_FOR_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'BillingIsBlockedForCustomer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link completeDeliveryIsDefined} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPLETE_DELIVERY_IS_DEFINED: fieldBuilder.buildEdmTypeField(
          'CompleteDeliveryIsDefined',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link creditControlArea} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREDIT_CONTROL_AREA: fieldBuilder.buildEdmTypeField(
          'CreditControlArea',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link currency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CURRENCY: fieldBuilder.buildEdmTypeField(
          'Currency',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link custIsRlvtForSettlmtMgmt} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_IS_RLVT_FOR_SETTLMT_MGMT: fieldBuilder.buildEdmTypeField(
          'CustIsRlvtForSettlmtMgmt',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link customerAbcClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_ABC_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'CustomerABCClassification',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerAccountAssignmentGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_ACCOUNT_ASSIGNMENT_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerAccountAssignmentGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerIsRebateRelevant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_IS_REBATE_RELEVANT: fieldBuilder.buildEdmTypeField(
          'CustomerIsRebateRelevant',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link customerPaymentTerms} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PAYMENT_TERMS: fieldBuilder.buildEdmTypeField(
          'CustomerPaymentTerms',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerPriceGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PRICE_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerPriceGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerPricingProcedure} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_PRICING_PROCEDURE: fieldBuilder.buildEdmTypeField(
          'CustomerPricingProcedure',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link custProdProposalProcedure} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_PROD_PROPOSAL_PROCEDURE: fieldBuilder.buildEdmTypeField(
          'CustProdProposalProcedure',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deliveryIsBlockedForCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_IS_BLOCKED_FOR_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'DeliveryIsBlockedForCustomer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deliveryPriority} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_PRIORITY: fieldBuilder.buildEdmTypeField(
          'DeliveryPriority',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link incotermsClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'IncotermsClassification',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link incotermsLocation2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_2: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link incotermsVersion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_VERSION: fieldBuilder.buildEdmTypeField(
          'IncotermsVersion',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link incotermsLocation1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_LOCATION_1: fieldBuilder.buildEdmTypeField(
          'IncotermsLocation1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link incotermsSupChnLoc1AddlUuid} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_SUP_CHN_LOC_1_ADDL_UUID: fieldBuilder.buildEdmTypeField(
          'IncotermsSupChnLoc1AddlUUID',
          'Edm.Guid',
          true,
        ),
        /**
         * Static representation of the {@link incotermsSupChnLoc2AddlUuid} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_SUP_CHN_LOC_2_ADDL_UUID: fieldBuilder.buildEdmTypeField(
          'IncotermsSupChnLoc2AddlUUID',
          'Edm.Guid',
          true,
        ),
        /**
         * Static representation of the {@link incotermsSupChnDvtgLocAddlUuid} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_SUP_CHN_DVTG_LOC_ADDL_UUID: fieldBuilder.buildEdmTypeField(
          'IncotermsSupChnDvtgLocAddlUUID',
          'Edm.Guid',
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
         * Static representation of the {@link incotermsTransferLocation} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INCOTERMS_TRANSFER_LOCATION: fieldBuilder.buildEdmTypeField(
          'IncotermsTransferLocation',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link inspSbstHasNoTimeOrQuantity} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INSP_SBST_HAS_NO_TIME_OR_QUANTITY: fieldBuilder.buildEdmTypeField(
          'InspSbstHasNoTimeOrQuantity',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link invoiceDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INVOICE_DATE: fieldBuilder.buildEdmTypeField(
          'InvoiceDate',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link itemOrderProbabilityInPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ITEM_ORDER_PROBABILITY_IN_PERCENT: fieldBuilder.buildEdmTypeField(
          'ItemOrderProbabilityInPercent',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link manualInvoiceMaintIsRelevant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MANUAL_INVOICE_MAINT_IS_RELEVANT: fieldBuilder.buildEdmTypeField(
          'ManualInvoiceMaintIsRelevant',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link maxNmbrOfPartialDelivery} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MAX_NMBR_OF_PARTIAL_DELIVERY: fieldBuilder.buildEdmTypeField(
          'MaxNmbrOfPartialDelivery',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link orderCombinationIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_COMBINATION_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'OrderCombinationIsAllowed',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link orderIsBlockedForCustomer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDER_IS_BLOCKED_FOR_CUSTOMER: fieldBuilder.buildEdmTypeField(
          'OrderIsBlockedForCustomer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link overdelivTolrtdLmtRatioInPct} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OVERDELIV_TOLRTD_LMT_RATIO_IN_PCT: fieldBuilder.buildEdmTypeField(
          'OverdelivTolrtdLmtRatioInPct',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link partialDeliveryIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PARTIAL_DELIVERY_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'PartialDeliveryIsAllowed',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link priceListType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRICE_LIST_TYPE: fieldBuilder.buildEdmTypeField(
          'PriceListType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link productUnitGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRODUCT_UNIT_GROUP: fieldBuilder.buildEdmTypeField(
          'ProductUnitGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link proofOfDeliveryTimeValue} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PROOF_OF_DELIVERY_TIME_VALUE: fieldBuilder.buildEdmTypeField(
          'ProofOfDeliveryTimeValue',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link salesGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_GROUP: fieldBuilder.buildEdmTypeField(
          'SalesGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link salesItemProposal} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_ITEM_PROPOSAL: fieldBuilder.buildEdmTypeField(
          'SalesItemProposal',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link salesOffice} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_OFFICE: fieldBuilder.buildEdmTypeField(
          'SalesOffice',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link shippingCondition} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SHIPPING_CONDITION: fieldBuilder.buildEdmTypeField(
          'ShippingCondition',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link slsDocIsRlvtForProofOfDeliv} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SLS_DOC_IS_RLVT_FOR_PROOF_OF_DELIV: fieldBuilder.buildEdmTypeField(
          'SlsDocIsRlvtForProofOfDeliv',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link slsUnlmtdOvrdelivIsAllwd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SLS_UNLMTD_OVRDELIV_IS_ALLWD: fieldBuilder.buildEdmTypeField(
          'SlsUnlmtdOvrdelivIsAllwd',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link supplyingPlant} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLYING_PLANT: fieldBuilder.buildEdmTypeField(
          'SupplyingPlant',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link salesDistrict} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SALES_DISTRICT: fieldBuilder.buildEdmTypeField(
          'SalesDistrict',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link underdelivTolrtdLmtRatioInPct} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNDERDELIV_TOLRTD_LMT_RATIO_IN_PCT: fieldBuilder.buildEdmTypeField(
          'UnderdelivTolrtdLmtRatioInPct',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link invoiceListSchedule} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INVOICE_LIST_SCHEDULE: fieldBuilder.buildEdmTypeField(
          'InvoiceListSchedule',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link exchangeRateType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXCHANGE_RATE_TYPE: fieldBuilder.buildEdmTypeField(
          'ExchangeRateType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_1: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_2: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_3: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_4: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup4',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalCustomerGroup5} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_CUSTOMER_GROUP_5: fieldBuilder.buildEdmTypeField(
          'AdditionalCustomerGroup5',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentGuaranteeProcedure} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_GUARANTEE_PROCEDURE: fieldBuilder.buildEdmTypeField(
          'PaymentGuaranteeProcedure',
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
        ALL_FIELDS: new AllFields('*', CustomerSalesArea),
      };
    }

    return this._schema;
  }
}
