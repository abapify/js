/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BuPaIdentification } from './BuPaIdentification';
import { BuPaIdentificationRequestBuilder } from './BuPaIdentificationRequestBuilder';
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
export class BuPaIdentificationApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BuPaIdentification<DeSerializersT>, DeSerializersT>
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
  ): BuPaIdentificationApi<DeSerializersT> {
    return new BuPaIdentificationApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BuPaIdentification;

  requestBuilder(): BuPaIdentificationRequestBuilder<DeSerializersT> {
    return new BuPaIdentificationRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BuPaIdentification<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BuPaIdentification<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BuPaIdentification<DeSerializersT>,
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
    typeof BuPaIdentification,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BuPaIdentification,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_IDENTIFICATION_TYPE: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_IDENTIFICATION_NUMBER: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_IDN_NMBR_ISSUING_INSTITUTE: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_IDENTIFICATION_ENTRY_DATE: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    COUNTRY: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REGION: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      BuPaIdentification<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BuPaIdentification<DeSerializers>>;
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
         * Static representation of the {@link bpIdentificationType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IDENTIFICATION_TYPE: fieldBuilder.buildEdmTypeField(
          'BPIdentificationType',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpIdentificationNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IDENTIFICATION_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPIdentificationNumber',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link bpIdnNmbrIssuingInstitute} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IDN_NMBR_ISSUING_INSTITUTE: fieldBuilder.buildEdmTypeField(
          'BPIdnNmbrIssuingInstitute',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpIdentificationEntryDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_IDENTIFICATION_ENTRY_DATE: fieldBuilder.buildEdmTypeField(
          'BPIdentificationEntryDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link country} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTRY: fieldBuilder.buildEdmTypeField('Country', 'Edm.String', true),
        /**
         * Static representation of the {@link region} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REGION: fieldBuilder.buildEdmTypeField('Region', 'Edm.String', true),
        /**
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
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
        ALL_FIELDS: new AllFields('*', BuPaIdentification),
      };
    }

    return this._schema;
  }
}
