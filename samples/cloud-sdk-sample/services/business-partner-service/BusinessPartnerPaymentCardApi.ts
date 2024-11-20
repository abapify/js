/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerPaymentCard } from './BusinessPartnerPaymentCard';
import { BusinessPartnerPaymentCardRequestBuilder } from './BusinessPartnerPaymentCardRequestBuilder';
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
export class BusinessPartnerPaymentCardApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements
    EntityApi<BusinessPartnerPaymentCard<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerPaymentCardApi<DeSerializersT> {
    return new BusinessPartnerPaymentCardApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusinessPartnerPaymentCard;

  requestBuilder(): BusinessPartnerPaymentCardRequestBuilder<DeSerializersT> {
    return new BusinessPartnerPaymentCardRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerPaymentCard<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BusinessPartnerPaymentCard<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerPaymentCard<DeSerializersT>,
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
    typeof BusinessPartnerPaymentCard,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerPaymentCard,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PAYMENT_CARD_ID: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PAYMENT_CARD_TYPE: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CARD_NUMBER: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    IS_STANDARD_CARD: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    CARD_DESCRIPTION: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VALIDITY_DATE: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CARD_HOLDER: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CARD_ISSUING_BANK: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CARD_ISSUE_DATE: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    PAYMENT_CARD_LOCK: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    MASKED_CARD_NUMBER: OrderableEdmTypeField<
      BusinessPartnerPaymentCard<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusinessPartnerPaymentCard<DeSerializers>>;
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
         * Static representation of the {@link paymentCardId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_CARD_ID: fieldBuilder.buildEdmTypeField(
          'PaymentCardID',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link paymentCardType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_CARD_TYPE: fieldBuilder.buildEdmTypeField(
          'PaymentCardType',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link cardNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARD_NUMBER: fieldBuilder.buildEdmTypeField(
          'CardNumber',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link isStandardCard} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_STANDARD_CARD: fieldBuilder.buildEdmTypeField(
          'IsStandardCard',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link cardDescription} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARD_DESCRIPTION: fieldBuilder.buildEdmTypeField(
          'CardDescription',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link validityDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityDate',
          'Edm.DateTime',
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
         * Static representation of the {@link cardHolder} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARD_HOLDER: fieldBuilder.buildEdmTypeField(
          'CardHolder',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link cardIssuingBank} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARD_ISSUING_BANK: fieldBuilder.buildEdmTypeField(
          'CardIssuingBank',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link cardIssueDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARD_ISSUE_DATE: fieldBuilder.buildEdmTypeField(
          'CardIssueDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link paymentCardLock} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_CARD_LOCK: fieldBuilder.buildEdmTypeField(
          'PaymentCardLock',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link maskedCardNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MASKED_CARD_NUMBER: fieldBuilder.buildEdmTypeField(
          'MaskedCardNumber',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerPaymentCard),
      };
    }

    return this._schema;
  }
}
