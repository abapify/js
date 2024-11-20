/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpAddressIndependentFax } from './BpAddressIndependentFax';
import { BpAddressIndependentFaxRequestBuilder } from './BpAddressIndependentFaxRequestBuilder';
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
export class BpAddressIndependentFaxApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpAddressIndependentFax<DeSerializersT>, DeSerializersT>
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
  ): BpAddressIndependentFaxApi<DeSerializersT> {
    return new BpAddressIndependentFaxApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpAddressIndependentFax;

  requestBuilder(): BpAddressIndependentFaxRequestBuilder<DeSerializersT> {
    return new BpAddressIndependentFaxRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpAddressIndependentFax<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BpAddressIndependentFax<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpAddressIndependentFax<DeSerializersT>,
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
    typeof BpAddressIndependentFax,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpAddressIndependentFax,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDRESS_ID: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PERSON: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDINAL_NUMBER: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    FAX_COUNTRY: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_AREA_CODE_SUBSCRIBER_NUMBER: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_NUMBER_EXTENSION: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_FAX_NUMBER: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_DEFAULT_FAX_NUMBER: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BpAddressIndependentFax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpAddressIndependentFax<DeSerializers>>;
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
         * Static representation of the {@link person} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PERSON: fieldBuilder.buildEdmTypeField('Person', 'Edm.String', false),
        /**
         * Static representation of the {@link ordinalNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ORDINAL_NUMBER: fieldBuilder.buildEdmTypeField(
          'OrdinalNumber',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link faxCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_COUNTRY: fieldBuilder.buildEdmTypeField(
          'FaxCountry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link faxAreaCodeSubscriberNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_AREA_CODE_SUBSCRIBER_NUMBER: fieldBuilder.buildEdmTypeField(
          'FaxAreaCodeSubscriberNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link faxNumberExtension} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_NUMBER_EXTENSION: fieldBuilder.buildEdmTypeField(
          'FaxNumberExtension',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'InternationalFaxNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link isDefaultFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_DEFAULT_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'IsDefaultFaxNumber',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link validityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityEndDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
          'Edm.DateTime',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpAddressIndependentFax),
      };
    }

    return this._schema;
  }
}
