/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeSerializers,
  DefaultDeSerializers,
  DeleteRequestBuilder,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder,
} from '@sap-cloud-sdk/odata-v2';
import { BusinessPartnerPaymentCard } from './BusinessPartnerPaymentCard';

/**
 * Request builder class for operations supported on the {@link BusinessPartnerPaymentCard} entity.
 */
export class BusinessPartnerPaymentCardRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BusinessPartnerPaymentCard<T>, T> {
  /**
   * Returns a request builder for querying all `BusinessPartnerPaymentCard` entities.
   * @returns A request builder for creating requests to retrieve all `BusinessPartnerPaymentCard` entities.
   */
  getAll(): GetAllRequestBuilder<BusinessPartnerPaymentCard<T>, T> {
    return new GetAllRequestBuilder<BusinessPartnerPaymentCard<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BusinessPartnerPaymentCard` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BusinessPartnerPaymentCard`.
   */
  create(
    entity: BusinessPartnerPaymentCard<T>,
  ): CreateRequestBuilder<BusinessPartnerPaymentCard<T>, T> {
    return new CreateRequestBuilder<BusinessPartnerPaymentCard<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BusinessPartnerPaymentCard` entity based on its keys.
   * @param businessPartner Key property. See {@link BusinessPartnerPaymentCard.businessPartner}.
   * @param paymentCardId Key property. See {@link BusinessPartnerPaymentCard.paymentCardId}.
   * @param paymentCardType Key property. See {@link BusinessPartnerPaymentCard.paymentCardType}.
   * @param cardNumber Key property. See {@link BusinessPartnerPaymentCard.cardNumber}.
   * @returns A request builder for creating requests to retrieve one `BusinessPartnerPaymentCard` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    paymentCardId: DeserializedType<T, 'Edm.String'>,
    paymentCardType: DeserializedType<T, 'Edm.String'>,
    cardNumber: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BusinessPartnerPaymentCard<T>, T> {
    return new GetByKeyRequestBuilder<BusinessPartnerPaymentCard<T>, T>(
      this.entityApi,
      {
        BusinessPartner: businessPartner,
        PaymentCardID: paymentCardId,
        PaymentCardType: paymentCardType,
        CardNumber: cardNumber,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BusinessPartnerPaymentCard`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BusinessPartnerPaymentCard`.
   */
  update(
    entity: BusinessPartnerPaymentCard<T>,
  ): UpdateRequestBuilder<BusinessPartnerPaymentCard<T>, T> {
    return new UpdateRequestBuilder<BusinessPartnerPaymentCard<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerPaymentCard`.
   * @param businessPartner Key property. See {@link BusinessPartnerPaymentCard.businessPartner}.
   * @param paymentCardId Key property. See {@link BusinessPartnerPaymentCard.paymentCardId}.
   * @param paymentCardType Key property. See {@link BusinessPartnerPaymentCard.paymentCardType}.
   * @param cardNumber Key property. See {@link BusinessPartnerPaymentCard.cardNumber}.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerPaymentCard`.
   */
  delete(
    businessPartner: string,
    paymentCardId: string,
    paymentCardType: string,
    cardNumber: string,
  ): DeleteRequestBuilder<BusinessPartnerPaymentCard<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerPaymentCard`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerPaymentCard` by taking the entity as a parameter.
   */
  delete(
    entity: BusinessPartnerPaymentCard<T>,
  ): DeleteRequestBuilder<BusinessPartnerPaymentCard<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    paymentCardId?: string,
    paymentCardType?: string,
    cardNumber?: string,
  ): DeleteRequestBuilder<BusinessPartnerPaymentCard<T>, T> {
    return new DeleteRequestBuilder<BusinessPartnerPaymentCard<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BusinessPartnerPaymentCard
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            PaymentCardID: paymentCardId!,
            PaymentCardType: paymentCardType!,
            CardNumber: cardNumber!,
          },
    );
  }
}
