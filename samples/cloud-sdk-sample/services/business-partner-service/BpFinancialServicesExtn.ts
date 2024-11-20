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
import type { BpFinancialServicesExtnApi } from './BpFinancialServicesExtnApi';

/**
 * This class represents the entity "A_BPFinancialServicesExtn" of service "API_BUSINESS_PARTNER".
 */
export class BpFinancialServicesExtn<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BpFinancialServicesExtnType<T>
{
  /**
   * Technical entity name for BpFinancialServicesExtn.
   */
  static override _entityName = 'A_BPFinancialServicesExtn';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BpFinancialServicesExtn entity.
   */
  static _keys = ['BusinessPartner'];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Business Partner Is VIP.
   * @nullable
   */
  declare businessPartnerIsVip?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Company ID of Trading Partner.
   * Maximum length: 6.
   * @nullable
   */
  declare tradingPartner?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Factory calendar.
   * Maximum length: 2.
   * @nullable
   */
  declare factoryCalendar?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Country/Region of Registered Office.
   * Maximum length: 3.
   * @nullable
   */
  declare businessPartnerOfficeCountry?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Region of Registered Office.
   * Maximum length: 3.
   * @nullable
   */
  declare businessPartnerOfficeRegion?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Registered Office.
   * Maximum length: 35.
   * @nullable
   */
  declare bpRegisteredOfficeName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Balance Sheet Currency.
   * Maximum length: 5.
   * @nullable
   */
  declare bpBalanceSheetCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Amount of last capital increase.
   * @nullable
   */
  declare bpLastCptlIncrAmtInBalShtCrcy?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Year of Last Capital Increase.
   * Maximum length: 4.
   * @nullable
   */
  declare bpLastCapitalIncreaseYear?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Balance Sheet Display.
   * Maximum length: 1.
   * @nullable
   */
  declare bpBalanceSheetDisplayType?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Citizenship.
   * Maximum length: 3.
   * @nullable
   */
  declare businessPartnerCitizenship?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Marital property regime.
   * Maximum length: 2.
   * @nullable
   */
  declare bpMaritalPropertyRegime?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Currency of Net Income.
   * Maximum length: 5.
   * @nullable
   */
  declare businessPartnerIncomeCurrency?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Number of Children Belonging to the Business Partner.
   * @nullable
   */
  declare bpNumberOfChildren?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Number of People Living in the Household.
   * @nullable
   */
  declare bpNumberOfHouseholdMembers?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Net Annual Income.
   * @nullable
   */
  declare bpAnnualNetIncAmtInIncomeCrcy?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Monthly Net Income of Business Partner.
   * @nullable
   */
  declare bpMonthlyNetIncAmtInIncomeCrcy?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Year of Net Annual Income.
   * Maximum length: 4.
   * @nullable
   */
  declare bpAnnualNetIncomeYear?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Calendar Month of Monthly Net Income.
   * Maximum length: 2.
   * @nullable
   */
  declare bpMonthlyNetIncomeMonth?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Year of Monthly Net Income.
   * Maximum length: 4.
   * @nullable
   */
  declare bpMonthlyNetIncomeYear?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Name of Place of Death of Natural Person.
   * Maximum length: 40.
   * @nullable
   */
  declare bpPlaceOfDeathName?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Undesirable Customer.
   * @nullable
   */
  declare customerIsUnwanted?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Reason for Undesirability.
   * Maximum length: 2.
   * @nullable
   */
  declare undesirabilityReason?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Comment on Undesirability.
   * Maximum length: 35.
   * @nullable
   */
  declare undesirabilityComment?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Date of Last Customer Contact.
   * @nullable
   */
  declare lastCustomerContactDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Grouping Character.
   * Maximum length: 10.
   * @nullable
   */
  declare bpGroupingCharacter?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Salutation.
   * Maximum length: 2.
   * @nullable
   */
  declare bpLetterSalutation?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Target Group.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerTargetGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Employee Group.
   * Maximum length: 4.
   * @nullable
   */
  declare businessPartnerEmployeeGroup?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Employee.
   * @nullable
   */
  declare businessPartnerIsEmployee?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Termination Date for Business Relations with the Bank.
   * @nullable
   */
  declare bpTermnBusRelationsBankDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;

  constructor(_entityApi: BpFinancialServicesExtnApi<T>) {
    super(_entityApi);
  }
}

export interface BpFinancialServicesExtnType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  businessPartnerIsVip?: DeserializedType<T, 'Edm.Boolean'> | null;
  tradingPartner?: DeserializedType<T, 'Edm.String'> | null;
  factoryCalendar?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerOfficeCountry?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerOfficeRegion?: DeserializedType<T, 'Edm.String'> | null;
  bpRegisteredOfficeName?: DeserializedType<T, 'Edm.String'> | null;
  bpBalanceSheetCurrency?: DeserializedType<T, 'Edm.String'> | null;
  bpLastCptlIncrAmtInBalShtCrcy?: DeserializedType<T, 'Edm.Decimal'> | null;
  bpLastCapitalIncreaseYear?: DeserializedType<T, 'Edm.String'> | null;
  bpBalanceSheetDisplayType?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerCitizenship?: DeserializedType<T, 'Edm.String'> | null;
  bpMaritalPropertyRegime?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerIncomeCurrency?: DeserializedType<T, 'Edm.String'> | null;
  bpNumberOfChildren?: DeserializedType<T, 'Edm.Decimal'> | null;
  bpNumberOfHouseholdMembers?: DeserializedType<T, 'Edm.Decimal'> | null;
  bpAnnualNetIncAmtInIncomeCrcy?: DeserializedType<T, 'Edm.Decimal'> | null;
  bpMonthlyNetIncAmtInIncomeCrcy?: DeserializedType<T, 'Edm.Decimal'> | null;
  bpAnnualNetIncomeYear?: DeserializedType<T, 'Edm.String'> | null;
  bpMonthlyNetIncomeMonth?: DeserializedType<T, 'Edm.String'> | null;
  bpMonthlyNetIncomeYear?: DeserializedType<T, 'Edm.String'> | null;
  bpPlaceOfDeathName?: DeserializedType<T, 'Edm.String'> | null;
  customerIsUnwanted?: DeserializedType<T, 'Edm.Boolean'> | null;
  undesirabilityReason?: DeserializedType<T, 'Edm.String'> | null;
  undesirabilityComment?: DeserializedType<T, 'Edm.String'> | null;
  lastCustomerContactDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bpGroupingCharacter?: DeserializedType<T, 'Edm.String'> | null;
  bpLetterSalutation?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerTargetGroup?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerEmployeeGroup?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerIsEmployee?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpTermnBusRelationsBankDate?: DeserializedType<T, 'Edm.DateTime'> | null;
}
