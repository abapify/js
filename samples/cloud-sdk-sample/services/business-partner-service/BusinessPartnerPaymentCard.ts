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
import type { BusinessPartnerPaymentCardApi } from './BusinessPartnerPaymentCardApi';

/**
 * This class represents the entity "A_BusinessPartnerPaymentCard" of service "API_BUSINESS_PARTNER".
 */
export class BusinessPartnerPaymentCard<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements BusinessPartnerPaymentCardType<T>
{
  /**
   * Technical entity name for BusinessPartnerPaymentCard.
   */
  static override _entityName = 'A_BusinessPartnerPaymentCard';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the BusinessPartnerPaymentCard entity.
   */
  static _keys = [
    'BusinessPartner',
    'PaymentCardID',
    'PaymentCardType',
    'CardNumber',
  ];
  /**
   * Business Partner Number.
   * Maximum length: 10.
   */
  declare businessPartner: DeserializedType<T, 'Edm.String'>;
  /**
   * Payment Card ID.
   * Maximum length: 6.
   */
  declare paymentCardId: DeserializedType<T, 'Edm.String'>;
  /**
   * Payment Card Type.
   * Maximum length: 4.
   */
  declare paymentCardType: DeserializedType<T, 'Edm.String'>;
  /**
   * Payment Cards: Card Number.
   * Maximum length: 25.
   */
  declare cardNumber: DeserializedType<T, 'Edm.String'>;
  /**
   * BP: Standard Payment Card.
   * @nullable
   */
  declare isStandardCard?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Description of Credit Card Details.
   * Maximum length: 40.
   * @nullable
   */
  declare cardDescription?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment cards: Valid from.
   * @nullable
   */
  declare validityDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Payment Cards: Valid To.
   * @nullable
   */
  declare validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Payment Cards: Name of Cardholder.
   * Maximum length: 40.
   * @nullable
   */
  declare cardHolder?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment cards: Issuing bank.
   * Maximum length: 40.
   * @nullable
   */
  declare cardIssuingBank?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Payment Cards: Date of Issue.
   * @nullable
   */
  declare cardIssueDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  /**
   * Payment Cards: Reason for Payment Card Lock.
   * Maximum length: 2.
   * @nullable
   */
  declare paymentCardLock?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Masked Payment Card Number ( Digital Payment ).
   * Maximum length: 25.
   * @nullable
   */
  declare maskedCardNumber?: DeserializedType<T, 'Edm.String'> | null;

  constructor(_entityApi: BusinessPartnerPaymentCardApi<T>) {
    super(_entityApi);
  }
}

export interface BusinessPartnerPaymentCardType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  businessPartner: DeserializedType<T, 'Edm.String'>;
  paymentCardId: DeserializedType<T, 'Edm.String'>;
  paymentCardType: DeserializedType<T, 'Edm.String'>;
  cardNumber: DeserializedType<T, 'Edm.String'>;
  isStandardCard?: DeserializedType<T, 'Edm.Boolean'> | null;
  cardDescription?: DeserializedType<T, 'Edm.String'> | null;
  validityDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  validityEndDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  cardHolder?: DeserializedType<T, 'Edm.String'> | null;
  cardIssuingBank?: DeserializedType<T, 'Edm.String'> | null;
  cardIssueDate?: DeserializedType<T, 'Edm.DateTime'> | null;
  paymentCardLock?: DeserializedType<T, 'Edm.String'> | null;
  maskedCardNumber?: DeserializedType<T, 'Edm.String'> | null;
}
