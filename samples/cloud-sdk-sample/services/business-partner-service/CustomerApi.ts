/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { Customer } from './Customer';
import { CustomerRequestBuilder } from './CustomerRequestBuilder';
import { CustAddrDepdntExtIdentifierApi } from './CustAddrDepdntExtIdentifierApi';
import { CustAddrDepdntInformationApi } from './CustAddrDepdntInformationApi';
import { CustomerCompanyApi } from './CustomerCompanyApi';
import { CustomerSalesAreaApi } from './CustomerSalesAreaApi';
import { CustomerTaxGroupingApi } from './CustomerTaxGroupingApi';
import { CustomerTextApi } from './CustomerTextApi';
import { CustomerUnloadingPointApi } from './CustomerUnloadingPointApi';
import { CustUnldgPtAddrDepdntInfoApi } from './CustUnldgPtAddrDepdntInfoApi';
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
export class CustomerApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<Customer<DeSerializersT>, DeSerializersT>
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
  ): CustomerApi<DeSerializersT> {
    return new CustomerApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toCustAddrDepdntExtIdentifier} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_ADDR_DEPDNT_EXT_IDENTIFIER: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustAddrDepdntExtIdentifierApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustAddrDepdntInformation} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_ADDR_DEPDNT_INFORMATION: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustAddrDepdntInformationApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerCompany} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_COMPANY: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerCompanyApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerSalesArea} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_SALES_AREA: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerTaxGrouping} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_TAX_GROUPING: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerTaxGroupingApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_TEXT: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerUnloadingPoint} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_UNLOADING_POINT: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerUnloadingPointApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustUnldgPtAddrDepdntInfo} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_UNLDG_PT_ADDR_DEPDNT_INFO: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustUnldgPtAddrDepdntInfoApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      CustAddrDepdntExtIdentifierApi<DeSerializersT>,
      CustAddrDepdntInformationApi<DeSerializersT>,
      CustomerCompanyApi<DeSerializersT>,
      CustomerSalesAreaApi<DeSerializersT>,
      CustomerTaxGroupingApi<DeSerializersT>,
      CustomerTextApi<DeSerializersT>,
      CustomerUnloadingPointApi<DeSerializersT>,
      CustUnldgPtAddrDepdntInfoApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_CUST_ADDR_DEPDNT_EXT_IDENTIFIER: new Link(
        'to_CustAddrDepdntExtIdentifier',
        this,
        linkedApis[0],
      ),
      TO_CUST_ADDR_DEPDNT_INFORMATION: new Link(
        'to_CustAddrDepdntInformation',
        this,
        linkedApis[1],
      ),
      TO_CUSTOMER_COMPANY: new Link('to_CustomerCompany', this, linkedApis[2]),
      TO_CUSTOMER_SALES_AREA: new Link(
        'to_CustomerSalesArea',
        this,
        linkedApis[3],
      ),
      TO_CUSTOMER_TAX_GROUPING: new Link(
        'to_CustomerTaxGrouping',
        this,
        linkedApis[4],
      ),
      TO_CUSTOMER_TEXT: new Link('to_CustomerText', this, linkedApis[5]),
      TO_CUSTOMER_UNLOADING_POINT: new Link(
        'to_CustomerUnloadingPoint',
        this,
        linkedApis[6],
      ),
      TO_CUST_UNLDG_PT_ADDR_DEPDNT_INFO: new Link(
        'to_CustUnldgPtAddrDepdntInfo',
        this,
        linkedApis[7],
      ),
    };
    return this;
  }

  entityConstructor = Customer;

  requestBuilder(): CustomerRequestBuilder<DeSerializersT> {
    return new CustomerRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<Customer<DeSerializersT>, DeSerializersT> {
    return entityBuilder<Customer<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<Customer<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof Customer, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(Customer, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BILLING_IS_BLOCKED_FOR_CUSTOMER: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATED_BY_USER: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATION_DATE: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CUSTOMER_ACCOUNT_GROUP: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_CLASSIFICATION: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_FULL_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CUSTOMER_FULL_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CUSTOMER_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_IS_BLOCKED: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_01: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_02: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_03: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_04: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_05: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_06: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_07: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_08: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_09: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FREE_DEFINED_ATTRIBUTE_10: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    NF_PARTNER_IS_NATURAL_PERSON: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ORDER_IS_BLOCKED_FOR_CUSTOMER: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    POSTING_IS_BLOCKED: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    SUPPLIER: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUSTOMER_CORPORATE_GROUP: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FISCAL_ADDRESS: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_CODE_1: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_CODE_2: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_CODE_3: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_CODE_4: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_CODE_5: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_1: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_2: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_3: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    NIELSEN_REGION: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_REASON: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    RESPONSIBLE_TYPE: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_1: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_2: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_3: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_4: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_5: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_TYPE: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VAT_REGISTRATION: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELETION_INDICATOR: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    EXPRESS_TRAIN_STATION_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TRAIN_STATION_NAME: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CITY_CODE: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COUNTY: OrderableEdmTypeField<
      Customer<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustAddrDepdntExtIdentifier} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_ADDR_DEPDNT_EXT_IDENTIFIER: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustAddrDepdntExtIdentifierApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustAddrDepdntInformation} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_ADDR_DEPDNT_INFORMATION: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustAddrDepdntInformationApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerCompany} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_COMPANY: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerCompanyApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerSalesArea} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_SALES_AREA: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerSalesAreaApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerTaxGrouping} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_TAX_GROUPING: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerTaxGroupingApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_TEXT: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerTextApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustomerUnloadingPoint} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUSTOMER_UNLOADING_POINT: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustomerUnloadingPointApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toCustUnldgPtAddrDepdntInfo} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CUST_UNLDG_PT_ADDR_DEPDNT_INFO: Link<
      Customer<DeSerializersT>,
      DeSerializersT,
      CustUnldgPtAddrDepdntInfoApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<Customer<DeSerializers>>;
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
         * Static representation of the {@link createdByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATED_BY_USER: fieldBuilder.buildEdmTypeField(
          'CreatedByUser',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link creationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_DATE: fieldBuilder.buildEdmTypeField(
          'CreationDate',
          'Edm.DateTime',
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
        /**
         * Static representation of the {@link customerClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'CustomerClassification',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerFullName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_FULL_NAME: fieldBuilder.buildEdmTypeField(
          'CustomerFullName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCustomerFullName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CUSTOMER_FULL_NAME: fieldBuilder.buildEdmTypeField(
          'BPCustomerFullName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_NAME: fieldBuilder.buildEdmTypeField(
          'CustomerName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCustomerName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CUSTOMER_NAME: fieldBuilder.buildEdmTypeField(
          'BPCustomerName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deliveryIsBlocked} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_IS_BLOCKED: fieldBuilder.buildEdmTypeField(
          'DeliveryIsBlocked',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute01} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_01: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute01',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute02} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_02: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute02',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute03} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_03: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute03',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute04} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_04: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute04',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute05} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_05: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute05',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute06} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_06: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute06',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute07} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_07: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute07',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute08} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_08: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute08',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute09} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_09: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute09',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link freeDefinedAttribute10} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FREE_DEFINED_ATTRIBUTE_10: fieldBuilder.buildEdmTypeField(
          'FreeDefinedAttribute10',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link nfPartnerIsNaturalPerson} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NF_PARTNER_IS_NATURAL_PERSON: fieldBuilder.buildEdmTypeField(
          'NFPartnerIsNaturalPerson',
          'Edm.String',
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
         * Static representation of the {@link postingIsBlocked} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        POSTING_IS_BLOCKED: fieldBuilder.buildEdmTypeField(
          'PostingIsBlocked',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link supplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER: fieldBuilder.buildEdmTypeField(
          'Supplier',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link customerCorporateGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_CORPORATE_GROUP: fieldBuilder.buildEdmTypeField(
          'CustomerCorporateGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link fiscalAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FISCAL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'FiscalAddress',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY: fieldBuilder.buildEdmTypeField(
          'Industry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryCode1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_CODE_1: fieldBuilder.buildEdmTypeField(
          'IndustryCode1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryCode2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_CODE_2: fieldBuilder.buildEdmTypeField(
          'IndustryCode2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryCode3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_CODE_3: fieldBuilder.buildEdmTypeField(
          'IndustryCode3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryCode4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_CODE_4: fieldBuilder.buildEdmTypeField(
          'IndustryCode4',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryCode5} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_CODE_5: fieldBuilder.buildEdmTypeField(
          'IndustryCode5',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_1: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_2: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_3: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link nielsenRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        NIELSEN_REGION: fieldBuilder.buildEdmTypeField(
          'NielsenRegion',
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
         * Static representation of the {@link responsibleType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RESPONSIBLE_TYPE: fieldBuilder.buildEdmTypeField(
          'ResponsibleType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_1: fieldBuilder.buildEdmTypeField(
          'TaxNumber1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_2: fieldBuilder.buildEdmTypeField(
          'TaxNumber2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_3: fieldBuilder.buildEdmTypeField(
          'TaxNumber3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_4: fieldBuilder.buildEdmTypeField(
          'TaxNumber4',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber5} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_5: fieldBuilder.buildEdmTypeField(
          'TaxNumber5',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumberType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_TYPE: fieldBuilder.buildEdmTypeField(
          'TaxNumberType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link vatRegistration} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAT_REGISTRATION: fieldBuilder.buildEdmTypeField(
          'VATRegistration',
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
         * Static representation of the {@link expressTrainStationName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXPRESS_TRAIN_STATION_NAME: fieldBuilder.buildEdmTypeField(
          'ExpressTrainStationName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link trainStationName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRAIN_STATION_NAME: fieldBuilder.buildEdmTypeField(
          'TrainStationName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link cityCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CITY_CODE: fieldBuilder.buildEdmTypeField(
          'CityCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link county} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTY: fieldBuilder.buildEdmTypeField('County', 'Edm.String', true),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', Customer),
      };
    }

    return this._schema;
  }
}
