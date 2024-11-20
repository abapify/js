/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerBank } from './BusinessPartnerBank';
import { BusinessPartnerBankRequestBuilder } from './BusinessPartnerBankRequestBuilder';
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
export class BusinessPartnerBankApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerBank<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerBankApi<DeSerializersT> {
    return new BusinessPartnerBankApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusinessPartnerBank;

  requestBuilder(): BusinessPartnerBankRequestBuilder<DeSerializersT> {
    return new BusinessPartnerBankRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerBank<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BusinessPartnerBank<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerBank<DeSerializersT>,
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
    typeof BusinessPartnerBank,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerBank,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BANK_IDENTIFICATION: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BANK_COUNTRY_KEY: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_NAME: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_NUMBER: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SWIFT_CODE: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_CONTROL_KEY: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_ACCOUNT_HOLDER_NAME: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_ACCOUNT_NAME: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    IBAN: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IBAN_VALIDITY_START_DATE: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BANK_ACCOUNT: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BANK_ACCOUNT_REFERENCE_TEXT: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COLLECTION_AUTH_IND: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CITY_NAME: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      BusinessPartnerBank<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusinessPartnerBank<DeSerializers>>;
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
         * Static representation of the {@link bankIdentification} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_IDENTIFICATION: fieldBuilder.buildEdmTypeField(
          'BankIdentification',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bankCountryKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_COUNTRY_KEY: fieldBuilder.buildEdmTypeField(
          'BankCountryKey',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_NAME: fieldBuilder.buildEdmTypeField(
          'BankName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_NUMBER: fieldBuilder.buildEdmTypeField(
          'BankNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link swiftCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SWIFT_CODE: fieldBuilder.buildEdmTypeField(
          'SWIFTCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankControlKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_CONTROL_KEY: fieldBuilder.buildEdmTypeField(
          'BankControlKey',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankAccountHolderName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_ACCOUNT_HOLDER_NAME: fieldBuilder.buildEdmTypeField(
          'BankAccountHolderName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankAccountName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_ACCOUNT_NAME: fieldBuilder.buildEdmTypeField(
          'BankAccountName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
          'Edm.DateTimeOffset',
          true,
        ),
        /**
         * Static representation of the {@link validityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityEndDate',
          'Edm.DateTimeOffset',
          true,
        ),
        /**
         * Static representation of the {@link iban} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IBAN: fieldBuilder.buildEdmTypeField('IBAN', 'Edm.String', true),
        /**
         * Static representation of the {@link ibanValidityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IBAN_VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'IBANValidityStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bankAccount} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_ACCOUNT: fieldBuilder.buildEdmTypeField(
          'BankAccount',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bankAccountReferenceText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BANK_ACCOUNT_REFERENCE_TEXT: fieldBuilder.buildEdmTypeField(
          'BankAccountReferenceText',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link collectionAuthInd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COLLECTION_AUTH_IND: fieldBuilder.buildEdmTypeField(
          'CollectionAuthInd',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link cityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CITY_NAME: fieldBuilder.buildEdmTypeField(
          'CityName',
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
        ALL_FIELDS: new AllFields('*', BusinessPartnerBank),
      };
    }

    return this._schema;
  }
}
