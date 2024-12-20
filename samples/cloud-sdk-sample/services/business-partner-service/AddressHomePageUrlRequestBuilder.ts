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
import { AddressHomePageUrl } from './AddressHomePageUrl';

/**
 * Request builder class for operations supported on the {@link AddressHomePageUrl} entity.
 */
export class AddressHomePageUrlRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<AddressHomePageUrl<T>, T> {
  /**
   * Returns a request builder for querying all `AddressHomePageUrl` entities.
   * @returns A request builder for creating requests to retrieve all `AddressHomePageUrl` entities.
   */
  getAll(): GetAllRequestBuilder<AddressHomePageUrl<T>, T> {
    return new GetAllRequestBuilder<AddressHomePageUrl<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `AddressHomePageUrl` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `AddressHomePageUrl`.
   */
  create(
    entity: AddressHomePageUrl<T>,
  ): CreateRequestBuilder<AddressHomePageUrl<T>, T> {
    return new CreateRequestBuilder<AddressHomePageUrl<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `AddressHomePageUrl` entity based on its keys.
   * @param addressId Key property. See {@link AddressHomePageUrl.addressId}.
   * @param person Key property. See {@link AddressHomePageUrl.person}.
   * @param ordinalNumber Key property. See {@link AddressHomePageUrl.ordinalNumber}.
   * @param validityStartDate Key property. See {@link AddressHomePageUrl.validityStartDate}.
   * @param isDefaultUrlAddress Key property. See {@link AddressHomePageUrl.isDefaultUrlAddress}.
   * @returns A request builder for creating requests to retrieve one `AddressHomePageUrl` entity based on its keys.
   */
  getByKey(
    addressId: DeserializedType<T, 'Edm.String'>,
    person: DeserializedType<T, 'Edm.String'>,
    ordinalNumber: DeserializedType<T, 'Edm.String'>,
    validityStartDate: DeserializedType<T, 'Edm.DateTime'>,
    isDefaultUrlAddress: DeserializedType<T, 'Edm.Boolean'>,
  ): GetByKeyRequestBuilder<AddressHomePageUrl<T>, T> {
    return new GetByKeyRequestBuilder<AddressHomePageUrl<T>, T>(
      this.entityApi,
      {
        AddressID: addressId,
        Person: person,
        OrdinalNumber: ordinalNumber,
        ValidityStartDate: validityStartDate,
        IsDefaultURLAddress: isDefaultUrlAddress,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `AddressHomePageUrl`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `AddressHomePageUrl`.
   */
  update(
    entity: AddressHomePageUrl<T>,
  ): UpdateRequestBuilder<AddressHomePageUrl<T>, T> {
    return new UpdateRequestBuilder<AddressHomePageUrl<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `AddressHomePageUrl`.
   * @param addressId Key property. See {@link AddressHomePageUrl.addressId}.
   * @param person Key property. See {@link AddressHomePageUrl.person}.
   * @param ordinalNumber Key property. See {@link AddressHomePageUrl.ordinalNumber}.
   * @param validityStartDate Key property. See {@link AddressHomePageUrl.validityStartDate}.
   * @param isDefaultUrlAddress Key property. See {@link AddressHomePageUrl.isDefaultUrlAddress}.
   * @returns A request builder for creating requests that delete an entity of type `AddressHomePageUrl`.
   */
  delete(
    addressId: string,
    person: string,
    ordinalNumber: string,
    validityStartDate: Moment,
    isDefaultUrlAddress: boolean,
  ): DeleteRequestBuilder<AddressHomePageUrl<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `AddressHomePageUrl`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `AddressHomePageUrl` by taking the entity as a parameter.
   */
  delete(
    entity: AddressHomePageUrl<T>,
  ): DeleteRequestBuilder<AddressHomePageUrl<T>, T>;
  delete(
    addressIdOrEntity: any,
    person?: string,
    ordinalNumber?: string,
    validityStartDate?: Moment,
    isDefaultUrlAddress?: boolean,
  ): DeleteRequestBuilder<AddressHomePageUrl<T>, T> {
    return new DeleteRequestBuilder<AddressHomePageUrl<T>, T>(
      this.entityApi,
      addressIdOrEntity instanceof AddressHomePageUrl
        ? addressIdOrEntity
        : {
            AddressID: addressIdOrEntity!,
            Person: person!,
            OrdinalNumber: ordinalNumber!,
            ValidityStartDate: validityStartDate!,
            IsDefaultURLAddress: isDefaultUrlAddress!,
          },
    );
  }
}
