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
import type { BusinessPartnerRatingApi } from './BusinessPartnerRatingApi';

/**
 * This class represents the entity "A_BusinessPartnerRating" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerRating<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusinessPartnerRatingType<T>
{
  /**
   * Technical entity name for BusinessPartnerRating.
   */
  static override _entityName = 'A_BusinessPartnerRating';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerRating entity.
   */
  static _keys = [
    'BusinessPartner',
    'BusinessPartnerRatingProcedure',
    'BPRatingValidityEndDate',
  ];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Rating Procedure.
   * Maximum length: 10.
   */
  declare businessPartnerRatingProcedure: DeserializedType<T, 'Edm.String'>;
  /**
   * Valid-to Date for Rating.
   */
  declare bpRatingValidityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  /**
   * Rating.
   * Maximum length: 10.
   * @nullable
   */
  declare businessPartnerRatingGrade?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Trend.
   * Maximum length: 2.
   * @nullable
   */
  declare businessPartnerRatingTrend?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Valid-from Date for Rating.
   * @nullable
   */
  declare bpRatingValidityStartDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Entered-on Date for Rating.
   * @nullable
   */
  declare bpRatingCreationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Text for Ratings.
   * Maximum length: 60.
   * @nullable
   */
  declare businessPartnerRatingComment?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Rating Allowed.
   * @nullable
   */
  declare businessPartnerRatingIsAllowed?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Business Partner Rating is valid on Key Date.
   * @nullable
   */
  declare bpRatingIsValidOnKeyDate?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Key Date of Accessing Business Partner Rating Data.
   * @nullable
   */
  declare businessPartnerRatingKeyDate?: DeserializedType<
    T,
    'Edm.DateTime'
  > | null;
  /**
   * Rating Validity is Expired according to Permitted Period.
   * @nullable
   */
  declare businessPartnerRatingIsExpired?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Longtext for Rating.
   * Maximum length: 255.
   * @nullable
   */
  declare bpRatingLongComment?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerRatingApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerRatingType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  businessPartnerRatingProcedure: DeserializedType<T, 'Edm.String'>;
  bpRatingValidityEndDate: DeserializedType<T, 'Edm.DateTime'>;
  businessPartnerRatingGrade?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerRatingTrend?: DeserializedType<T, 'Edm.String'> | null;
  bpRatingValidityStartDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  bpRatingCreationDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  businessPartnerRatingComment?: DeserializedType<T, 'Edm.String'> | null;
  businessPartnerRatingIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpRatingIsValidOnKeyDate?: DeserializedType<T, 'Edm.Boolean'> | null;
  businessPartnerRatingKeyDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  businessPartnerRatingIsExpired?: DeserializedType<T, 'Edm.Boolean'> | null;
  bpRatingLongComment?: DeserializedType<T, 'Edm.String'> | null;
}
