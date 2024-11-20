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
import { BpAddressIndependentWebsite } from './BpAddressIndependentWebsite';

/**
 * Request builder class for operations supported on the {@link BpAddressIndependentWebsite} entity.
 */
export class BpAddressIndependentWebsiteRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpAddressIndependentWebsite<T>, T> {
  /**
   * Returns a request builder for querying all `BpAddressIndependentWebsite` entities.
   * @returns A request builder for creating requests to retrieve all `BpAddressIndependentWebsite` entities.
   */
  getAll(): GetAllRequestBuilder<BpAddressIndependentWebsite<T>, T> {
    return new GetAllRequestBuilder<BpAddressIndependentWebsite<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpAddressIndependentWebsite` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpAddressIndependentWebsite`.
   */
  create(
    entity: BpAddressIndependentWebsite<T>,
  ): CreateRequestBuilder<BpAddressIndependentWebsite<T>, T> {
    return new CreateRequestBuilder<BpAddressIndependentWebsite<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpAddressIndependentWebsite` entity based on its keys.
   * @param businessPartner Key property. See {@link BpAddressIndependentWebsite.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentWebsite.addressId}.
   * @param person Key property. See {@link BpAddressIndependentWebsite.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentWebsite.ordinalNumber}.
   * @returns A request builder for creating requests to retrieve one `BpAddressIndependentWebsite` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    person: DeserializedType<T, 'Edm.String'>,
    ordinalNumber: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpAddressIndependentWebsite<T>, T> {
    return new GetByKeyRequestBuilder<BpAddressIndependentWebsite<T>, T>(
      this.entityApi,
      {
        BusinessPartner: businessPartner,
        AddressID: addressId,
        Person: person,
        OrdinalNumber: ordinalNumber,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpAddressIndependentWebsite`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpAddressIndependentWebsite`.
   */
  update(
    entity: BpAddressIndependentWebsite<T>,
  ): UpdateRequestBuilder<BpAddressIndependentWebsite<T>, T> {
    return new UpdateRequestBuilder<BpAddressIndependentWebsite<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentWebsite`.
   * @param businessPartner Key property. See {@link BpAddressIndependentWebsite.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentWebsite.addressId}.
   * @param person Key property. See {@link BpAddressIndependentWebsite.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentWebsite.ordinalNumber}.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentWebsite`.
   */
  delete(
    businessPartner: string,
    addressId: string,
    person: string,
    ordinalNumber: string,
  ): DeleteRequestBuilder<BpAddressIndependentWebsite<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentWebsite`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentWebsite` by taking the entity as a parameter.
   */
  delete(
    entity: BpAddressIndependentWebsite<T>,
  ): DeleteRequestBuilder<BpAddressIndependentWebsite<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
    person?: string,
    ordinalNumber?: string,
  ): DeleteRequestBuilder<BpAddressIndependentWebsite<T>, T> {
    return new DeleteRequestBuilder<BpAddressIndependentWebsite<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpAddressIndependentWebsite
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            AddressID: addressId!,
            Person: person!,
            OrdinalNumber: ordinalNumber!,
          },
    );
  }
}
