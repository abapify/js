/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { CustomerUnloadingPoint } from './CustomerUnloadingPoint';
import { CustomerUnloadingPointRequestBuilder } from './CustomerUnloadingPointRequestBuilder';
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
export class CustomerUnloadingPointApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<CustomerUnloadingPoint<DeSerializersT>, DeSerializersT>
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
  ): CustomerUnloadingPointApi<DeSerializersT> {
    return new CustomerUnloadingPointApi(deSerializers);
  }

  private navigationPropertyFields!: {};

  _addNavigationProperties(linkedApis: []): this {
    this.navigationPropertyFields = {};
    return this;
  }

  entityConstructor = CustomerUnloadingPoint;

  requestBuilder(): CustomerUnloadingPointRequestBuilder<DeSerializersT> {
    return new CustomerUnloadingPointRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    CustomerUnloadingPoint<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      CustomerUnloadingPoint<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    CustomerUnloadingPoint<DeSerializersT>,
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
    typeof CustomerUnloadingPoint,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        CustomerUnloadingPoint,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    CUSTOMER: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    UNLOADING_POINT_NAME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    CUSTOMER_FACTORY_CALENDER_CODE: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    BP_GOODS_RECEIVING_HOURS_CODE: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    IS_DFLT_BP_UNLOADING_POINT: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    MONDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    MONDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    MONDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    MONDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    TUESDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    TUESDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    TUESDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    TUESDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    WEDNESDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    WEDNESDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    WEDNESDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    WEDNESDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    THURSDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    THURSDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    THURSDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    THURSDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    FRIDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    FRIDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    FRIDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    FRIDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SATURDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SATURDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SATURDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SATURDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SUNDAY_MORNING_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SUNDAY_MORNING_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SUNDAY_AFTERNOON_OPENING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    SUNDAY_AFTERNOON_CLOSING_TIME: OrderableEdmTypeField<
      CustomerUnloadingPoint<DeSerializers>,
      DeSerializersT,
      'Edm.Time',
      true,
      true
    >;
    ALL_FIELDS: AllFields<CustomerUnloadingPoint<DeSerializers>>;
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
         * Static representation of the {@link unloadingPointName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        UNLOADING_POINT_NAME: fieldBuilder.buildEdmTypeField(
          'UnloadingPointName',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link customerFactoryCalenderCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CUSTOMER_FACTORY_CALENDER_CODE: fieldBuilder.buildEdmTypeField(
          'CustomerFactoryCalenderCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link bpGoodsReceivingHoursCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BP_GOODS_RECEIVING_HOURS_CODE: fieldBuilder.buildEdmTypeField(
          'BPGoodsReceivingHoursCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link isDfltBpUnloadingPoint} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        IS_DFLT_BP_UNLOADING_POINT: fieldBuilder.buildEdmTypeField(
          'IsDfltBPUnloadingPoint',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link mondayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MONDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'MondayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link mondayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MONDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'MondayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link mondayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MONDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'MondayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link mondayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        MONDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'MondayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link tuesdayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TUESDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'TuesdayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link tuesdayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TUESDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'TuesdayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link tuesdayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TUESDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'TuesdayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link tuesdayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TUESDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'TuesdayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link wednesdayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WEDNESDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'WednesdayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link wednesdayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WEDNESDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'WednesdayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link wednesdayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WEDNESDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'WednesdayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link wednesdayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        WEDNESDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'WednesdayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link thursdayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        THURSDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'ThursdayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link thursdayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        THURSDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'ThursdayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link thursdayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        THURSDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'ThursdayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link thursdayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        THURSDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'ThursdayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link fridayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FRIDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'FridayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link fridayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FRIDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'FridayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link fridayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FRIDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'FridayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link fridayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FRIDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'FridayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link saturdayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SATURDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'SaturdayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link saturdayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SATURDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'SaturdayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link saturdayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SATURDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'SaturdayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link saturdayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SATURDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'SaturdayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link sundayMorningOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUNDAY_MORNING_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'SundayMorningOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link sundayMorningClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUNDAY_MORNING_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'SundayMorningClosingTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link sundayAfternoonOpeningTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUNDAY_AFTERNOON_OPENING_TIME: fieldBuilder.buildEdmTypeField(
          'SundayAfternoonOpeningTime',
          'Edm.Time',
          true,
        ),
        /**
         * Static representation of the {@link sundayAfternoonClosingTime} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        SUNDAY_AFTERNOON_CLOSING_TIME: fieldBuilder.buildEdmTypeField(
          'SundayAfternoonClosingTime',
          'Edm.Time',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', CustomerUnloadingPoint),
      };
    }

    return this._schema;
  }
}
