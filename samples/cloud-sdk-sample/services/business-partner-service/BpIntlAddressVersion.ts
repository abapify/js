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
import type { BpIntlAddressVersionApi } from './BpIntlAddressVersionApi';

/**
 * This class represents the entity "A_BPIntlAddressVersion" of service "API_BUSINESS_PARTNER".
 */
export class BpIntlAddressVersion<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpIntlAddressVersionType<T>
{
  /**
   * Technical entity name for BpIntlAddressVersion.
   */
  static override _entityName = 'A_BPIntlAddressVersion';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpIntlAddressVersion entity.
   */
  static _keys = ['BusinessPartner', 'AddressID', 'AddressRepresentationCode'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Address Number.
   * Maximum length: 10.
   */
  declare addressId: DeserializedType<T, 'Edm.String'>;
  /**
   * Version ID for International Addresses.
   * Maximum length: 1.
   */
  declare addressRepresentationCode: DeserializedType<T, 'Edm.String'>;
  /**
   * Full Name of Person.
   * Maximum length: 80.
   * @nullable
   */
  declare addresseeFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Address number in external system.
   * Maximum length: 20.
   * @nullable
   */
  declare addressIdByExternalSystem?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Person Number.
   * Maximum length: 10.
   * @nullable
   */
  declare addressPersonId?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Search Term 1.
   * Maximum length: 20.
   * @nullable
   */
  declare addressSearchTerm1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Search Term 2.
   * Maximum length: 20.
   * @nullable
   */
  declare addressSearchTerm2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Address Time Zone.
   * Maximum length: 6.
   * @nullable
   */
  declare addressTimeZone?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * c/o name.
   * Maximum length: 40.
   * @nullable
   */
  declare careOfName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City.
   * Maximum length: 40.
   * @nullable
   */
  declare cityName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City code for city/street file.
   * Maximum length: 12.
   * @nullable
   */
  declare cityNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Company Postal Code (for Large Customers).
   * Maximum length: 10.
   * @nullable
   */
  declare companyPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Country/Region Key.
   * Maximum length: 3.
   * @nullable
   */
  declare country?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Number of Delivery Service.
   * Maximum length: 10.
   * @nullable
   */
  declare deliveryServiceNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Type of Delivery Service.
   * Maximum length: 4.
   * @nullable
   */
  declare deliveryServiceTypeCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * District.
   * Maximum length: 40.
   * @nullable
   */
  declare districtName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Form-of-Address Key.
   * Maximum length: 4.
   * @nullable
   */
  declare formOfAddress?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * House Number.
   * Maximum length: 10.
   * @nullable
   */
  declare houseNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * House number supplement.
   * Maximum length: 10.
   * @nullable
   */
  declare houseNumberSupplementText?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Language Key.
   * Maximum length: 2.
   * @nullable
   */
  declare language?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 1.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationName1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 2.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 3.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationName3?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 4.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationName4?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Last Name.
   * Maximum length: 40.
   * @nullable
   */
  declare personFamilyName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * First Name.
   * Maximum length: 40.
   * @nullable
   */
  declare personGivenName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * PO Box.
   * Maximum length: 10.
   * @nullable
   */
  declare poBox?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * PO Box city.
   * Maximum length: 40.
   * @nullable
   */
  declare poBoxDeviatingCityName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * PO Box of Country/Region.
   * Maximum length: 3.
   * @nullable
   */
  declare poBoxDeviatingCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Region for PO Box (Country/Region, State, Province, ...).
   * Maximum length: 3.
   * @nullable
   */
  declare poBoxDeviatingRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Flag: PO Box Without Number.
   * @nullable
   */
  declare poBoxIsWithoutNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * PO Box Lobby.
   * Maximum length: 40.
   * @nullable
   */
  declare poBoxLobbyName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * PO Box Postal Code.
   * Maximum length: 10.
   * @nullable
   */
  declare poBoxPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City Postal Code.
   * Maximum length: 10.
   * @nullable
   */
  declare postalCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Communication Method (Key) (Business Address Services).
   * Maximum length: 3.
   * @nullable
   */
  declare prfrdCommMediumType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Region (State, Province, County).
   * Maximum length: 3.
   * @nullable
   */
  declare region?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * County code for county.
   * Maximum length: 8.
   * @nullable
   */
  declare secondaryRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * County.
   * Maximum length: 40.
   * @nullable
   */
  declare secondaryRegionName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street.
   * Maximum length: 60.
   * @nullable
   */
  declare streetName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street 2.
   * Maximum length: 40.
   * @nullable
   */
  declare streetPrefixName1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street 3.
   * Maximum length: 40.
   * @nullable
   */
  declare streetPrefixName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street 4.
   * Maximum length: 40.
   * @nullable
   */
  declare streetSuffixName1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Street 5.
   * Maximum length: 40.
   * @nullable
   */
  declare streetSuffixName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Tax Jurisdiction.
   * Maximum length: 15.
   * @nullable
   */
  declare taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Township code for Township.
   * Maximum length: 8.
   * @nullable
   */
  declare tertiaryRegion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Township.
   * Maximum length: 40.
   * @nullable
   */
  declare tertiaryRegionName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Transportation zone to or from which the goods are delivered.
   * Maximum length: 10.
   * @nullable
   */
  declare transportZone?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * City (different from postal city).
   * Maximum length: 40.
   * @nullable
   */
  declare villageName?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BpIntlAddressVersionApi<T>) {
    super(_entityApi);
  }
}

