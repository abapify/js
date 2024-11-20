/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BuPaIndustry } from './BuPaIndustry';
import { BuPaIndustryRequestBuilder } from './BuPaIndustryRequestBuilder';
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
export class BuPaIndustryApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BuPaIndustry<DeSerializersT>, DeSerializersT>
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
  ): BuPaIndustryApi<DeSerializersT> {
    return new BuPaIndustryApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BuPaIndustry;

  requestBuilder(): BuPaIndustryRequestBuilder<DeSerializersT> {
    return new BuPaIndustryRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BuPaIndustry<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BuPaIndustry<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<BuPaIndustry<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof BuPaIndustry, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(BuPaIndustry, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    INDUSTRY_SECTOR: OrderableEdmTypeField<
      BuPaIndustry<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    INDUSTRY_SYSTEM_TYPE: OrderableEdmTypeField<
      BuPaIndustry<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BuPaIndustry<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    IS_STANDARD_INDUSTRY: OrderableEdmTypeField<
      BuPaIndustry<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY_KEY_DESCRIPTION: OrderableEdmTypeField<
      BuPaIndustry<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BuPaIndustry<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link industrySector} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_SECTOR: fieldBuilder.buildEdmTypeField(
          'IndustrySector',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link industrySystemType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_SYSTEM_TYPE: fieldBuilder.buildEdmTypeField(
          'IndustrySystemType',
          'Edm.String',
          false,
        ),
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
         * Static representation of the {@link isStandardIndustry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_STANDARD_INDUSTRY: fieldBuilder.buildEdmTypeField(
          'IsStandardIndustry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industryKeyDescription} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY_KEY_DESCRIPTION: fieldBuilder.buildEdmTypeField(
          'IndustryKeyDescription',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BuPaIndustry),
      };
    }

    return this._schema;
  }
}
