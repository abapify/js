/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpDataController } from './BpDataController';
import { BpDataControllerRequestBuilder } from './BpDataControllerRequestBuilder';
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
export class BpDataControllerApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpDataController<DeSerializersT>, DeSerializersT>
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
  ): BpDataControllerApi<DeSerializersT> {
    return new BpDataControllerApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpDataController;

  requestBuilder(): BpDataControllerRequestBuilder<DeSerializersT> {
    return new BpDataControllerRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpDataController<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BpDataController<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<BpDataController<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof BpDataController, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpDataController,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DATA_CONTROLLER: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    PURPOSE_FOR_PERSONAL_DATA: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    DATA_CONTROL_ASSIGNMENT_STATUS: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_DATA_CONTROLLER_IS_DERIVED: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURPOSE_DERIVED: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PURPOSE_TYPE: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PURPOSE_FLAG: OrderableEdmTypeField<
      BpDataController<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpDataController<DeSerializers>>;
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
         * Static representation of the {@link dataController} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DATA_CONTROLLER: fieldBuilder.buildEdmTypeField(
          'DataController',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link purposeForPersonalData} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURPOSE_FOR_PERSONAL_DATA: fieldBuilder.buildEdmTypeField(
          'PurposeForPersonalData',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link dataControlAssignmentStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DATA_CONTROL_ASSIGNMENT_STATUS: fieldBuilder.buildEdmTypeField(
          'DataControlAssignmentStatus',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpDataControllerIsDerived} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_DATA_CONTROLLER_IS_DERIVED: fieldBuilder.buildEdmTypeField(
          'BPDataControllerIsDerived',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link purposeDerived} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURPOSE_DERIVED: fieldBuilder.buildEdmTypeField(
          'PurposeDerived',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link purposeType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURPOSE_TYPE: fieldBuilder.buildEdmTypeField(
          'PurposeType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPurposeFlag} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PURPOSE_FLAG: fieldBuilder.buildEdmTypeField(
          'BusinessPurposeFlag',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpDataController),
      };
    }

    return this._schema;
  }
}
