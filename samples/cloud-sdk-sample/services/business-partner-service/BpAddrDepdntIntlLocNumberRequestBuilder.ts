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
import { BpAddrDepdntIntlLocNumber } from './BpAddrDepdntIntlLocNumber';

/**
 * Request builder class for operations supported on the {@link BpAddrDepdntIntlLocNumber} entity.
 */
export class BpAddrDepdntIntlLocNumberRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
  /**
   * Returns a request builder for querying all `BpAddrDepdntIntlLocNumber` entities.
   * @returns A request builder for creating requests to retrieve all `BpAddrDepdntIntlLocNumber` entities.
   */
  getAll(): GetAllRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
    return new GetAllRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpAddrDepdntIntlLocNumber` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpAddrDepdntIntlLocNumber`.
   */
  create(
    entity: BpAddrDepdntIntlLocNumber<T>,
  ): CreateRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
    return new CreateRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpAddrDepdntIntlLocNumber` entity based on its keys.
   * @param businessPartner Key property. See {@link BpAddrDepdntIntlLocNumber.businessPartner}.
   * @param addressId Key property. See {@link BpAddrDepdntIntlLocNumber.addressId}.
   * @returns A request builder for creating requests to retrieve one `BpAddrDepdntIntlLocNumber` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
    return new GetByKeyRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>(
      this.entityApi,
      {
        BusinessPartner: businessPartner,
        AddressID: addressId,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpAddrDepdntIntlLocNumber`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpAddrDepdntIntlLocNumber`.
   */
  update(
    entity: BpAddrDepdntIntlLocNumber<T>,
  ): UpdateRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
    return new UpdateRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpAddrDepdntIntlLocNumber`.
   * @param businessPartner Key property. See {@link BpAddrDepdntIntlLocNumber.businessPartner}.
   * @param addressId Key property. See {@link BpAddrDepdntIntlLocNumber.addressId}.
   * @returns A request builder for creating requests that delete an entity of type `BpAddrDepdntIntlLocNumber`.
   */
  delete(
    businessPartner: string,
    addressId: string,
  ): DeleteRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpAddrDepdntIntlLocNumber`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpAddrDepdntIntlLocNumber` by taking the entity as a parameter.
   */
  delete(
    entity: BpAddrDepdntIntlLocNumber<T>,
  ): DeleteRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
  ): DeleteRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T> {
    return new DeleteRequestBuilder<BpAddrDepdntIntlLocNumber<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpAddrDepdntIntlLocNumber
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            AddressID: addressId!,
          },
    );
  }
}
