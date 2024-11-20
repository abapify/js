/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BpEmployment } from './BpEmployment';
import { BpEmploymentRequestBuilder } from './BpEmploymentRequestBuilder';
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
export class BpEmploymentApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BpEmployment<DeSerializersT>, DeSerializersT>
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
  ): BpEmploymentApi<DeSerializersT> {
    return new BpEmploymentApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = BpEmployment;

  requestBuilder(): BpEmploymentRequestBuilder<DeSerializersT> {
    return new BpEmploymentRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BpEmployment<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<BpEmployment<DeSerializersT>, DeSerializersT>(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<BpEmployment<DeSerializersT>, DeSerializersT, NullableT> {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<typeof BpEmployment, DeSerializersT>;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(BpEmployment, this.deSerializers);
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    BP_EMPLOYMENT_START_DATE: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      false,
      true
    >;
    BP_EMPLOYMENT_END_DATE: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.DateTime',
      true,
      true
    >;
    BP_EMPLOYMENT_STATUS: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUS_PART_EMPLR_INDSTRY_CODE: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_EMPLOYER_NAME: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BUSINESS_PARTNER_OCCUPATION_GROUP: OrderableEdmTypeField<
      BpEmployment<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ALL_FIELDS: AllFields<BpEmployment<DeSerializers>>;
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
         * Static representation of the {@link bpEmploymentStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_EMPLOYMENT_START_DATE: fieldBuilder.buildEdmTypeField(
          'BPEmploymentStartDate',
          'Edm.DateTime',
          false,
        ),
        /**
         * Static representation of the {@link bpEmploymentEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_EMPLOYMENT_END_DATE: fieldBuilder.buildEdmTypeField(
          'BPEmploymentEndDate',
          'Edm.DateTime',
          true,
        ),
        /**
         * Static representation of the {@link bpEmploymentStatus} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_EMPLOYMENT_STATUS: fieldBuilder.buildEdmTypeField(
          'BPEmploymentStatus',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link busPartEmplrIndstryCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUS_PART_EMPLR_INDSTRY_CODE: fieldBuilder.buildEdmTypeField(
          'BusPartEmplrIndstryCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerEmployerName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_EMPLOYER_NAME: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerEmployerName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link businessPartnerOccupationGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER_OCCUPATION_GROUP: fieldBuilder.buildEdmTypeField(
          'BusinessPartnerOccupationGroup',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BpEmployment),
      };
    }

    return this._schema;
  }
}
