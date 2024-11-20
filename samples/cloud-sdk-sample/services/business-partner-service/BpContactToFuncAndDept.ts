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
import type { BpContactToFuncAndDeptApi } from './BpContactToFuncAndDeptApi';

/**
 * This class represents the entity "A_BPContactToFuncAndDept" of service "API_BUSINESS_PARTNER".
 */
export class BpContactToFuncAndDept<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpContactToFuncAndDeptType<T>
{
  /**
   * Technical entity name for BpContactToFuncAndDept.
   */
  static override _entityName = 'A_BPContactToFuncAndDept';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpContactToFuncAndDept entity.
   */
  static _keys = [
    'RelationshipNumber',
    'BusinessPartnerCompany',
    'BusinessPartnerPerson',
    'ValidityEndDate',
  ];
  /**
   * BP Relationship Number.
   * Maximum length: 12.
   */
  declare relationshipNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartnerCompany: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartnerPerson: DeserializedType<T, 'Edm.String'>;
  /**
   * Validity Date (Valid To).
   */
  declare validityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  /**
   * Partner's Authority.
   * Maximum length: 1.
   * @nullable
   */
  declare contactPersonAuthorityType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Department.
   * Maximum length: 4.
   * @nullable
   */
  declare contactPersonDepartment?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Department at business partner.
   * Maximum length: 40.
   * @nullable
   */
  declare contactPersonDepartmentName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Function of partner.
   * Maximum length: 4.
   * @nullable
   */
  declare contactPersonFunction?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Function name of partner.
   * Maximum length: 40.
   * @nullable
   */
  declare contactPersonFunctionName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Notes for Partner.
   * Maximum length: 40.
   * @nullable
   */
  declare contactPersonRemarkText?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * VIP Partner.
   * Maximum length: 1.
   * @nullable
   */
  declare contactPersonVipType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Email Address.
   * Maximum length: 241.
   * @nullable
   */
  declare emailAddress?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Fax Number: Dialing Code and Number.
   * Maximum length: 30.
   * @nullable
   */
  declare faxNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Fax no.: Extension.
   * Maximum length: 10.
   * @nullable
   */
  declare faxNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Telephone No.: Dialing Code and Number.
   * Maximum length: 30.
   * @nullable
   */
  declare phoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Telephone no.: Extension.
   * Maximum length: 10.
   * @nullable
   */
  declare phoneNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Relationship Category.
   * Maximum length: 6.
   * @nullable
   */
  declare relationshipCategory?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BpContactToFuncAndDeptApi<T>) {
    super(_entityApi);
  }
}

export interface BpContactToFuncAndDeptType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  relationshipNumber: DeserializedType<T, 'Edm.String'>;
  businessPartnerCompany: DeserializedType<T, 'Edm.String'>;
  businessPartnerPerson: DeserializedType<T, 'Edm.String'>;
  validityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  contactPersonAuthorityType?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonDepartment?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonDepartmentName?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonFunction?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonFunctionName?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonRemarkText?: DeserializedType<T, 'Edm.String'> | null;
  contactPersonVipType?: DeserializedType<T, 'Edm.String'> | null;
  emailAddress?: DeserializedType<T, 'Edm.String'> | null;
  faxNumber?: DeserializedType<T, 'Edm.String'> | null;
  faxNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  phoneNumberExtension?: DeserializedType<T, 'Edm.String'> | null;
  relationshipCategory?: DeserializedType<T, 'Edm.String'> | null;
}
