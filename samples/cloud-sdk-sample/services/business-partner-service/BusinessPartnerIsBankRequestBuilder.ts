/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  CreateRequestBuilder,
  DeSerializers,
  DefaultDeSerializers,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder,
} from '@sap-cloud-sdk/odata-v2';
import { BusinessPartnerIsBank } from './BusinessPartnerIsBank';

/**
 * Request builder class for operations supported on the {@link BusinessPartnerIsBank} entity.
 */
export class BusinessPartnerIsBankRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BusinessPartnerIsBank<T>, T> {
  /**
   * Returns a request builder for querying all `BusinessPartnerIsBank` entities.
   * @returns A request builder for creating requests to retrieve all `BusinessPartnerIsBank` entities.
   */
  getAll(): GetAllRequestBuilder<BusinessPartnerIsBank<T>, T> {
    return new GetAllRequestBuilder<BusinessPartnerIsBank<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BusinessPartnerIsBank` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BusinessPartnerIsBank`.
   */
  create(
    entity: BusinessPartnerIsBank<T>,
  ): CreateRequestBuilder<BusinessPartnerIsBank<T>, T> {
    return new CreateRequestBuilder<BusinessPartnerIsBank<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BusinessPartnerIsBank` entity based on its keys.
   * @param businessPartner Key property. See {@link BusinessPartnerIsBank.businessPartner}.
   * @returns A request builder for creating requests to retrieve one `BusinessPartnerIsBank` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BusinessPartnerIsBank<T>, T> {
    return new GetByKeyRequestBuilder<BusinessPartnerIsBank<T>, T>(
      this.entityApi,
      { BusinessPartner: businessPartner },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BusinessPartnerIsBank`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BusinessPartnerIsBank`.
   */
  update(
    entity: BusinessPartnerIsBank<T>,
  ): UpdateRequestBuilder<BusinessPartnerIsBank<T>, T> {
    return new UpdateRequestBuilder<BusinessPartnerIsBank<T>, T>(
      this.entityApi,
      entity,
    );
  }
}
