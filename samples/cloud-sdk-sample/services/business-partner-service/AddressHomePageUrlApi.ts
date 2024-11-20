/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { AddressHomePageUrl } from './AddressHomePageUrl';
import { AddressHomePageUrlRequestBuilder } from './AddressHomePageUrlRequestBuilder';
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
export class AddressHomePageUrlApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<AddressHomePageUrl<DeSerializersT>, DeSerializersT>
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
  ): AddressHomePageUrlApi<DeSerializersT> {
    return new AddressHomePageUrlApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = AddressHomePageUrl;

  requestBuilder(): AddressHomePageUrlRequestBuilder<DeSerializersT> {
    return new AddressHomePageUrlRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    AddressHomePageUrl<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<AddressHomePageUrl<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    AddressHomePageUrl<DeSerializersT>,
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
    typeof AddressHomePageUrl,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        AddressHomePageUrl,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    ADDRESS_ID: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PERSON: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ORDINAL_NUMBER: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    IS_DEFAULT_URL_ADDRESS: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      false,
      true
    >;
    SEARCH_URL_ADDRESS: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_COMMUNICATION_REMARK_TEXT: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    URL_FIELD_LENGTH: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.Int16',
      true,
      true
    >;
    WEBSITE_URL: OrderableEdmTypeField<
      AddressHomePageUrl<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<AddressHomePageUrl<DeSerializers>>;
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
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
          'Edm.DateTime',
          false,
        ),
        /**
         * Static representation of the {@link isDefaultUrlAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_DEFAULT_URL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'IsDefaultURLAddress',
          'Edm.Boolean',
          false,
        ),
        /**
         * Static representation of the {@link searchUrlAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SEARCH_URL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'SearchURLAddress',
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
        /**
         * Static representation of the {@link urlFieldLength} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        URL_FIELD_LENGTH: fieldBuilder.buildEdmTypeField(
          'URLFieldLength',
          'Edm.Int16',
          true,
        ),
        /**
         * Static representation of the {@link websiteUrl} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WEBSITE_URL: fieldBuilder.buildEdmTypeField(
          'WebsiteURL',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', AddressHomePageUrl),
      };
    }

    return this._schema;
  }
}
