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
import { CustomerUnloadingPoint } from './CustomerUnloadingPoint';

/**
 * Request builder class for operations supported on the {@link CustomerUnloadingPoint} entity.
 */
export class CustomerUnloadingPointRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustomerUnloadingPoint<T>, T> {
  /**
   * Returns a request builder for querying all `CustomerUnloadingPoint` entities.
   * @returns A request builder for creating requests to retrieve all `CustomerUnloadingPoint` entities.
   */
  getAll(): GetAllRequestBuilder<CustomerUnloadingPoint<T>, T> {
    return new GetAllRequestBuilder<CustomerUnloadingPoint<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `CustomerUnloadingPoint` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `CustomerUnloadingPoint`.
   */
  create(
    entity: CustomerUnloadingPoint<T>,
  ): CreateRequestBuilder<CustomerUnloadingPoint<T>, T> {
    return new CreateRequestBuilder<CustomerUnloadingPoint<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `CustomerUnloadingPoint` entity based on its keys.
   * @param customer Key property. See {@link CustomerUnloadingPoint.customer}.
   * @param unloadingPointName Key property. See {@link CustomerUnloadingPoint.unloadingPointName}.
   * @returns A request builder for creating requests to retrieve one `CustomerUnloadingPoint` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    unloadingPointName: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustomerUnloadingPoint<T>, T> {
    return new GetByKeyRequestBuilder<CustomerUnloadingPoint<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        UnloadingPointName: unloadingPointName,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustomerUnloadingPoint`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustomerUnloadingPoint`.
   */
  update(
    entity: CustomerUnloadingPoint<T>,
  ): UpdateRequestBuilder<CustomerUnloadingPoint<T>, T> {
    return new UpdateRequestBuilder<CustomerUnloadingPoint<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `CustomerUnloadingPoint`.
   * @param customer Key property. See {@link CustomerUnloadingPoint.customer}.
   * @param unloadingPointName Key property. See {@link CustomerUnloadingPoint.unloadingPointName}.
   * @returns A request builder for creating requests that delete an entity of type `CustomerUnloadingPoint`.
   */
  delete(
    customer: string,
    unloadingPointName: string,
  ): DeleteRequestBuilder<CustomerUnloadingPoint<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `CustomerUnloadingPoint`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `CustomerUnloadingPoint` by taking the entity as a parameter.
   */
  delete(
    entity: CustomerUnloadingPoint<T>,
  ): DeleteRequestBuilder<CustomerUnloadingPoint<T>, T>;
  delete(
    customerOrEntity: any,
    unloadingPointName?: string,
  ): DeleteRequestBuilder<CustomerUnloadingPoint<T>, T> {
    return new DeleteRequestBuilder<CustomerUnloadingPoint<T>, T>(
      this.entityApi,
      customerOrEntity instanceof CustomerUnloadingPoint
        ? customerOrEntity
        : {
            Customer: customerOrEntity!,
            UnloadingPointName: unloadingPointName!,
          },
    );
  }
}
