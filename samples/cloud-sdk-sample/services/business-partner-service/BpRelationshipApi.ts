/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpRelationship } from './BpRelationship';
import { BpRelationshipRequestBuilder } from './BpRelationshipRequestBuilder';
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
  Time,
  OrderableEdmTypeField,
} from '@sap-cloud-sdk/odata-v2';
export class BpRelationshipApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpRelationship<DeSerializersT>, DeSerializersT>
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
  ): BpRelationshipApi<DeSerializersT> {
    return new BpRelationshipApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpRelationship;

  requestBuilder(): BpRelationshipRequestBuilder<DeSerializersT> {
    return new BpRelationshipRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpRelationship<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BpRelationship<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<BpRelationship<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof BpRelationship, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(BpRelationship, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    RELATIONSHIP_NUMBER: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_1: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_2: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    IS_STANDARD_RELATIONSHIP: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    RELATIONSHIP_CATEGORY: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_RELATIONSHIP_TYPE: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATED_BY_USER: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATION_DATE: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CREATION_TIME: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    LAST_CHANGED_BY_USER: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    LAST_CHANGE_DATE: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    LAST_CHANGE_TIME: OrderableEdmTypeField<
      BpRelationship<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpRelationship<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link relationshipNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RELATIONSHIP_NUMBER: fieldBuilder.buildEdmTypeField(
          'RelationshipNumber',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link businessPartner1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_1: fieldBuilder.buildEdmTypeField(
          'BusinessPartner1',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link businessPartner2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_2: fieldBuilder.buildEdmTypeField(
          'BusinessPartner2',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link validityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityEndDate',
          'Edm.DateTime',
          false,
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
        /**
         * Static representation of the {@link isStandardRelationship} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_STANDARD_RELATIONSHIP: fieldBuilder.buildEdmTypeField(
          'IsStandardRelationship',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link relationshipCategory} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RELATIONSHIP_CATEGORY: fieldBuilder.buildEdmTypeField(
          'RelationshipCategory',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpRelationshipType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_RELATIONSHIP_TYPE: fieldBuilder.buildEdmTypeField(
          'BPRelationshipType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link createdByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATED_BY_USER: fieldBuilder.buildEdmTypeField(
          'CreatedByUser',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link creationDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_DATE: fieldBuilder.buildEdmTypeField(
          'CreationDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link creationTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CREATION_TIME: fieldBuilder.buildEdmTypeField(
          'CreationTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link lastChangedByUser} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGED_BY_USER: fieldBuilder.buildEdmTypeField(
          'LastChangedByUser',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link lastChangeDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGE_DATE: fieldBuilder.buildEdmTypeField(
          'LastChangeDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link lastChangeTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LAST_CHANGE_TIME: fieldBuilder.buildEdmTypeField(
          'LastChangeTime',
          'Edm.Time',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpRelationship),
      };
    }

    return this._schema;
  }
}
