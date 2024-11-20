/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerWithHoldingTax } from './CustomerWithHoldingTax';
import { CustomerWithHoldingTaxRequestBuilder } from './CustomerWithHoldingTaxRequestBuilder';
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
export class CustomerWithHoldingTaxApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerWithHoldingTax<DeSerializersT>, DeSerializersT>
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
  ): CustomerWithHoldingTaxApi<DeSerializersT> {
    return new CustomerWithHoldingTaxApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = CustomerWithHoldingTax;

  requestBuilder(): CustomerWithHoldingTaxRequestBuilder<DeSerializersT> {
    return new CustomerWithHoldingTaxRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerWithHoldingTax<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      CustomerWithHoldingTax<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustomerWithHoldingTax<DeSerializersT>,
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
    typeof CustomerWithHoldingTax,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerWithHoldingTax,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    COMPANY_CODE: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    WITHHOLDING_TAX_TYPE: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    WITHHOLDING_TAX_CODE: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_AGENT: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    OBLIGATION_DATE_BEGIN: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    OBLIGATION_DATE_END: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    WITHHOLDING_TAX_NUMBER: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_CERTIFICATE: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    WITHHOLDING_TAX_EXMPT_PERCENT: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.Decimal',
      true,
      true
    >;
    EXEMPTION_DATE_BEGIN: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    EXEMPTION_DATE_END: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    EXEMPTION_REASON: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      CustomerWithHoldingTax<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<CustomerWithHoldingTax<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link customer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER: fieldBuilder.buildEdmTypeField(
          'Customer',
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
         * Static representation of the {@link withholdingTaxCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_CODE: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link withholdingTaxAgent} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_AGENT: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxAgent',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link obligationDateBegin} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OBLIGATION_DATE_BEGIN: fieldBuilder.buildEdmTypeField(
          'ObligationDateBegin',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link obligationDateEnd} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        OBLIGATION_DATE_END: fieldBuilder.buildEdmTypeField(
          'ObligationDateEnd',
          'Edm.DateTime',
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
         * Static representation of the {@link withholdingTaxCertificate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WITHHOLDING_TAX_CERTIFICATE: fieldBuilder.buildEdmTypeField(
          'WithholdingTaxCertificate',
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
        ALL_FIELDS: new AllFields('*', CustomerWithHoldingTax),
      };
    }

    return this._schema;
  }
}
