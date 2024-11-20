/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerContact } from './BusinessPartnerContact';
import { BusinessPartnerContactRequestBuilder } from './BusinessPartnerContactRequestBuilder';
import { BpContactToAddressApi } from './BpContactToAddressApi';
import { BpContactToFuncAndDeptApi } from './BpContactToFuncAndDeptApi';
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
  Link,
  OneToOneLink,
} from '@sap-cloud-sdk/odata-v2';
export class BusinessPartnerContactApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerContact<DeSerializersT>, DeSerializersT>
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
  ): BusinessPartnerContactApi<DeSerializersT> {
    return new BusinessPartnerContactApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toContactAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CONTACT_ADDRESS: Link<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT,
      BpContactToAddressApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link toContactRelationship} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CONTACT_RELATIONSHIP: OneToOneLink<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT,
      BpContactToFuncAndDeptApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      BpContactToAddressApi<DeSerializersT>,
      BpContactToFuncAndDeptApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_CONTACT_ADDRESS: new Link('to_ContactAddress', this, linkedApis[0]),
      TO_CONTACT_RELATIONSHIP: new OneToOneLink(
        'to_ContactRelationship',
        this,
        linkedApis[1],
      ),
    };
    return this;
  }

  entityConstructor = BusinessPartnerContact;

  requestBuilder(): BusinessPartnerContactRequestBuilder<DeSerializersT> {
    return new BusinessPartnerContactRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerContact<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerContact<DeSerializersT>,
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
    typeof BusinessPartnerContact,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerContact,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    RELATIONSHIP_NUMBER: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_COMPANY: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_PERSON: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    IS_STANDARD_RELATIONSHIP: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    RELATIONSHIP_CATEGORY: OrderableEdmTypeField<
      BusinessPartnerContact<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toContactAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CONTACT_ADDRESS: Link<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT,
      BpContactToAddressApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link toContactRelationship} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_CONTACT_RELATIONSHIP: OneToOneLink<
      BusinessPartnerContact<DeSerializersT>,
      DeSerializersT,
      BpContactToFuncAndDeptApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<BusinessPartnerContact<DeSerializers>>;
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
         * Static representation of the {@link businessPartnerCompany} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_COMPANY: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerCompany',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link businessPartnerPerson} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_PERSON: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerPerson',
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
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerContact),
      };
    }

    return this._schema;
  }
}
