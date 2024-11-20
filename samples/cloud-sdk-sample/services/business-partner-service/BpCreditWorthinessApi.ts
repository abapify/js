/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpCreditWorthiness } from './BpCreditWorthiness';
import { BpCreditWorthinessRequestBuilder } from './BpCreditWorthinessRequestBuilder';
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
export class BpCreditWorthinessApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpCreditWorthiness<DeSerializersT>, DeSerializersT>
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
  ): BpCreditWorthinessApi<DeSerializersT> {
    return new BpCreditWorthinessApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpCreditWorthiness;

  requestBuilder(): BpCreditWorthinessRequestBuilder<DeSerializersT> {
    return new BpCreditWorthinessRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpCreditWorthiness<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BpCreditWorthiness<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpCreditWorthiness<DeSerializersT>,
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
    typeof BpCreditWorthiness,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpCreditWorthiness,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUS_PART_CREDIT_STANDING: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CREDIT_STANDING_STATUS: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREDIT_RATING_AGENCY: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CREDIT_STANDING_COMMENT: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_CREDIT_STANDING_DATE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_CREDIT_STANDING_RATING: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LEGAL_PROCEEDING_STATUS: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_LGL_PROCEEDING_INITIATION_DATE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BUSINESS_PARTNER_IS_UNDER_OATH: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BUSINESS_PARTNER_OATH_DATE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BUSINESS_PARTNER_IS_BANKRUPT: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BUSINESS_PARTNER_BANKRUPTCY_DATE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_FORECLOSURE_IS_INITIATED: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    BP_FORECLOSURE_DATE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_CRDT_WRTHNSS_ACCESS_CHK_IS_ACTIVE: OrderableEdmTypeField<
      BpCreditWorthiness<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpCreditWorthiness<DeSerializers>>;
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
         * Static representation of the {@link busPartCreditStanding} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUS_PART_CREDIT_STANDING: fieldBuilder.buildEdmTypeField(
          'BusPartCreditStanding',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_STATUS: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingStatus',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link creditRatingAgency} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREDIT_RATING_AGENCY: fieldBuilder.buildEdmTypeField(
          'CreditRatingAgency',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingComment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_COMMENT: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingComment',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_DATE: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpCreditStandingRating} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CREDIT_STANDING_RATING: fieldBuilder.buildEdmTypeField(
          'BPCreditStandingRating',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpLegalProceedingStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LEGAL_PROCEEDING_STATUS: fieldBuilder.buildEdmTypeField(
          'BPLegalProceedingStatus',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpLglProceedingInitiationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_LGL_PROCEEDING_INITIATION_DATE: fieldBuilder.buildEdmTypeField(
          'BPLglProceedingInitiationDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerIsUnderOath} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_IS_UNDER_OATH: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIsUnderOath',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerOathDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_OATH_DATE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerOathDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerIsBankrupt} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_IS_BANKRUPT: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerIsBankrupt',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerBankruptcyDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_BANKRUPTCY_DATE: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerBankruptcyDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpForeclosureIsInitiated} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FORECLOSURE_IS_INITIATED: fieldBuilder.buildEdmTypeField(
          'BPForeclosureIsInitiated',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link bpForeclosureDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_FORECLOSURE_DATE: fieldBuilder.buildEdmTypeField(
          'BPForeclosureDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpCrdtWrthnssAccessChkIsActive} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_CRDT_WRTHNSS_ACCESS_CHK_IS_ACTIVE: fieldBuilder.buildEdmTypeField(
          'BPCrdtWrthnssAccessChkIsActive',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpCreditWorthiness),
      };
    }

    return this._schema;
  }
}