export interface BpIntlAddressVersionType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  addressId: DeserializedType<T, 'Edm.String'>;
  addressRepresentationCode: DeserializedType<T, 'Edm.String'>;
  addresseeFullName?: DeserializedType<T, 'Edm.String'> | null;
  addressIdByExternalSystem?: DeserializedType<T, 'Edm.String'> | null;
  addressPersonId?: DeserializedType<T, 'Edm.String'> | null;
  addressSearchTerm1?: DeserializedType<T, 'Edm.String'> | null;
  addressSearchTerm2?: DeserializedType<T, 'Edm.String'> | null;
  addressTimeZone?: DeserializedType<T, 'Edm.String'> | null;
  careOfName?: DeserializedType<T, 'Edm.String'> | null;
  cityName?: DeserializedType<T, 'Edm.String'> | null;
  cityNumber?: DeserializedType<T, 'Edm.String'> | null;
  companyPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  country?: DeserializedType<T, 'Edm.String'> | null;
  deliveryServiceNumber?: DeserializedType<T, 'Edm.String'> | null;
  deliveryServiceTypeCode?: DeserializedType<T, 'Edm.String'> | null;
  districtName?: DeserializedType<T, 'Edm.String'> | null;
  formOfAddress?: DeserializedType<T, 'Edm.String'> | null;
  houseNumber?: DeserializedType<T, 'Edm.String'> | null;
  houseNumberSupplementText?: DeserializedType<T, 'Edm.String'> | null;
  language?: DeserializedType<T, 'Edm.String'> | null;
  organizationName1?: DeserializedType<T, 'Edm.String'> | null;
  organizationName2?: DeserializedType<T, 'Edm.String'> | null;
  organizationName3?: DeserializedType<T, 'Edm.String'> | null;
  organizationName4?: DeserializedType<T, 'Edm.String'> | null;
  personFamilyName?: DeserializedType<T, 'Edm.String'> | null;
  personGivenName?: DeserializedType<T, 'Edm.String'> | null;
  poBox?: DeserializedType<T, 'Edm.String'> | null;
  poBoxDeviatingCityName?: DeserializedType<T, 'Edm.String'> | null;
  poBoxDeviatingCountry?: DeserializedType<T, 'Edm.String'> | null;
  poBoxDeviatingRegion?: DeserializedType<T, 'Edm.String'> | null;
  poBoxIsWithoutNumber?: DeserializedType<T, 'Edm.Boolean'> | null;
  poBoxLobbyName?: DeserializedType<T, 'Edm.String'> | null;
  poBoxPostalCode?: DeserializedType<T, 'Edm.String'> | null;
  postalCode?: DeserializedType<T, 'Edm.String'> | null;
  prfrdCommMediumType?: DeserializedType<T, 'Edm.String'> | null;
  region?: DeserializedType<T, 'Edm.String'> | null;
  secondaryRegion?: DeserializedType<T, 'Edm.String'> | null;
  secondaryRegionName?: DeserializedType<T, 'Edm.String'> | null;
  streetName?: DeserializedType<T, 'Edm.String'> | null;
  streetPrefixName1?: DeserializedType<T, 'Edm.String'> | null;
  streetPrefixName2?: DeserializedType<T, 'Edm.String'> | null;
  streetSuffixName1?: DeserializedType<T, 'Edm.String'> | null;
  streetSuffixName2?: DeserializedType<T, 'Edm.String'> | null;
  taxJurisdiction?: DeserializedType<T, 'Edm.String'> | null;
  tertiaryRegion?: DeserializedType<T, 'Edm.String'> | null;
  tertiaryRegionName?: DeserializedType<T, 'Edm.String'> | null;
  transportZone?: DeserializedType<T, 'Edm.String'> | null;
  villageName?: DeserializedType<T, 'Edm.String'> | null;
}
