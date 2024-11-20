/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerSalesAreaTax } from './CustomerSalesAreaTax';
import { CustomerSalesAreaTaxRequestBuilder } from './CustomerSalesAreaTaxRequestBuilder';
import { CustSlsAreaAddrDepdntTaxInfoApi } from './CustSlsAreaAddrDepdntTaxInfoApi';
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
export class CustomerSalesAreaTaxApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>
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
  ): CustomerSalesAreaTaxApi<DeSerializersT> {
    return new CustomerSalesAreaTaxApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toSlsAreaAddrDepdntTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SLS_AREA_ADDR_DEPDNT_TAX: Link<
      CustomerSalesAreaTax<DeSerializersT>,
      DeSerializersT,
      CustSlsAreaAddrDepdntTaxInfoApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [CustSlsAreaAddrDepdntTaxInfoApi<DeSerializersT>],
  ): this {
    this.navigationPropertyFields = {
      TO_SLS_AREA_ADDR_DEPDNT_TAX: new Link(
        'to_SlsAreaAddrDepdntTax',
        this,
        linkedApis[0],
      ),
    };
    return this;
  }

  entityConstructor = CustomerSalesAreaTax;

  requestBuilder(): CustomerSalesAreaTaxRequestBuilder<DeSerializersT> {
    return new CustomerSalesAreaTaxRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerSalesAreaTax<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<CustomerSalesAreaTax<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustomerSalesAreaTax<DeSerializersT>,
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
    typeof CustomerSalesAreaTax,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerSalesAreaTax,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORGANIZATION: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DISTRIBUTION_CHANNEL: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DIVISION: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DEPARTURE_COUNTRY: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_TAX_CATEGORY: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_TAX_CLASSIFICATION: OrderableEdmTypeField<
      CustomerSalesAreaTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSlsAreaAddrDepdntTax} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SLS_AREA_ADDR_DEPDNT_TAX: Link<
      CustomerSalesAreaTax<DeSerializersT>,
      DeSerializersT,
      CustSlsAreaAddrDepdntTaxInfoApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<CustomerSalesAreaTax<DeSerializers>>;
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
         * Static representation of the {@link departureCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DEPARTURE_COUNTRY: fieldBuilder.buildEdmTypeField(
          'DepartureCountry',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link customerTaxCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_TAX_CATEGORY: fieldBuilder.buildEdmTypeField(
          'CustomerTaxCategory',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link customerTaxClassification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_TAX_CLASSIFICATION: fieldBuilder.buildEdmTypeField(
          'CustomerTaxClassification',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', CustomerSalesAreaTax),
      };
    }

    return this._schema;
  }
}
