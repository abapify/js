/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustAddrDepdntInformation } from './CustAddrDepdntInformation';
import { CustAddrDepdntInformationRequestBuilder } from './CustAddrDepdntInformationRequestBuilder';
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
export class CustAddrDepdntInformationApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements
    EntityApi<CustAddrDepdntInformation<DeSerializersT>, DeSerializersT>
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
  ): CustAddrDepdntInformationApi<DeSerializersT> {
    return new CustAddrDepdntInformationApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = CustAddrDepdntInformation;

  requestBuilder(): CustAddrDepdntInformationRequestBuilder<DeSerializersT> {
    return new CustAddrDepdntInformationRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustAddrDepdntInformation<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      CustAddrDepdntInformation<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustAddrDepdntInformation<DeSerializersT>,
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
    typeof CustAddrDepdntInformation,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustAddrDepdntInformation,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDRESS_ID: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    EXPRESS_TRAIN_STATION_NAME: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TRAIN_STATION_NAME: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CITY_CODE: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COUNTY: OrderableEdmTypeField<
      CustAddrDepdntInformation<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<CustAddrDepdntInformation<DeSerializers>>;
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
         * Static representation of the {@link addressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'AddressID',
          'Edm.String',
          false,
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
        ALL_FIELDS: new AllFields('*', CustAddrDepdntInformation),
      };
    }

    return this._schema;
  }
}
