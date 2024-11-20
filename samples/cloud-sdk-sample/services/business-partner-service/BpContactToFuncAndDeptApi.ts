/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpContactToFuncAndDept } from './BpContactToFuncAndDept';
import { BpContactToFuncAndDeptRequestBuilder } from './BpContactToFuncAndDeptRequestBuilder';
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
export class BpContactToFuncAndDeptApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpContactToFuncAndDept<DeSerializersT>, DeSerializersT>
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
  ): BpContactToFuncAndDeptApi<DeSerializersT> {
    return new BpContactToFuncAndDeptApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpContactToFuncAndDept;

  requestBuilder(): BpContactToFuncAndDeptRequestBuilder<DeSerializersT> {
    return new BpContactToFuncAndDeptRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpContactToFuncAndDept<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BpContactToFuncAndDept<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BpContactToFuncAndDept<DeSerializersT>,
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
    typeof BpContactToFuncAndDept,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BpContactToFuncAndDept,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    RELATIONSHIP_NUMBER: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_COMPANY: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BUSINESS_PARTNER_PERSON: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    CONTACT_PERSON_AUTHORITY_TYPE: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_DEPARTMENT: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_DEPARTMENT_NAME: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_FUNCTION: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_FUNCTION_NAME: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_REMARK_TEXT: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CONTACT_PERSON_VIP_TYPE: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    EMAIL_ADDRESS: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_NUMBER: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FAX_NUMBER_EXTENSION: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PHONE_NUMBER: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PHONE_NUMBER_EXTENSION: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    RELATIONSHIP_CATEGORY: OrderableEdmTypeField<
      BpContactToFuncAndDept<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpContactToFuncAndDept<DeSerializers>>;
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
         * Static representation of the {@link contactPersonAuthorityType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_AUTHORITY_TYPE: fieldBuilder.buildEdmTypeField(
          'ContactPersonAuthorityType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonDepartment} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_DEPARTMENT: fieldBuilder.buildEdmTypeField(
          'ContactPersonDepartment',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonDepartmentName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_DEPARTMENT_NAME: fieldBuilder.buildEdmTypeField(
          'ContactPersonDepartmentName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonFunction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_FUNCTION: fieldBuilder.buildEdmTypeField(
          'ContactPersonFunction',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonFunctionName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_FUNCTION_NAME: fieldBuilder.buildEdmTypeField(
          'ContactPersonFunctionName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonRemarkText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_REMARK_TEXT: fieldBuilder.buildEdmTypeField(
          'ContactPersonRemarkText',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link contactPersonVipType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONTACT_PERSON_VIP_TYPE: fieldBuilder.buildEdmTypeField(
          'ContactPersonVIPType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link emailAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EMAIL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'EmailAddress',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link faxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'FaxNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link faxNumberExtension} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FAX_NUMBER_EXTENSION: fieldBuilder.buildEdmTypeField(
          'FaxNumberExtension',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link phoneNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PHONE_NUMBER: fieldBuilder.buildEdmTypeField(
          'PhoneNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link phoneNumberExtension} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PHONE_NUMBER_EXTENSION: fieldBuilder.buildEdmTypeField(
          'PhoneNumberExtension',
          'Edm.String',
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
        ALL_FIELDS: new AllFields('*', BpContactToFuncAndDept),
      };
    }

    return this._schema;
  }
}
