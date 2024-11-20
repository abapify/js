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
import type { BusinessPartnerBankApi } from './BusinessPartnerBankApi';

/**
 * This class represents the entity "A_BusinessPartnerBank" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerBank<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BusinessPartnerBankType<T>
{
  /**
   * Technical entity name for BusinessPartnerBank.
   */
  static override _entityName = 'A_BusinessPartnerBank';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerBank entity.
   */
  static _keys = ['BusinessPartner', 'BankIdentification'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Bank Details ID.
   * Maximum length: 4.
   */
  declare bankIdentification: DeserializedType<T, 'Edm.String'>;
  /**
   * Bank Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare bankCountryKey?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Financial Institution.
   * Maximum length: 60.
   * @nullable
   */
  declare bankName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Bank Key.
   * Maximum length: 15.
   * @nullable
   */
  declare bankNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * SWIFT/BIC for International Payments.
   * Maximum length: 11.
   * @nullable
   */
  declare swiftCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Bank Control Key.
   * Maximum length: 2.
   * @nullable
   */
  declare bankControlKey?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account Holder Name.
   * Maximum length: 60.
   * @nullable
   */
  declare bankAccountHolderName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Bank Account.
   * Maximum length: 40.
   * @nullable
   */
  declare bankAccountName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Validity Start of Business Partner Bank Details.
   * @nullable
   */
  declare validityStartDate?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * Validity End of Business Partner Bank Details.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  /**
   * IBAN (International Bank Account Number).
   * Maximum length: 34.
   * @nullable
   */
  declare iban?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Validity Start of IBAN.
   * @nullable
   */
  declare ibanValidityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Bank Account Number.
   * Maximum length: 18.
   * @nullable
   */
  declare bankAccount?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Reference Details for Bank Details.
   * Maximum length: 20.
   * @nullable
   */
  declare bankAccountReferenceText?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: Collection Authorization.
   * @nullable
   */
  declare collectionAuthInd?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * City.
   * Maximum length: 35.
   * @nullable
   */
  declare cityName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerBankApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerBankType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  bankIdentification: DeserializedType<T, 'Edm.String'>;
  bankCountryKey?: DeserializedType<T, 'Edm.String'> | null;
  bankName?: DeserializedType<T, 'Edm.String'> | null;
  bankNumber?: DeserializedType<T, 'Edm.String'> | null;
  swiftCode?: DeserializedType<T, 'Edm.String'> | null;
  bankControlKey?: DeserializedType<T, 'Edm.String'> | null;
  bankAccountHolderName?: DeserializedType<T, 'Edm.String'> | null;
  bankAccountName?: DeserializedType<T, 'Edm.String'> | null;
  validityStartDate?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTimeOffset'> | null;
  iban?: DeserializedType<T, 'Edm.String'> | null;
  ibanValidityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bankAccount?: DeserializedType<T, 'Edm.String'> | null;
  bankAccountReferenceText?: DeserializedType<T, 'Edm.String'> | null;
  collectionAuthInd?: DeserializedType<T, 'Edm.Boolean'> | null;
  cityName?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
}
