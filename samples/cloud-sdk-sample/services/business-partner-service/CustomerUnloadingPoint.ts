/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType,
} from '@sap-cloud-sdk/odata-v2';
import type { CustomerUnloadingPointApi } from './CustomerUnloadingPointApi';

/**
 * This class represents the entity "A_CustomerUnloadingPoint" of service "API_BUSINESS_PARTNER".
 */
export class CustomerUnloadingPoint<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements CustomerUnloadingPointType<T>
{
  /**
   * Technical entity name for CustomerUnloadingPoint.
   */
  static override _entityName = 'A_CustomerUnloadingPoint';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the CustomerUnloadingPoint entity.
   */
  static _keys = ['Customer', 'UnloadingPointName'];
  /**
   * Customer Number.
   * Maximum length: 10.
   */
  declare customer: DeserializedType<T, 'Edm.String'>;
  /**
   * Unloading Point.
   * Maximum length: 25.
   */
  declare unloadingPointName: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer's factory calendar.
   * Maximum length: 2.
   * @nullable
   */
  declare customerFactoryCalenderCode?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Goods receiving hours ID (default value).
   * Maximum length: 3.
   * @nullable
   */
  declare bpGoodsReceivingHoursCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Default unloading point.
   * @nullable
   */
  declare isDfltBpUnloadingPoint?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Goods receipt times: Monday morning from ...
   * @nullable
   */
  declare mondayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Monday morning until ...
   * @nullable
   */
  declare mondayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Monday afternoon from ...
   * @nullable
   */
  declare mondayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Monday afternoon until ...
   * @nullable
   */
  declare mondayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Tuesday morning from...
   * @nullable
   */
  declare tuesdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receipt times: Tuesday morning until ...
   * @nullable
   */
  declare tuesdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Tuesday afternoon from ...
   * @nullable
   */
  declare tuesdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Tuesday afternoon until ...
   * @nullable
   */
  declare tuesdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Wednesday morning from ...
   * @nullable
   */
  declare wednesdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Wednesday morning until ...
   * @nullable
   */
  declare wednesdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Wednesday afternoon from ...
   * @nullable
   */
  declare wednesdayAfternoonOpeningTime?: DeserializedType<
    T,
    'Edm.Time'
  > | null;
  /**
   * Goods receiving hours: Wednesday afternoon until ...
   * @nullable
   */
  declare wednesdayAfternoonClosingTime?: DeserializedType<
    T,
    'Edm.Time'
  > | null;
  /**
   * Goods receiving hours: Thursday morning from ...
   * @nullable
   */
  declare thursdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Thursday morning until ...
   * @nullable
   */
  declare thursdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Thursday afternoon from ...
   * @nullable
   */
  declare thursdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Thursday afternoon until...
   * @nullable
   */
  declare thursdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Friday morning from ...
   * @nullable
   */
  declare fridayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Friday morning until ...
   * @nullable
   */
  declare fridayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Friday afternoon from ...
   * @nullable
   */
  declare fridayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Friday afternoon until ...
   * @nullable
   */
  declare fridayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Saturday morning from ...
   * @nullable
   */
  declare saturdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Saturday morning until ...
   * @nullable
   */
  declare saturdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Saturday afternoon from ...
   * @nullable
   */
  declare saturdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Saturday afternoon until ...
   * @nullable
   */
  declare saturdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Sunday morning from ...
   * @nullable
   */
  declare sundayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Sunday morning until ...
   * @nullable
   */
  declare sundayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Sunday afternoon from ...
   * @nullable
   */
  declare sundayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Goods receiving hours: Sunday afternoon until ...
   * @nullable
   */
  declare sundayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;

  constructor(_entityApi: CustomerUnloadingPointApi<T>) {
    super(_entityApi);
  }
}

export interface CustomerUnloadingPointType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  customer: DeserializedType<T, 'Edm.String'>;
  unloadingPointName: DeserializedType<T, 'Edm.String'>;
  customerFactoryCalenderCode?: DeserializedType<T, 'Edm.String'> | null;
  bpGoodsReceivingHoursCode?: DeserializedType<T, 'Edm.String'> | null;
  isDfltBpUnloadingPoint?: DeserializedType<T, 'Edm.Boolean'> | null;
  mondayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  mondayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  mondayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  mondayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  tuesdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  tuesdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  tuesdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  tuesdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  wednesdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  wednesdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  wednesdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  wednesdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  thursdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  thursdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  thursdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  thursdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  fridayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  fridayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  fridayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  fridayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  saturdayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  saturdayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  saturdayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  saturdayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  sundayMorningOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  sundayMorningClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
  sundayAfternoonOpeningTime?: DeserializedType<T, 'Edm.Time'> | null;
  sundayAfternoonClosingTime?: DeserializedType<T, 'Edm.Time'> | null;
}
