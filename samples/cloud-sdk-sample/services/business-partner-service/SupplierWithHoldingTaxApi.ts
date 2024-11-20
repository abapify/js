/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { SupplierWithHoldingTax } from './SupplierWithHoldingTax';
import { SupplierWithHoldingTaxRequestBuilder } from './SupplierWithHoldingTaxRequestBuilder';
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
export class SupplierWithHoldingTaxApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<SupplierWithHoldingTax<DeSerializersT>, DeSerializersT>
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
  ): SupplierWithHoldingTaxApi<DeSerializersT> {
    return new SupplierWithHoldingTaxApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = SupplierWithHoldingTax;

  requestBuilder(): SupplierWithHoldingTaxRequestBuilder<DeSerializersT> {
    return new SupplierWithHoldingTaxRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    SupplierWithHoldingTax<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      SupplierWithHoldingTax<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    SupplierWithHoldingTax<DeSerializersT>,
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
    typeof SupplierWithHoldingTax,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        SupplierWithHoldingTax,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SUPPLIER: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COMPANY_CODE: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    WITHHOLDING_TAX_TYPE: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    EXEMPTION_DATE_BEGIN: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    EXEMPTION_DATE_END: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    EXEMPTION_REASON: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_WITHHOLDING_TAX_SUBJECT: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    RECIPIENT_TYPE: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_CERTIFICATE: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_CODE: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_EXMPT_PERCENT: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    WITHHOLDING_TAX_NUMBER: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      SupplierWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<SupplierWithHoldingTax<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link supplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER: fieldBuilder.buildEdmTypeField(
          'Supplier',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link companyCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPANY_CODE: fieldBuilder.buildEdmTypeField(
          'CompanyCode',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link withholdingTaxType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_TYPE: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxType',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link exemptionDateBegin} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXEMPTION_DATE_BEGIN: fieldBuilder.buildEdmTypeField(
          'ExemptionDateBegin',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link exemptionDateEnd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXEMPTION_DATE_END: fieldBuilder.buildEdmTypeField(
          'ExemptionDateEnd',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link exemptionReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        EXEMPTION_REASON: fieldBuilder.buildEdmTypeField(
          'ExemptionReason',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link isWithholdingTaxSubject} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_WITHHOLDING_TAX_SUBJECT: fieldBuilder.buildEdmTypeField(
          'IsWithholdingTaxSubject',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link recipientType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RECIPIENT_TYPE: fieldBuilder.buildEdmTypeField(
          'RecipientType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link withholdingTaxCertificate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_CERTIFICATE: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxCertificate',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link withholdingTaxCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_CODE: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link withholdingTaxExmptPercent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_EXMPT_PERCENT: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxExmptPercent',
          'Edm.Decimal',
          true,
        ),
        /**
         * Static representation of the {@link withholdingTaxNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_NUMBER: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxNumber',
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
        ALL_FIELDS: new AllFields('*', SupplierWithHoldingTax),
      };
    }

    return this._schema;
  }
}
