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
import { BpAddressIndependentEmail } from './BpAddressIndependentEmail';

/**
 * Request builder class for operations supported on the {@link BpAddressIndependentEmail} entity.
 */
export class BpAddressIndependentEmailRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpAddressIndependentEmail<T>, T> {
  /**
   * Returns a request builder for querying all `BpAddressIndependentEmail` entities.
   * @returns A request builder for creating requests to retrieve all `BpAddressIndependentEmail` entities.
   */
  getAll(): GetAllRequestBuilder<BpAddressIndependentEmail<T>, T> {
    return new GetAllRequestBuilder<BpAddressIndependentEmail<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpAddressIndependentEmail` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpAddressIndependentEmail`.
   */
  create(
    entity: BpAddressIndependentEmail<T>,
  ): CreateRequestBuilder<BpAddressIndependentEmail<T>, T> {
    return new CreateRequestBuilder<BpAddressIndependentEmail<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpAddressIndependentEmail` entity based on its keys.
   * @param businessPartner Key property. See {@link BpAddressIndependentEmail.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentEmail.addressId}.
   * @param person Key property. See {@link BpAddressIndependentEmail.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentEmail.ordinalNumber}.
   * @returns A request builder for creating requests to retrieve one `BpAddressIndependentEmail` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    person: DeserializedType<T, 'Edm.String'>,
    ordinalNumber: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpAddressIndependentEmail<T>, T> {
    return new GetByKeyRequestBuilder<BpAddressIndependentEmail<T>, T>(
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
   * Returns a request builder for updating an entity of type `BpAddressIndependentEmail`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpAddressIndependentEmail`.
   */
  update(
    entity: BpAddressIndependentEmail<T>,
  ): UpdateRequestBuilder<BpAddressIndependentEmail<T>, T> {
    return new UpdateRequestBuilder<BpAddressIndependentEmail<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentEmail`.
   * @param businessPartner Key property. See {@link BpAddressIndependentEmail.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentEmail.addressId}.
   * @param person Key property. See {@link BpAddressIndependentEmail.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentEmail.ordinalNumber}.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentEmail`.
   */
  delete(
    businessPartner: string,
    addressId: string,
    person: string,
    ordinalNumber: string,
  ): DeleteRequestBuilder<BpAddressIndependentEmail<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentEmail`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentEmail` by taking the entity as a parameter.
   */
  delete(
    entity: BpAddressIndependentEmail<T>,
  ): DeleteRequestBuilder<BpAddressIndependentEmail<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
    person?: string,
    ordinalNumber?: string,
  ): DeleteRequestBuilder<BpAddressIndependentEmail<T>, T> {
    return new DeleteRequestBuilder<BpAddressIndependentEmail<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpAddressIndependentEmail
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
