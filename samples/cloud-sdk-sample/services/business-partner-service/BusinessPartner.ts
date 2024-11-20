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
import type { BusinessPartnerApi } from './BusinessPartnerApi';
import {
  BpAddressIndependentEmail,
  BpAddressIndependentEmailType,
} from './BpAddressIndependentEmail';
import {
  BpAddressIndependentFax,
  BpAddressIndependentFaxType,
} from './BpAddressIndependentFax';
import {
  BpAddressIndependentMobile,
  BpAddressIndependentMobileType,
} from './BpAddressIndependentMobile';
import {
  BpAddressIndependentPhone,
  BpAddressIndependentPhoneType,
} from './BpAddressIndependentPhone';
import {
  BpAddressIndependentWebsite,
  BpAddressIndependentWebsiteType,
} from './BpAddressIndependentWebsite';
import {
  BpCreditWorthiness,
  BpCreditWorthinessType,
} from './BpCreditWorthiness';
import { BpDataController, BpDataControllerType } from './BpDataController';
import { BpEmployment, BpEmploymentType } from './BpEmployment';
import {
  BpFinancialServicesReporting,
  BpFinancialServicesReportingType,
} from './BpFinancialServicesReporting';
import {
  BpFiscalYearInformation,
  BpFiscalYearInformationType,
} from './BpFiscalYearInformation';
import { BpRelationship, BpRelationshipType } from './BpRelationship';
import {
  BuPaIdentification,
  BuPaIdentificationType,
} from './BuPaIdentification';
import { BuPaIndustry, BuPaIndustryType } from './BuPaIndustry';
import {
  BpFinancialServicesExtn,
  BpFinancialServicesExtnType,
} from './BpFinancialServicesExtn';
import {
  BusinessPartnerAddress,
  BusinessPartnerAddressType,
} from './BusinessPartnerAddress';
import {
  BusinessPartnerAlias,
  BusinessPartnerAliasType,
} from './BusinessPartnerAlias';
import {
  BusinessPartnerBank,
  BusinessPartnerBankType,
} from './BusinessPartnerBank';
import {
  BusinessPartnerContact,
  BusinessPartnerContactType,
} from './BusinessPartnerContact';
import {
  BusinessPartnerIsBank,
  BusinessPartnerIsBankType,
} from './BusinessPartnerIsBank';
import {
  BusinessPartnerRating,
  BusinessPartnerRatingType,
} from './BusinessPartnerRating';
import {
  BusinessPartnerRole,
  BusinessPartnerRoleType,
} from './BusinessPartnerRole';
import {
  BusinessPartnerTaxNumber,
  BusinessPartnerTaxNumberType,
} from './BusinessPartnerTaxNumber';
import {
  BusPartAddrDepdntTaxNmbr,
  BusPartAddrDepdntTaxNmbrType,
} from './BusPartAddrDepdntTaxNmbr';
import { Customer, CustomerType } from './Customer';
import {
  BusinessPartnerPaymentCard,
  BusinessPartnerPaymentCardType,
} from './BusinessPartnerPaymentCard';
import { Supplier, SupplierType } from './Supplier';

