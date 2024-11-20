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
import type { BpDataControllerApi } from './BpDataControllerApi';

/**
 * This class represents the entity "A_BPDataController" of service "API_BUSINESS_PARTNER".
 */
export class BpDataController<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BpDataControllerType<T>
{
  /**
   * Technical entity name for BpDataController.
   */
  static override _entityName = 'A_BPDataController';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpDataController entity.
   */
  static _keys = [
    'BusinessPartner',
    'DataController',
    'PurposeForPersonalData',
  ];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * BP: Data Controller.
   * Maximum length: 30.
   */
  declare dataController: DeserializedType<T, 'Edm.String'>;
  /**
   * BP: Purpose.
   * Maximum length: 30.
   */
  declare purposeForPersonalData: DeserializedType<T, 'Edm.String'>;
  /**
   * BP: Data Controller Purpose Assignment Status.
   * Maximum length: 1.
   * @nullable
   */
  declare dataControlAssignmentStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * BP: Derivation Indicator for Data Controller (DC).
   * Maximum length: 1.
   * @nullable
   */
  declare bpDataControllerIsDerived?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * BP: Derivation Indicator for Purpose.
   * Maximum length: 1.
   * @nullable
   */
  declare purposeDerived?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * BP: Purpose Type.
   * Maximum length: 1.
   * @nullable
   */
  declare purposeType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Purpose Completed Flag.
   * Maximum length: 1.
   * @nullable
   */
  declare businessPurposeFlag?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BpDataControllerApi<T>) {
    super(_entityApi);
  }
}

export interface BpDataControllerType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  dataController: DeserializedType<T, 'Edm.String'>;
  purposeForPersonalData: DeserializedType<T, 'Edm.String'>;
  dataControlAssignmentStatus?: DeserializedType<T, 'Edm.String'> | null;
  bpDataControllerIsDerived?: DeserializedType<T, 'Edm.String'> | null;
  purposeDerived?: DeserializedType<T, 'Edm.String'> | null;
  purposeType?: DeserializedType<T, 'Edm.String'> | null;
  businessPurposeFlag?: DeserializedType<T, 'Edm.String'> | null;
}
