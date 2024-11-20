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
import { CustUnldgPtAddrDepdntInfo } from './CustUnldgPtAddrDepdntInfo';

/**
 * Request builder class for operations supported on the {@link CustUnldgPtAddrDepdntInfo} entity.
 */
export class CustUnldgPtAddrDepdntInfoRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
  /**
   * Returns a request builder for querying all `CustUnldgPtAddrDepdntInfo` entities.
   * @returns A request builder for creating requests to retrieve all `CustUnldgPtAddrDepdntInfo` entities.
   */
  getAll(): GetAllRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
    return new GetAllRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `CustUnldgPtAddrDepdntInfo` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `CustUnldgPtAddrDepdntInfo`.
   */
  create(
    entity: CustUnldgPtAddrDepdntInfo<T>,
  ): CreateRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
    return new CreateRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `CustUnldgPtAddrDepdntInfo` entity based on its keys.
   * @param customer Key property. See {@link CustUnldgPtAddrDepdntInfo.customer}.
   * @param addressId Key property. See {@link CustUnldgPtAddrDepdntInfo.addressId}.
   * @param unloadingPointName Key property. See {@link CustUnldgPtAddrDepdntInfo.unloadingPointName}.
   * @returns A request builder for creating requests to retrieve one `CustUnldgPtAddrDepdntInfo` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    unloadingPointName: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
    return new GetByKeyRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        AddressID: addressId,
        UnloadingPointName: unloadingPointName,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustUnldgPtAddrDepdntInfo`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustUnldgPtAddrDepdntInfo`.
   */
  update(
    entity: CustUnldgPtAddrDepdntInfo<T>,
  ): UpdateRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
    return new UpdateRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `CustUnldgPtAddrDepdntInfo`.
   * @param customer Key property. See {@link CustUnldgPtAddrDepdntInfo.customer}.
   * @param addressId Key property. See {@link CustUnldgPtAddrDepdntInfo.addressId}.
   * @param unloadingPointName Key property. See {@link CustUnldgPtAddrDepdntInfo.unloadingPointName}.
   * @returns A request builder for creating requests that delete an entity of type `CustUnldgPtAddrDepdntInfo`.
   */
  delete(
    customer: string,
    addressId: string,
    unloadingPointName: string,
  ): DeleteRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `CustUnldgPtAddrDepdntInfo`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `CustUnldgPtAddrDepdntInfo` by taking the entity as a parameter.
   */
  delete(
    entity: CustUnldgPtAddrDepdntInfo<T>,
  ): DeleteRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>;
  delete(
    customerOrEntity: any,
    addressId?: string,
    unloadingPointName?: string,
  ): DeleteRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T> {
    return new DeleteRequestBuilder<CustUnldgPtAddrDepdntInfo<T>, T>(
      this.entityApi,
      customerOrEntity instanceof CustUnldgPtAddrDepdntInfo
        ? customerOrEntity
        : {
            Customer: customerOrEntity!,
            AddressID: addressId!,
            UnloadingPointName: unloadingPointName!,
          },
    );
  }
}