/**
 * This class represents the entity "A_BusinessPartner" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartner<T extends DeSerializers = DefaultDeSerializers>
  extends Entity
  implements BusinessPartnerType<T>
{
  /**
   * Technical entity name for BusinessPartner.
   */
  static override _entityName = 'A_BusinessPartner';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartner entity.
   */
  static _keys = ['BusinessPartner'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Customer Number.
   * Maximum length: 10.
   * @nullable
   */
  declare customer?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Account Number of Supplier.
   * Maximum length: 10.
   * @nullable
   */
  declare supplier?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Academic Title: Key.
   * Maximum length: 4.
   * @nullable
   */
  declare academicTitle?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Category.
   * Maximum length: 1.
   * @nullable
   */
  declare businessPartnerCategory?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Full Name.
   * Maximum length: 81.
   * @nullable
   */
  declare businessPartnerFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Grouping.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerGrouping?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner Name.
   * Maximum length: 81.
   * @nullable
   */
  declare businessPartnerName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business Partner GUID.
   * @nullable
   */
  declare businessPartnerUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  /**
   * Business Partner: Correspondence Language.
   * Maximum length: 2.
   * @nullable
   */
  declare correspondenceLanguage?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * User who created the object.
   * Maximum length: 12.
   * @nullable
   */
  declare createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date on which the object was created.
   * @nullable
   */
  declare creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Time at which the object was created.
   * @nullable
   */
  declare creationTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * First Name of Business Partner (Person).
   * Maximum length: 40.
   * @nullable
   */
  declare firstName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Form-of-Address Key.
   * Maximum length: 4.
   * @nullable
   */
  declare formOfAddress?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Industry sector.
   * Maximum length: 10.
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
   * Selection: Business partner is female.
   * @nullable
   */
  declare isFemale?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Selection: Business partner is male.
   * @nullable
   */
  declare isMale?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Business Partner Is a Natural Person Under the Tax Laws.
   * Maximum length: 1.
   * @nullable
   */
  declare isNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Selection: Sex of business partner is not known.
   * @nullable
   */
  declare isSexUnknown?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Gender of Business Partner (Person).
   * Maximum length: 1.
   * @nullable
   */
  declare genderCodeName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Business partner: Language.
   * Maximum length: 2.
   * @nullable
   */
  declare language?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date when object was last changed.
   * @nullable
   */
  declare lastChangeDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Time at which object was last changed.
   * @nullable
   */
  declare lastChangeTime?: DeserializedType<T, 'Edm.Time'> | null;
  /**
   * Last user to change object.
   * Maximum length: 12.
   * @nullable
   */
  declare lastChangedByUser?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Last Name of Business Partner (Person).
   * Maximum length: 40.
   * @nullable
   */
  declare lastName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * BP: Legal form of organization.
   * Maximum length: 2.
   * @nullable
   */
  declare legalForm?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 1 of organization.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationBpName1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 2 of organization.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationBpName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 3 of organization.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationBpName3?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 4 of organization.
   * Maximum length: 40.
   * @nullable
   */
  declare organizationBpName4?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date organization founded.
   * @nullable
   */
  declare organizationFoundationDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Liquidation date of organization.
   * @nullable
   */
  declare organizationLiquidationDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Search Term 1 for Business Partner.
   * Maximum length: 20.
   * @nullable
   */
  declare searchTerm1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Search Term 2 for Business Partner.
   * Maximum length: 20.
   * @nullable
   */
  declare searchTerm2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Other Last Name of a Person.
   * Maximum length: 40.
   * @nullable
   */
  declare additionalLastName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Birth of Business Partner.
   * @nullable
   */
  declare birthDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Date of Birth: Status.
   * Maximum length: 1.
   * @nullable
   */
  declare businessPartnerBirthDateStatus?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Birthplace of business partner.
   * Maximum length: 40.
   * @nullable
   */
  declare businessPartnerBirthplaceName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Date of death of business partner.
   * @nullable
   */
  declare businessPartnerDeathDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Central Block for Business Partner.
   * @nullable
   */
  declare businessPartnerIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Business Partner Type.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * E Tag.
   * Maximum length: 26.
   * @nullable
   */
  declare eTag?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 1 (group).
   * Maximum length: 40.
   * @nullable
   */
  declare groupBusinessPartnerName1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name 2 (group).
   * Maximum length: 40.
   * @nullable
   */
  declare groupBusinessPartnerName2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Address Number.
   * Maximum length: 10.
   * @nullable
   */
  declare independentAddressId?: DeserializedType<T, 'Edm.String'> | null;
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
   * Middle Name or Second Forename of a Person.
   * Maximum length: 40.
   * @nullable
   */
  declare middleName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Country/Region for Name Format Rule.
   * Maximum length: 3.
   * @nullable
   */
  declare nameCountry?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name format.
   * Maximum length: 2.
   * @nullable
   */
  declare nameFormat?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Full Name.
   * Maximum length: 80.
   * @nullable
   */
  declare personFullName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Person Number.
   * Maximum length: 10.
   * @nullable
   */
  declare personNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Central Archiving Flag.
   * @nullable
   */
  declare isMarkedForArchiving?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Business Partner Number in External System.
   * Maximum length: 20.
   * @nullable
   */
  declare businessPartnerIdByExtSystem?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Business Partner Print Format.
   * Maximum length: 1.
   * @nullable
   */
  declare businessPartnerPrintFormat?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Occupation/group.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerOccupation?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Marital Status of Business Partner.
   * Maximum length: 1.
   * @nullable
   */
  declare busPartMaritalStatus?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Nationality.
   * Maximum length: 3.
   * @nullable
   */
  declare busPartNationality?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name at birth of business partner.
   * Maximum length: 40.
   * @nullable
   */
  declare businessPartnerBirthName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name supplement, e.g. noble title (key).
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerSupplementName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Name of Employer of a Natural Person.
   * Maximum length: 35.
   * @nullable
   */
  declare naturalPersonEmployerName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name Prefix (Key).
   * Maximum length: 4.
   * @nullable
   */
  declare lastNamePrefix?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * 2nd name prefix (key).
   * Maximum length: 4.
   * @nullable
   */
  declare lastNameSecondPrefix?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * "Middle Initial" or personal initials.
   * Maximum length: 10.
   * @nullable
   */
  declare initials?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * BP: Data Controller Not Required.
   * @nullable
   */
  declare bpDataControllerIsNotRequired?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Company ID of Trading Partner.
   * Maximum length: 6.
   * @nullable
   */
  declare tradingPartner?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link BpAddressIndependentEmail} entity.
   */
  declare toAddressIndependentEmail: BpAddressIndependentEmail<T>[];
  /**
   * One-to-many navigation property to the {@link BpAddressIndependentFax} entity.
   */
  declare toAddressIndependentFax: BpAddressIndependentFax<T>[];
  /**
   * One-to-many navigation property to the {@link BpAddressIndependentMobile} entity.
   */
  declare toAddressIndependentMobile: BpAddressIndependentMobile<T>[];
  /**
   * One-to-many navigation property to the {@link BpAddressIndependentPhone} entity.
   */
  declare toAddressIndependentPhone: BpAddressIndependentPhone<T>[];
  /**
   * One-to-many navigation property to the {@link BpAddressIndependentWebsite} entity.
   */
  declare toAddressIndependentWebsite: BpAddressIndependentWebsite<T>[];
  /**
   * One-to-one navigation property to the {@link BpCreditWorthiness} entity.
   */
  declare toBpCreditWorthiness?: BpCreditWorthiness<T> | null;
  /**
   * One-to-many navigation property to the {@link BpDataController} entity.
   */
  declare toBpDataController: BpDataController<T>[];
  /**
   * One-to-many navigation property to the {@link BpEmployment} entity.
   */
  declare toBpEmployment: BpEmployment<T>[];
  /**
   * One-to-one navigation property to the {@link BpFinancialServicesReporting} entity.
   */
  declare toBpFinServicesReporting?: BpFinancialServicesReporting<T> | null;
  /**
   * One-to-many navigation property to the {@link BpFiscalYearInformation} entity.
   */
  declare toBpFiscalYearInformation: BpFiscalYearInformation<T>[];
  /**
   * One-to-many navigation property to the {@link BpRelationship} entity.
   */
  declare toBpRelationship: BpRelationship<T>[];
  /**
   * One-to-many navigation property to the {@link BuPaIdentification} entity.
   */
  declare toBuPaIdentification: BuPaIdentification<T>[];
  /**
   * One-to-many navigation property to the {@link BuPaIndustry} entity.
   */
  declare toBuPaIndustry: BuPaIndustry<T>[];
  /**
   * One-to-one navigation property to the {@link BpFinancialServicesExtn} entity.
   */
  declare toBusinessPartner?: BpFinancialServicesExtn<T> | null;
  /**
   * One-to-many navigation property to the {@link BusinessPartnerAddress} entity.
   */
  declare toBusinessPartnerAddress: BusinessPartnerAddress<T>[];
  /**
   * One-to-many navigation property to the {@link BusinessPartnerAlias} entity.
   */
  declare toBusinessPartnerAlias: BusinessPartnerAlias<T>[];
  /**
   * One-to-many navigation property to the {@link BusinessPartnerBank} entity.
   */
  declare toBusinessPartnerBank: BusinessPartnerBank<T>[];
  /**
   * One-to-many navigation property to the {@link BusinessPartnerContact} entity.
   */
  declare toBusinessPartnerContact: BusinessPartnerContact<T>[];
  /**
   * One-to-one navigation property to the {@link BusinessPartnerIsBank} entity.
   */
  declare toBusinessPartnerIsBank?: BusinessPartnerIsBank<T> | null;
  /**
   * One-to-many navigation property to the {@link BusinessPartnerRating} entity.
   */
  declare toBusinessPartnerRating: BusinessPartnerRating<T>[];
  /**
   * One-to-many navigation property to the {@link BusinessPartnerRole} entity.
   */
  declare toBusinessPartnerRole: BusinessPartnerRole<T>[];
  /**
   * One-to-many navigation property to the {@link BusinessPartnerTaxNumber} entity.
   */
  declare toBusinessPartnerTax: BusinessPartnerTaxNumber<T>[];
  /**
   * One-to-many navigation property to the {@link BusPartAddrDepdntTaxNmbr} entity.
   */
  declare toBusPartAddrDepdntTaxNmbr: BusPartAddrDepdntTaxNmbr<T>[];
  /**
   * One-to-one navigation property to the {@link Customer} entity.
   */
  declare toCustomer?: Customer<T> | null;
  /**
   * One-to-many navigation property to the {@link BusinessPartnerPaymentCard} entity.
   */
  declare toPaymentCard: BusinessPartnerPaymentCard<T>[];
  /**
   * One-to-one navigation property to the {@link Supplier} entity.
   */
  declare toSupplier?: Supplier<T> | null;

  constructor(_entityApi: BusinessPartnerApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  customer?: DeserializedType<T, 'Edm.String'> | null;
  supplier?: DeserializedType<T, 'Edm.String'> | null;
  academicTitle?: DeserializedType<T, 'Edm.String'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerCategory?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerFullName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerGrouping?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  correspondenceLanguage?: DeserializedType<T, 'Edm.String'> | null;
  createdByUser?: DeserializedType<T, 'Edm.String'> | null;
  creationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  creationTime?: DeserializedType<T, 'Edm.Time'> | null;
  firstName?: DeserializedType<T, 'Edm.String'> | null;
  formOfAddress?: DeserializedType<T, 'Edm.String'> | null;
  industry?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber1?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber2?: DeserializedType<T, 'Edm.String'> | null;
  isFemale?: DeserializedType<T, 'Edm.Boolean'> | null;
  isMale?: DeserializedType<T, 'Edm.Boolean'> | null;
  isNaturalPerson?: DeserializedType<T, 'Edm.String'> | null;
  isSexUnknown?: DeserializedType<T, 'Edm.Boolean'> | null;
  genderCodeName?: DeserializedType<T, 'Edm.String'> | null;
  language?: DeserializedType<T, 'Edm.String'> | null;
  lastChangeDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  lastChangeTime?: DeserializedType<T, 'Edm.Time'> | null;
  lastChangedByUser?: DeserializedType<T, 'Edm.String'> | null;
  lastName?: DeserializedType<T, 'Edm.String'> | null;
  legalForm?: DeserializedType<T, 'Edm.String'> | null;
  organizationBpName1?: DeserializedType<T, 'Edm.String'> | null;
  organizationBpName2?: DeserializedType<T, 'Edm.String'> | null;
  organizationBpName3?: DeserializedType<T, 'Edm.String'> | null;
  organizationBpName4?: DeserializedType<T, 'Edm.String'> | null;
  organizationFoundationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  organizationLiquidationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  searchTerm1?: DeserializedType<T, 'Edm.String'> | null;
  searchTerm2?: DeserializedType<T, 'Edm.String'> | null;
  additionalLastName?: DeserializedType<T, 'Edm.String'> | null;
  birthDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  businessPartnerBirthDateStatus?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerBirthplaceName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerDeathDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  businessPartnerIsBlocked?: DeserializedType<T, 'Edm.Boolean'> | null;
  businessPartnerType?: DeserializedType<T, 'Edm.String'> | null;
  eTag?: DeserializedType<T, 'Edm.String'> | null;
  groupBusinessPartnerName1?: DeserializedType<T, 'Edm.String'> | null;
  groupBusinessPartnerName2?: DeserializedType<T, 'Edm.String'> | null;
  independentAddressId?: DeserializedType<T, 'Edm.String'> | null;
  internationalLocationNumber3?: DeserializedType<T, 'Edm.String'> | null;
  middleName?: DeserializedType<T, 'Edm.String'> | null;
  nameCountry?: DeserializedType<T, 'Edm.String'> | null;
  nameFormat?: DeserializedType<T, 'Edm.String'> | null;
  personFullName?: DeserializedType<T, 'Edm.String'> | null;
  personNumber?: DeserializedType<T, 'Edm.String'> | null;
  isMarkedForArchiving?: DeserializedType<T, 'Edm.Boolean'> | null;
  businessPartnerIdByExtSystem?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerPrintFormat?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerOccupation?: DeserializedType<T, 'Edm.String'> | null;
  busPartMaritalStatus?: DeserializedType<T, 'Edm.String'> | null;
  busPartNationality?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerBirthName?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerSupplementName?: DeserializedType<T, 'Edm.String'> | null;
  naturalPersonEmployerName?: DeserializedType<T, 'Edm.String'> | null;
  lastNamePrefix?: DeserializedType<T, 'Edm.String'> | null;
  lastNameSecondPrefix?: DeserializedType<T, 'Edm.String'> | null;
  initials?: DeserializedType<T, 'Edm.String'> | null;
  bpDataControllerIsNotRequired?: DeserializedType<T, 'Edm.Boolean'> | null;
  tradingPartner?: DeserializedType<T, 'Edm.String'> | null;
  toAddressIndependentEmail: BpAddressIndependentEmailType<T>[];
  toAddressIndependentFax: BpAddressIndependentFaxType<T>[];
  toAddressIndependentMobile: BpAddressIndependentMobileType<T>[];
  toAddressIndependentPhone: BpAddressIndependentPhoneType<T>[];
  toAddressIndependentWebsite: BpAddressIndependentWebsiteType<T>[];
  toBpCreditWorthiness?: BpCreditWorthinessType<T> | null;
  toBpDataController: BpDataControllerType<T>[];
  toBpEmployment: BpEmploymentType<T>[];
  toBpFinServicesReporting?: BpFinancialServicesReportingType<T> | null;
  toBpFiscalYearInformation: BpFiscalYearInformationType<T>[];
  toBpRelationship: BpRelationshipType<T>[];
  toBuPaIdentification: BuPaIdentificationType<T>[];
  toBuPaIndustry: BuPaIndustryType<T>[];
  toBusinessPartner?: BpFinancialServicesExtnType<T> | null;
  toBusinessPartnerAddress: BusinessPartnerAddressType<T>[];
  toBusinessPartnerAlias: BusinessPartnerAliasType<T>[];
  toBusinessPartnerBank: BusinessPartnerBankType<T>[];
  toBusinessPartnerContact: BusinessPartnerContactType<T>[];
  toBusinessPartnerIsBank?: BusinessPartnerIsBankType<T> | null;
  toBusinessPartnerRating: BusinessPartnerRatingType<T>[];
  toBusinessPartnerRole: BusinessPartnerRoleType<T>[];
  toBusinessPartnerTax: BusinessPartnerTaxNumberType<T>[];
  toBusPartAddrDepdntTaxNmbr: BusPartAddrDepdntTaxNmbrType<T>[];
  toCustomer?: CustomerType<T> | null;
  toPaymentCard: BusinessPartnerPaymentCardType<T>[];
  toSupplier?: SupplierType<T> | null;
}
