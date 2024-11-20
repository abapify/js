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
import { BpAddressIndependentMobile } from './BpAddressIndependentMobile';

/**
 * Request builder class for operations supported on the {@link BpAddressIndependentMobile} entity.
 */
export class BpAddressIndependentMobileRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpAddressIndependentMobile<T>, T> {
  /**
   * Returns a request builder for querying all `BpAddressIndependentMobile` entities.
   * @returns A request builder for creating requests to retrieve all `BpAddressIndependentMobile` entities.
   */
  getAll(): GetAllRequestBuilder<BpAddressIndependentMobile<T>, T> {
    return new GetAllRequestBuilder<BpAddressIndependentMobile<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpAddressIndependentMobile` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpAddressIndependentMobile`.
   */
  create(
    entity: BpAddressIndependentMobile<T>,
  ): CreateRequestBuilder<BpAddressIndependentMobile<T>, T> {
    return new CreateRequestBuilder<BpAddressIndependentMobile<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpAddressIndependentMobile` entity based on its keys.
   * @param businessPartner Key property. See {@link BpAddressIndependentMobile.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentMobile.addressId}.
   * @param person Key property. See {@link BpAddressIndependentMobile.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentMobile.ordinalNumber}.
   * @returns A request builder for creating requests to retrieve one `BpAddressIndependentMobile` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    person: DeserializedType<T, 'Edm.String'>,
    ordinalNumber: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpAddressIndependentMobile<T>, T> {
    return new GetByKeyRequestBuilder<BpAddressIndependentMobile<T>, T>(
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
   * Returns a request builder for updating an entity of type `BpAddressIndependentMobile`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpAddressIndependentMobile`.
   */
  update(
    entity: BpAddressIndependentMobile<T>,
  ): UpdateRequestBuilder<BpAddressIndependentMobile<T>, T> {
    return new UpdateRequestBuilder<BpAddressIndependentMobile<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentMobile`.
   * @param businessPartner Key property. See {@link BpAddressIndependentMobile.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentMobile.addressId}.
   * @param person Key property. See {@link BpAddressIndependentMobile.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentMobile.ordinalNumber}.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentMobile`.
   */
  delete(
    businessPartner: string,
    addressId: string,
    person: string,
    ordinalNumber: string,
  ): DeleteRequestBuilder<BpAddressIndependentMobile<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentMobile`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentMobile` by taking the entity as a parameter.
   */
  delete(
    entity: BpAddressIndependentMobile<T>,
  ): DeleteRequestBuilder<BpAddressIndependentMobile<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
    person?: string,
    ordinalNumber?: string,
  ): DeleteRequestBuilder<BpAddressIndependentMobile<T>, T> {
    return new DeleteRequestBuilder<BpAddressIndependentMobile<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpAddressIndependentMobile
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
