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
import { BpCreditWorthiness } from './BpCreditWorthiness';

/**
 * Request builder class for operations supported on the {@link BpCreditWorthiness} entity.
 */
export class BpCreditWorthinessRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpCreditWorthiness<T>, T> {
  /**
   * Returns a request builder for querying all `BpCreditWorthiness` entities.
   * @returns A request builder for creating requests to retrieve all `BpCreditWorthiness` entities.
   */
  getAll(): GetAllRequestBuilder<BpCreditWorthiness<T>, T> {
    return new GetAllRequestBuilder<BpCreditWorthiness<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `BpCreditWorthiness` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpCreditWorthiness`.
   */
  create(
    entity: BpCreditWorthiness<T>,
  ): CreateRequestBuilder<BpCreditWorthiness<T>, T> {
    return new CreateRequestBuilder<BpCreditWorthiness<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpCreditWorthiness` entity based on its keys.
   * @param businessPartner Key property. See {@link BpCreditWorthiness.businessPartner}.
   * @returns A request builder for creating requests to retrieve one `BpCreditWorthiness` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpCreditWorthiness<T>, T> {
    return new GetByKeyRequestBuilder<BpCreditWorthiness<T>, T>(
      this.entityApi,
      { BusinessPartner: businessPartner },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpCreditWorthiness`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpCreditWorthiness`.
   */
  update(
    entity: BpCreditWorthiness<T>,
  ): UpdateRequestBuilder<BpCreditWorthiness<T>, T> {
    return new UpdateRequestBuilder<BpCreditWorthiness<T>, T>(
      this.entityApi,
      entity,
    );
  }
}
