/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerAlias } from './BusinessPartnerAlias';
import { BusinessPartnerAliasRequestBuilder } from './BusinessPartnerAliasRequestBuilder';
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
export class BusinessPartnerAliasApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerAliasApi<DeSerializersT> {
    return new BusinessPartnerAliasApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BusinessPartnerAlias;

  requestBuilder(): BusinessPartnerAliasRequestBuilder<DeSerializersT> {
    return new BusinessPartnerAliasRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerAlias<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BusinessPartnerAlias<DeSerializersT>, DeSerializersT>(
      this,
    );
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerAlias<DeSerializersT>,
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
    typeof BusinessPartnerAlias,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerAlias,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerAlias<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_ALIAS_POSITION_NUMBER: OrderableEdmTypeField<
      BusinessPartnerAlias<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_ALIAS_NAME: OrderableEdmTypeField<
      BusinessPartnerAlias<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BusinessPartnerAlias<DeSerializers>>;
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
         * Static representation of the {@link bpAliasPositionNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_ALIAS_POSITION_NUMBER: fieldBuilder.buildEdmTypeField(
          'BPAliasPositionNumber',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link businessPartnerAliasName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_ALIAS_NAME: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerAliasName',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerAlias),
      };
    }

    return this._schema;
  }
}
