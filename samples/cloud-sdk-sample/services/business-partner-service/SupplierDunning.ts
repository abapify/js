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
import type { SupplierDunningApi } from './SupplierDunningApi';

/**
 * This class represents the entity "A_SupplierDunning" of service "API_BUSINESS_PARTNER".
 */
export class SupplierDunning<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SupplierDunningType<T>
{
  /**
   * Technical entity name for SupplierDunning.
   */
  static override _entityName = 'A_SupplierDunning';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the SupplierDunning entity.
   */
  static _keys = ['Supplier', 'CompanyCode', 'DunningArea'];
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
  /**
   * Company Code.
   * Maximum length: 4.
   */
  declare companyCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Dunning Area.
   * Maximum length: 2.
   */
  declare dunningArea: DeserializedType<T, 'Edm.String'>;
  /**
   * Dunning Block.
   * Maximum length: 1.
   * @nullable
   */
  declare dunningBlock?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Dunning Level.
   * Maximum length: 1.
   * @nullable
   */
  declare dunningLevel?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Dunning Procedure.
   * Maximum length: 4.
   * @nullable
   */
  declare dunningProcedure?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account number of the dunning recipient.
   * Maximum length: 10.
   * @nullable
   */
  declare dunningRecipient?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Last Dunning Notice.
   * @nullable
   */
  declare lastDunnedOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Date of the Legal Dunning Proceedings.
   * @nullable
   */
  declare legDunningProcedureOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Dunning Clerk.
   * Maximum length: 2.
   * @nullable
   */
  declare dunningClerk?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: SupplierDunningApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierDunningType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  supplier: DeserializedType<T, 'Edm.String'>;
  companyCode: DeserializedType<T, 'Edm.String'>;
  dunningArea: DeserializedType<T, 'Edm.String'>;
  dunningBlock?: DeserializedType<T, 'Edm.String'> | null;
  dunningLevel?: DeserializedType<T, 'Edm.String'> | null;
  dunningProcedure?: DeserializedType<T, 'Edm.String'> | null;
  dunningRecipient?: DeserializedType<T, 'Edm.String'> | null;
  lastDunnedOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  legDunningProcedureOn?: DeserializedType<T, 'Edm.DateTime'> | null;
  dunningClerk?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
}
