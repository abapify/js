/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { AddressFaxNumber } from './AddressFaxNumber';
import { AddressFaxNumberRequestBuilder } from './AddressFaxNumberRequestBuilder';
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
export class AddressFaxNumberApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<AddressFaxNumber<DeSerializersT>, DeSerializersT>
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
  ): AddressFaxNumberApi<DeSerializersT> {
    return new AddressFaxNumberApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = AddressFaxNumber;

  requestBuilder(): AddressFaxNumberRequestBuilder<DeSerializersT> {
    return new AddressFaxNumberRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    AddressFaxNumber<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<AddressFaxNumber<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<AddressFaxNumber<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof AddressFaxNumber, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        AddressFaxNumber,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    ADDRESS_ID: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PERSON: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDINAL_NUMBER: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    IS_DEFAULT_FAX_NUMBER: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    FAX_COUNTRY: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_NUMBER: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_NUMBER_EXTENSION: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_FAX_NUMBER: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_COMMUNICATION_REMARK_TEXT: OrderableEdmTypeField<
      AddressFaxNumber<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<AddressFaxNumber<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
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
         * Static representation of the {@link isDefaultFaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_DEFAULT_FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'IsDefaultFaxNumber',
          'Edm.Boolean',
          true,
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
         * Static representation of the {@link faxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'FaxNumber',
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
         * Static representation of the {@link addressCommunicationRemarkText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_COMMUNICATION_REMARK_TEXT: fieldBuilder.buildEdmTypeField(
          'AddressCommunicationRemarkText',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', AddressFaxNumber),
      };
    }

    return this._schema;
  }
}
