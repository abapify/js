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
import { CustAddrDepdntExtIdentifier } from './CustAddrDepdntExtIdentifier';

/**
 * Request builder class for operations supported on the {@link CustAddrDepdntExtIdentifier} entity.
 */
export class CustAddrDepdntExtIdentifierRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
  /**
   * Returns a request builder for querying all `CustAddrDepdntExtIdentifier` entities.
   * @returns A request builder for creating requests to retrieve all `CustAddrDepdntExtIdentifier` entities.
   */
  getAll(): GetAllRequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
    return new GetAllRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `CustAddrDepdntExtIdentifier` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `CustAddrDepdntExtIdentifier`.
   */
  create(
    entity: CustAddrDepdntExtIdentifier<T>,
  ): CreateRequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
    return new CreateRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `CustAddrDepdntExtIdentifier` entity based on its keys.
   * @param customer Key property. See {@link CustAddrDepdntExtIdentifier.customer}.
   * @param addressId Key property. See {@link CustAddrDepdntExtIdentifier.addressId}.
   * @returns A request builder for creating requests to retrieve one `CustAddrDepdntExtIdentifier` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
    return new GetByKeyRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        AddressID: addressId,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustAddrDepdntExtIdentifier`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustAddrDepdntExtIdentifier`.
   */
  update(
    entity: CustAddrDepdntExtIdentifier<T>,
  ): UpdateRequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
    return new UpdateRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `CustAddrDepdntExtIdentifier`.
   * @param customer Key property. See {@link CustAddrDepdntExtIdentifier.customer}.
   * @param addressId Key property. See {@link CustAddrDepdntExtIdentifier.addressId}.
   * @returns A request builder for creating requests that delete an entity of type `CustAddrDepdntExtIdentifier`.
   */
  delete(
    customer: string,
    addressId: string,
  ): DeleteRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `CustAddrDepdntExtIdentifier`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `CustAddrDepdntExtIdentifier` by taking the entity as a parameter.
   */
  delete(
    entity: CustAddrDepdntExtIdentifier<T>,
  ): DeleteRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>;
  delete(
    customerOrEntity: any,
    addressId?: string,
  ): DeleteRequestBuilder<CustAddrDepdntExtIdentifier<T>, T> {
    return new DeleteRequestBuilder<CustAddrDepdntExtIdentifier<T>, T>(
      this.entityApi,
      customerOrEntity instanceof CustAddrDepdntExtIdentifier
        ? customerOrEntity
        : {
            Customer: customerOrEntity!,
            AddressID: addressId!,
          },
    );
  }
}
