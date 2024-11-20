/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { Supplier } from './Supplier';
import { SupplierRequestBuilder } from './SupplierRequestBuilder';
import { SupplierCompanyApi } from './SupplierCompanyApi';
import { SupplierPurchasingOrgApi } from './SupplierPurchasingOrgApi';
import { SupplierTextApi } from './SupplierTextApi';
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
} from '@sap-cloud-sdk/odata-v2';
export class SupplierApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<Supplier<DeSerializersT>, DeSerializersT>
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
  ): SupplierApi<DeSerializersT> {
    return new SupplierApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierCompany} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_COMPANY: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierCompanyApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierPurchasingOrg} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_PURCHASING_ORG: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierPurchasingOrgApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_TEXT: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierTextApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      SupplierCompanyApi<DeSerializersT>,
      SupplierPurchasingOrgApi<DeSerializersT>,
      SupplierTextApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_SUPPLIER_COMPANY: new Link('to_SupplierCompany', this, linkedApis[0]),
      TO_SUPPLIER_PURCHASING_ORG: new Link(
        'to_SupplierPurchasingOrg',
        this,
        linkedApis[1],
      ),
      TO_SUPPLIER_TEXT: new Link('to_SupplierText', this, linkedApis[2]),
    };
    return this;
  }

  entityConstructor = Supplier;

  requestBuilder(): SupplierRequestBuilder<DeSerializersT> {
    return new SupplierRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<Supplier<DeSerializersT>, DeSerializersT> {
    return entityBuilder<Supplier<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<Supplier<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof Supplier, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(Supplier, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    SUPPLIER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ALTERNATIVE_PAYEE_ACCOUNT_NUMBER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_PAN_NUMBER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATED_BY_USER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CREATION_DATE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CUSTOMER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_IS_BLOCKED_FOR_SUPPLIER: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    POSTING_IS_BLOCKED: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PURCHASING_IS_BLOCKED: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    SUPPLIER_ACCOUNT_GROUP: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_FULL_NAME: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_NAME: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    VAT_REGISTRATION: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BIRTH_DATE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    CONCATENATED_INTERNATIONAL_LOC_NO: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELETION_INDICATOR: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    FISCAL_ADDRESS: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INDUSTRY: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_1: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_2: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    INTERNATIONAL_LOCATION_NUMBER_3: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_NATURAL_PERSON: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PAYMENT_REASON: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    RESPONSIBLE_TYPE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPLR_QLTY_IN_PROCMT_CERTFN_VALID_TO: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    SUPLR_QUALITY_MANAGEMENT_SYSTEM: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_CORPORATE_GROUP: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPPLIER_PROCUREMENT_BLOCK: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_1: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_2: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_3: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_4: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_5: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_RESPONSIBLE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_NUMBER_TYPE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    SUPLR_PROOF_OF_DELIV_RLVT_CODE: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BR_TAX_IS_SPLIT: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    DATA_EXCHANGE_INSTRUCTION_KEY: OrderableEdmTypeField<
      Supplier<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierCompany} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_COMPANY: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierCompanyApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierPurchasingOrg} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_PURCHASING_ORG: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierPurchasingOrgApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toSupplierText} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_SUPPLIER_TEXT: Link<
      Supplier<DeSerializersT>,
      DeSerializersT,
      SupplierTextApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<Supplier<DeSerializers>>;
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
         * Static representation of the {@link alternativePayeeAccountNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ALTERNATIVE_PAYEE_ACCOUNT_NUMBER: fieldBuilder.buildEdmTypeField(
          'AlternativePayeeAccountNumber',
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
        /**
         * Static representation of the {@link businessPartnerPanNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_PAN_NUMBER: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerPanNumber',
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
         * Static representation of the {@link customer} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER: fieldBuilder.buildEdmTypeField(
          'Customer',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentIsBlockedForSupplier} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_IS_BLOCKED_FOR_SUPPLIER: fieldBuilder.buildEdmTypeField(
          'PaymentIsBlockedForSupplier',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link postingIsBlocked} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        POSTING_IS_BLOCKED: fieldBuilder.buildEdmTypeField(
          'PostingIsBlocked',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link purchasingIsBlocked} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PURCHASING_IS_BLOCKED: fieldBuilder.buildEdmTypeField(
          'PurchasingIsBlocked',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link supplierAccountGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_ACCOUNT_GROUP: fieldBuilder.buildEdmTypeField(
          'SupplierAccountGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link supplierFullName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_FULL_NAME: fieldBuilder.buildEdmTypeField(
          'SupplierFullName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link supplierName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_NAME: fieldBuilder.buildEdmTypeField(
          'SupplierName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link vatRegistration} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VAT_REGISTRATION: fieldBuilder.buildEdmTypeField(
          'VATRegistration',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link birthDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BIRTH_DATE: fieldBuilder.buildEdmTypeField(
          'BirthDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link concatenatedInternationalLocNo} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CONCATENATED_INTERNATIONAL_LOC_NO: fieldBuilder.buildEdmTypeField(
          'ConcatenatedInternationalLocNo',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deletionIndicator} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELETION_INDICATOR: fieldBuilder.buildEdmTypeField(
          'DeletionIndicator',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link fiscalAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FISCAL_ADDRESS: fieldBuilder.buildEdmTypeField(
          'FiscalAddress',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link industry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INDUSTRY: fieldBuilder.buildEdmTypeField(
          'Industry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_1: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_2: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link internationalLocationNumber3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        INTERNATIONAL_LOCATION_NUMBER_3: fieldBuilder.buildEdmTypeField(
          'InternationalLocationNumber3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link isNaturalPerson} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_NATURAL_PERSON: fieldBuilder.buildEdmTypeField(
          'IsNaturalPerson',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link paymentReason} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PAYMENT_REASON: fieldBuilder.buildEdmTypeField(
          'PaymentReason',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link responsibleType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        RESPONSIBLE_TYPE: fieldBuilder.buildEdmTypeField(
          'ResponsibleType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link suplrQltyInProcmtCertfnValidTo} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPLR_QLTY_IN_PROCMT_CERTFN_VALID_TO: fieldBuilder.buildEdmTypeField(
          'SuplrQltyInProcmtCertfnValidTo',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link suplrQualityManagementSystem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPLR_QUALITY_MANAGEMENT_SYSTEM: fieldBuilder.buildEdmTypeField(
          'SuplrQualityManagementSystem',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link supplierCorporateGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_CORPORATE_GROUP: fieldBuilder.buildEdmTypeField(
          'SupplierCorporateGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link supplierProcurementBlock} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPPLIER_PROCUREMENT_BLOCK: fieldBuilder.buildEdmTypeField(
          'SupplierProcurementBlock',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber1} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_1: fieldBuilder.buildEdmTypeField(
          'TaxNumber1',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber2} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_2: fieldBuilder.buildEdmTypeField(
          'TaxNumber2',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber3} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_3: fieldBuilder.buildEdmTypeField(
          'TaxNumber3',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber4} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_4: fieldBuilder.buildEdmTypeField(
          'TaxNumber4',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumber5} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_5: fieldBuilder.buildEdmTypeField(
          'TaxNumber5',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumberResponsible} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_RESPONSIBLE: fieldBuilder.buildEdmTypeField(
          'TaxNumberResponsible',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxNumberType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_NUMBER_TYPE: fieldBuilder.buildEdmTypeField(
          'TaxNumberType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link suplrProofOfDelivRlvtCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUPLR_PROOF_OF_DELIV_RLVT_CODE: fieldBuilder.buildEdmTypeField(
          'SuplrProofOfDelivRlvtCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link brTaxIsSplit} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BR_TAX_IS_SPLIT: fieldBuilder.buildEdmTypeField(
          'BR_TaxIsSplit',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link dataExchangeInstructionKey} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DATA_EXCHANGE_INSTRUCTION_KEY: fieldBuilder.buildEdmTypeField(
          'DataExchangeInstructionKey',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', Supplier),
      };
    }

    return this._schema;
  }
}
