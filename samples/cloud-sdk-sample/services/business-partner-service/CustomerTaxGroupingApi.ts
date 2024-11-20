/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerTaxGrouping } from './CustomerTaxGrouping';
import { CustomerTaxGroupingRequestBuilder } from './CustomerTaxGroupingRequestBuilder';
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
export class CustomerTaxGroupingApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>
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
  ): CustomerTaxGroupingApi<DeSerializersT> {
    return new CustomerTaxGroupingApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = CustomerTaxGrouping;

  requestBuilder(): CustomerTaxGroupingRequestBuilder<DeSerializersT> {
    return new CustomerTaxGroupingRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerTaxGrouping<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<CustomerTaxGrouping<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustomerTaxGrouping<DeSerializersT>,
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
    typeof CustomerTaxGrouping,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerTaxGrouping,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_TAX_GROUPING_CODE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUST_TAX_GRP_EXEMPTION_CERTIFICATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CUST_TAX_GROUP_EXEMPTION_RATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    CUST_TAX_GROUP_EXEMPTION_START_DATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CUST_TAX_GROUP_EXEMPTION_END_DATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CUST_TAX_GROUP_SUBJECTED_START_DATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CUST_TAX_GROUP_SUBJECTED_END_DATE: OrderableEdmTypeField<
      CustomerTaxGrouping<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    ALL_FIELDS: AllFields<CustomerTaxGrouping<DeSerializers>>;
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
         * Static representation of the {@link customerTaxGroupingCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_TAX_GROUPING_CODE: fieldBuilder.buildEdmTypeField(
          'CustomerTaxGroupingCode',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link custTaxGrpExemptionCertificate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GRP_EXEMPTION_CERTIFICATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGrpExemptionCertificate',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link custTaxGroupExemptionRate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GROUP_EXEMPTION_RATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGroupExemptionRate',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link custTaxGroupExemptionStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GROUP_EXEMPTION_START_DATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGroupExemptionStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link custTaxGroupExemptionEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GROUP_EXEMPTION_END_DATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGroupExemptionEndDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link custTaxGroupSubjectedStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GROUP_SUBJECTED_START_DATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGroupSubjectedStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link custTaxGroupSubjectedEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUST_TAX_GROUP_SUBJECTED_END_DATE: fieldBuilder.buildEdmTypeField(
          'CustTaxGroupSubjectedEndDate',
          'Edm.DateTime',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', CustomerTaxGrouping),
      };
    }

    return this._schema;
  }
}
