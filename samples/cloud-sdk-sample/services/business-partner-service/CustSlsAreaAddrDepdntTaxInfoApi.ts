/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustSlsAreaAddrDepdntTaxInfo } from './CustSlsAreaAddrDepdntTaxInfo';
import { CustSlsAreaAddrDepdntTaxInfoRequestBuilder } from './CustSlsAreaAddrDepdntTaxInfoRequestBuilder';
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
export class CustSlsAreaAddrDepdntTaxInfoApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements
    EntityApi<CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>, DeSerializersT>
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
  ): CustSlsAreaAddrDepdntTaxInfoApi<DeSerializersT> {
    return new CustSlsAreaAddrDepdntTaxInfoApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = CustSlsAreaAddrDepdntTaxInfo;

  requestBuilder(): CustSlsAreaAddrDepdntTaxInfoRequestBuilder<DeSerializersT> {
    return new CustSlsAreaAddrDepdntTaxInfoRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustSlsAreaAddrDepdntTaxInfo<DeSerializersT>,
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
    typeof CustSlsAreaAddrDepdntTaxInfo,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustSlsAreaAddrDepdntTaxInfo,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    SALES_ORGANIZATION: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DISTRIBUTION_CHANNEL: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DIVISION: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDRESS_ID: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DEPARTURE_COUNTRY: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_TAX_CATEGORY: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_TAX_CLASSIFICATION: OrderableEdmTypeField<
      CustSlsAreaAddrDepdntTaxInfo<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<CustSlsAreaAddrDepdntTaxInfo<DeSerializers>>;
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
         * Static representation of the {@link addressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'AddressID',
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
        ALL_FIELDS: new AllFields('*', CustSlsAreaAddrDepdntTaxInfo),
      };
    }

    return this._schema;
  }
}
