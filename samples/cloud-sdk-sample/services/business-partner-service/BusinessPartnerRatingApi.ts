/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerRating } from './BusinessPartnerRating';
import { BusinessPartnerRatingRequestBuilder } from './BusinessPartnerRatingRequestBuilder';
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
export class BusinessPartnerRatingApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerRating<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerRatingApi<DeSerializersT> {
    return new BusinessPartnerRatingApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusinessPartnerRating;

  requestBuilder(): BusinessPartnerRatingRequestBuilder<DeSerializersT> {
    return new BusinessPartnerRatingRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerRating<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BusinessPartnerRating<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerRating<DeSerializersT>,
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
    typeof BusinessPartnerRating,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerRating,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_RATING_PROCEDURE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_RATING_VALIDITY_END_DATE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    BUSINESS_PARTNER_RATING_GRADE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_RATING_TREND: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_RATING_VALIDITY_START_DATE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_RATING_CREATION_DATE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BUSINESS_PARTNER_RATING_COMMENT: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_RATING_IS_ALLOWED: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_RATING_IS_VALID_ON_KEY_DATE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BUSINESS_PARTNER_RATING_KEY_DATE: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BUSINESS_PARTNER_RATING_IS_EXPIRED: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_RATING_LONG_COMMENT: OrderableEdmTypeField<
      BusinessPartnerRating<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusinessPartnerRating<DeSerializers>>;
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
         * Static representation of the {@link businessPartnerRatingProcedure} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_PROCEDURE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingProcedure',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpRatingValidityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RATING_VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'BPRatingValidityEndDate',
          'Edm.DateTime',
          false,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingGrade} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_GRADE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingGrade',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingTrend} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_TREND: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingTrend',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpRatingValidityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RATING_VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'BPRatingValidityStartDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpRatingCreationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RATING_CREATION_DATE: fieldBuilder.buildEdmTypeField(
          'BPRatingCreationDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingComment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_COMMENT: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingComment',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingIsAllowed} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_IS_ALLOWED: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingIsAllowed',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpRatingIsValidOnKeyDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RATING_IS_VALID_ON_KEY_DATE: fieldBuilder.buildEdmTypeField(
          'BPRatingIsValidOnKeyDate',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingKeyDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_KEY_DATE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingKeyDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerRatingIsExpired} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_RATING_IS_EXPIRED: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerRatingIsExpired',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpRatingLongComment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RATING_LONG_COMMENT: fieldBuilder.buildEdmTypeField(
          'BPRatingLongComment',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerRating),
      };
    }

    return this._schema;
  }
}
