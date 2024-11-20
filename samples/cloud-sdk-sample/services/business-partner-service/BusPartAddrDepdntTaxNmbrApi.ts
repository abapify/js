/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusPartAddrDepdntTaxNmbr } from './BusPartAddrDepdntTaxNmbr';
import { BusPartAddrDepdntTaxNmbrRequestBuilder } from './BusPartAddrDepdntTaxNmbrRequestBuilder';
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
export class BusPartAddrDepdntTaxNmbrApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements
    EntityApi<BusPartAddrDepdntTaxNmbr<DeSerializersT>, DeSerializersT>
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
  ): BusPartAddrDepdntTaxNmbrApi<DeSerializersT> {
    return new BusPartAddrDepdntTaxNmbrApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusPartAddrDepdntTaxNmbr;

  requestBuilder(): BusPartAddrDepdntTaxNmbrRequestBuilder<DeSerializersT> {
    return new BusPartAddrDepdntTaxNmbrRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusPartAddrDepdntTaxNmbr<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BusPartAddrDepdntTaxNmbr<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusPartAddrDepdntTaxNmbr<DeSerializersT>,
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
    typeof BusPartAddrDepdntTaxNmbr,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusPartAddrDepdntTaxNmbr,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDRESS_ID: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_TAX_TYPE: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_TAX_NUMBER: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_TAX_LONG_NUMBER: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      BusPartAddrDepdntTaxNmbr<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusPartAddrDepdntTaxNmbr<DeSerializers>>;
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
         * Static representation of the {@link addressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'AddressID',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpTaxType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_TAX_TYPE: fieldBuilder.buildEdmTypeField(
          'BPTaxType',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpTaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_TAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPTaxNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpTaxLongNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_TAX_LONG_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPTaxLongNumber',
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
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusPartAddrDepdntTaxNmbr),
      };
    }

    return this._schema;
  }
}
