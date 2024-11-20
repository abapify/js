/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerIsBank } from './BusinessPartnerIsBank';
import { BusinessPartnerIsBankRequestBuilder } from './BusinessPartnerIsBankRequestBuilder';
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
export class BusinessPartnerIsBankApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerIsBankApi<DeSerializersT> {
    return new BusinessPartnerIsBankApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusinessPartnerIsBank;

  requestBuilder(): BusinessPartnerIsBankRequestBuilder<DeSerializersT> {
    return new BusinessPartnerIsBankRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerIsBank<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BusinessPartnerIsBank<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerIsBank<DeSerializersT>,
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
    typeof BusinessPartnerIsBank,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerIsBank,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerIsBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BANK_KEY: OrderableEdmTypeField<
      BusinessPartnerIsBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_COUNTRY: OrderableEdmTypeField<
      BusinessPartnerIsBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_MINIMUM_RESERVE: OrderableEdmTypeField<
      BusinessPartnerIsBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusinessPartnerIsBank<DeSerializers>>;
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
         * Static representation of the {@link bankKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_KEY: fieldBuilder.buildEdmTypeField('BankKey', 'Edm.String', true),
        /**
         * Static representation of the {@link bankCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_COUNTRY: fieldBuilder.buildEdmTypeField(
          'BankCountry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpMinimumReserve} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_MINIMUM_RESERVE: fieldBuilder.buildEdmTypeField(
          'BPMinimumReserve',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerIsBank),
      };
    }

    return this._schema;
  }
}
