/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { Moment } from 'moment';
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
import { BusinessPartnerRating } from './BusinessPartnerRating';

/**
 * Request builder class for operations supported on the {@link BusinessPartnerRating} entity.
 */
export class BusinessPartnerRatingRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BusinessPartnerRating<T>, T> {
  /**
   * Returns a request builder for querying all `BusinessPartnerRating` entities.
   * @returns A request builder for creating requests to retrieve all `BusinessPartnerRating` entities.
   */
  getAll(): GetAllRequestBuilder<BusinessPartnerRating<T>, T> {
    return new GetAllRequestBuilder<BusinessPartnerRating<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BusinessPartnerRating` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BusinessPartnerRating`.
   */
  create(
    entity: BusinessPartnerRating<T>,
  ): CreateRequestBuilder<BusinessPartnerRating<T>, T> {
    return new CreateRequestBuilder<BusinessPartnerRating<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BusinessPartnerRating` entity based on its keys.
   * @param businessPartner Key property. See {@link BusinessPartnerRating.businessPartner}.
   * @param businessPartnerRatingProcedure Key property. See {@link BusinessPartnerRating.businessPartnerRatingProcedure}.
   * @param bpRatingValidityEndDate Key property. See {@link BusinessPartnerRating.bpRatingValidityEndDate}.
   * @returns A request builder for creating requests to retrieve one `BusinessPartnerRating` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    businessPartnerRatingProcedure: DeserializedType<T, 'Edm.String'>,
    bpRatingValidityEndDate: DeserializedType<T, 'Edm.DateTime'>,
  ): GetByKeyRequestBuilder<BusinessPartnerRating<T>, T> {
    return new GetByKeyRequestBuilder<BusinessPartnerRating<T>, T>(
      this.entityApi,
      {
        BusinessPartner: businessPartner,
        BusinessPartnerRatingProcedure: businessPartnerRatingProcedure,
        BPRatingValidityEndDate: bpRatingValidityEndDate,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BusinessPartnerRating`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BusinessPartnerRating`.
   */
  update(
    entity: BusinessPartnerRating<T>,
  ): UpdateRequestBuilder<BusinessPartnerRating<T>, T> {
    return new UpdateRequestBuilder<BusinessPartnerRating<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerRating`.
   * @param businessPartner Key property. See {@link BusinessPartnerRating.businessPartner}.
   * @param businessPartnerRatingProcedure Key property. See {@link BusinessPartnerRating.businessPartnerRatingProcedure}.
   * @param bpRatingValidityEndDate Key property. See {@link BusinessPartnerRating.bpRatingValidityEndDate}.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerRating`.
   */
  delete(
    businessPartner: string,
    businessPartnerRatingProcedure: string,
    bpRatingValidityEndDate: Moment,
  ): DeleteRequestBuilder<BusinessPartnerRating<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerRating`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerRating` by taking the entity as a parameter.
   */
  delete(
    entity: BusinessPartnerRating<T>,
  ): DeleteRequestBuilder<BusinessPartnerRating<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    businessPartnerRatingProcedure?: string,
    bpRatingValidityEndDate?: Moment,
  ): DeleteRequestBuilder<BusinessPartnerRating<T>, T> {
    return new DeleteRequestBuilder<BusinessPartnerRating<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BusinessPartnerRating
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            BusinessPartnerRatingProcedure: businessPartnerRatingProcedure!,
            BPRatingValidityEndDate: bpRatingValidityEndDate!,
          },
    );
  }
}
