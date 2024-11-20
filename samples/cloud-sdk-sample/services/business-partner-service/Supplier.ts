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
import type { SupplierApi } from './SupplierApi';
import { SupplierCompany, SupplierCompanyType } from './SupplierCompany';
import {
  SupplierPurchasingOrg,
  SupplierPurchasingOrgType,
} from './SupplierPurchasingOrg';
import { SupplierText, SupplierTextType } from './SupplierText';

/**
 * This class represents the entity "A_Supplier" of service "API_BUSINESS_PARTNER".
 */
export class Supplier<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements SupplierType<T>
{
  /**
   * Technical entity name for Supplier.
   */
  static override _entityName = 'A_Supplier';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the Supplier entity.
   */
  static _keys = ['Supplier'];
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
  /**
   * Account Number of the Alternative Payee.
   * Maximum length: 10.
   * @nullable
   */
  declare alternativePayeeAccountNumber?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Permanent Account Number.
   * Maximum length: 40.
   * @nullable
   */
  declare businessPartnerPanNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Person who Created the Object.
   * Maximum length: 12.
   * @nullable
   */
  declare createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Record Created On.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Customer Number.
   * Maximum length: 10.
   * @nullable
   */
  declare customer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment Block.
   * @nullable
   */
  declare paymentIsBlockedForSupplier?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Central Posting Block.
   * @nullable
   */
  declare postingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Centrally imposed purchasing block.
   * @nullable
   */
  declare purchasingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Supplier Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier Full Name.
   * Maximum length: 220.
   * @nullable
   */
  declare supplierFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Supplier.
   * Maximum length: 80.
   * @nullable
   */
  declare supplierName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * VAT Registration Number.
   * Maximum length: 20.
   * @nullable
   */
  declare vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Birth of the Person Subject to Withholding Tax.
   * @nullable
   */
  declare birthDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Cocatenated International Location Number.
   * Maximum length: 20.
   * @nullable
   */
  declare concatenatedInternationalLocNo?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Central Deletion Flag for Master Record.
   * @nullable
   */
  declare deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Account number of the master record with fiscal address.
   * Maximum length: 10.
   * @nullable
   */
  declare fiscalAddress?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry Key.
   * Maximum length: 4.
   * @nullable
   */
  declare industry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * International location number  (part 1).
   * Maximum length: 7.
   * @nullable
   */
  declare internationalLocationNumber1?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * International location number (Part 2).
   * Maximum length: 5.
   * @nullable
   */
  declare internationalLocationNumber2?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Check digit for the international location number.
   * Maximum length: 1.
   * @nullable
   */
  declare internationalLocationNumber3?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Natural Person.
   * Maximum length: 1.
   * @nullable
   */
  declare isNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment Reason.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Type.
   * Maximum length: 2.
   * @nullable
   */
  declare responsibleType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Validity Date of Certification.
   * @nullable
   */
  declare suplrQltyInProcmtCertfnValidTo?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Supplier's QM System.
   * Maximum length: 4.
   * @nullable
   */
  declare suplrQualityManagementSystem?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Group Key.
   * Maximum length: 10.
   * @nullable
   */
  declare supplierCorporateGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Function That Will Be Blocked.
   * Maximum length: 2.
   * @nullable
   */
  declare supplierProcurementBlock?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 1.
   * Maximum length: 16.
   * @nullable
   */
  declare taxNumber1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 2.
   * Maximum length: 11.
   * @nullable
   */
  declare taxNumber2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 3.
   * Maximum length: 18.
   * @nullable
   */
  declare taxNumber3?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 4.
   * Maximum length: 18.
   * @nullable
   */
  declare taxNumber4?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number 5.
   * Maximum length: 60.
   * @nullable
   */
  declare taxNumber5?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number at Responsible Tax Authority.
   * Maximum length: 18.
   * @nullable
   */
  declare taxNumberResponsible?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Number Type.
   * Maximum length: 2.
   * @nullable
   */
  declare taxNumberType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier indicator relevant for proof of delivery.
   * Maximum length: 1.
   * @nullable
   */
  declare suplrProofOfDelivRlvtCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Split.
   * @nullable
   */
  declare brTaxIsSplit?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Instruction Key for Data Medium Exchange.
   * Maximum length: 2.
   * @nullable
   */
  declare dataExchangeInstructionKey?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link SupplierCompany} entity.
   */
  declare toSupplierCompany: SupplierCompany<T>[];
  /**
   * One-to-many navigation property to the {@link SupplierPurchasingOrg} entity.
   */
  declare toSupplierPurchasingOrg: SupplierPurchasingOrg<T>[];
  /**
   * One-to-many navigation property to the {@link SupplierText} entity.
   */
  declare toSupplierText: SupplierText<T>[];

  constructor(_entityApi: SupplierApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierType<T extends DeSerializers = DefaultDeSerializers> {
  supplier: DeserializedType<T, 'Edm.String'>;
  alternativePayeeAccountNumber?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerPanNumber?: DeserializedType<T, 'Edm.String'> | null;
  createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  customer?: DeserializedType<T, 'Edm.String'> | null;
  paymentIsBlockedForSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
  postingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchasingIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierFullName?: DeserializedType<T, 'Edm.String'> | null;
  supplierName?: DeserializedType<T, 'Edm.String'> | null;
  vatRegistration?: DeserializedType<T, 'Edm.String'> | null;
  birthDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  concatenatedInternationalLocNo?: DeserializedType<T, 'Edm.String'> | null;
  deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  fiscalAddress?: DeserializedType<T, 'Edm.String'> | null;
  industry?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber1?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber2?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber3?: DeserializedType<T, 'Edm.String'> | null;
  isNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  paymentReason?: DeserializedType<T, 'Edm.String'> | null;
  responsibleType?: DeserializedType<T, 'Edm.String'> | null;
  suplrQltyInProcmtCertfnValidTo?: DeserializedType<T, 'Edm.DateTime'> | null;
  suplrQualityManagementSystem?: DeserializedType<T, 'Edm.String'> | null;
  supplierCorporateGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierProcurementBlock?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber1?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber2?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber3?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber4?: DeserializedType<T, 'Edm.String'> | null;
  taxNumber5?: DeserializedType<T, 'Edm.String'> | null;
  taxNumberResponsible?: DeserializedType<T, 'Edm.String'> | null;
  taxNumberType?: DeserializedType<T, 'Edm.String'> | null;
  suplrProofOfDelivRlvtCode?: DeserializedType<T, 'Edm.String'> | null;
  brTaxIsSplit?: DeserializedType<T, 'Edm.Boolean'> | null;
  dataExchangeInstructionKey?: DeserializedType<T, 'Edm.String'> | null;
  toSupplierCompany: SupplierCompanyType<T>[];
  toSupplierPurchasingOrg: SupplierPurchasingOrgType<T>[];
  toSupplierText: SupplierTextType<T>[];
}
