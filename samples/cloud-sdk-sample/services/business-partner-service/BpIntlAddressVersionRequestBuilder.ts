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
import { BpIntlAddressVersion } from './BpIntlAddressVersion';

/**
 * Request builder class for operations supported on the {@link BpIntlAddressVersion} entity.
 */
export class BpIntlAddressVersionRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpIntlAddressVersion<T>, T> {
  /**
   * Returns a request builder for querying all `BpIntlAddressVersion` entities.
   * @returns A request builder for creating requests to retrieve all `BpIntlAddressVersion` entities.
   */
  getAll(): GetAllRequestBuilder<BpIntlAddressVersion<T>, T> {
    return new GetAllRequestBuilder<BpIntlAddressVersion<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `BpIntlAddressVersion` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpIntlAddressVersion`.
   */
  create(
    entity: BpIntlAddressVersion<T>,
  ): CreateRequestBuilder<BpIntlAddressVersion<T>, T> {
    return new CreateRequestBuilder<BpIntlAddressVersion<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpIntlAddressVersion` entity based on its keys.
   * @param businessPartner Key property. See {@link BpIntlAddressVersion.businessPartner}.
   * @param addressId Key property. See {@link BpIntlAddressVersion.addressId}.
   * @param addressRepresentationCode Key property. See {@link BpIntlAddressVersion.addressRepresentationCode}.
   * @returns A request builder for creating requests to retrieve one `BpIntlAddressVersion` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    addressRepresentationCode: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpIntlAddressVersion<T>, T> {
    return new GetByKeyRequestBuilder<BpIntlAddressVersion<T>, T>(
      this.entityApi,
      {
        BusinessPartner: businessPartner,
        AddressID: addressId,
        AddressRepresentationCode: addressRepresentationCode,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpIntlAddressVersion`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpIntlAddressVersion`.
   */
  update(
    entity: BpIntlAddressVersion<T>,
  ): UpdateRequestBuilder<BpIntlAddressVersion<T>, T> {
    return new UpdateRequestBuilder<BpIntlAddressVersion<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpIntlAddressVersion`.
   * @param businessPartner Key property. See {@link BpIntlAddressVersion.businessPartner}.
   * @param addressId Key property. See {@link BpIntlAddressVersion.addressId}.
   * @param addressRepresentationCode Key property. See {@link BpIntlAddressVersion.addressRepresentationCode}.
   * @returns A request builder for creating requests that delete an entity of type `BpIntlAddressVersion`.
   */
  delete(
    businessPartner: string,
    addressId: string,
    addressRepresentationCode: string,
  ): DeleteRequestBuilder<BpIntlAddressVersion<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpIntlAddressVersion`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpIntlAddressVersion` by taking the entity as a parameter.
   */
  delete(
    entity: BpIntlAddressVersion<T>,
  ): DeleteRequestBuilder<BpIntlAddressVersion<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
    addressRepresentationCode?: string,
  ): DeleteRequestBuilder<BpIntlAddressVersion<T>, T> {
    return new DeleteRequestBuilder<BpIntlAddressVersion<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpIntlAddressVersion
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            AddressID: addressId!,
            AddressRepresentationCode: addressRepresentationCode!,
          },
    );
  }
}
