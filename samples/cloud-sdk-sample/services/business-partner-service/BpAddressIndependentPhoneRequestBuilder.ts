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
import { BpAddressIndependentPhone } from './BpAddressIndependentPhone';

/**
 * Request builder class for operations supported on the {@link BpAddressIndependentPhone} entity.
 */
export class BpAddressIndependentPhoneRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpAddressIndependentPhone<T>, T> {
  /**
   * Returns a request builder for querying all `BpAddressIndependentPhone` entities.
   * @returns A request builder for creating requests to retrieve all `BpAddressIndependentPhone` entities.
   */
  getAll(): GetAllRequestBuilder<BpAddressIndependentPhone<T>, T> {
    return new GetAllRequestBuilder<BpAddressIndependentPhone<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpAddressIndependentPhone` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpAddressIndependentPhone`.
   */
  create(
    entity: BpAddressIndependentPhone<T>,
  ): CreateRequestBuilder<BpAddressIndependentPhone<T>, T> {
    return new CreateRequestBuilder<BpAddressIndependentPhone<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpAddressIndependentPhone` entity based on its keys.
   * @param businessPartner Key property. See {@link BpAddressIndependentPhone.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentPhone.addressId}.
   * @param person Key property. See {@link BpAddressIndependentPhone.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentPhone.ordinalNumber}.
   * @returns A request builder for creating requests to retrieve one `BpAddressIndependentPhone` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    person: DeserializedType<T, 'Edm.String'>,
    ordinalNumber: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpAddressIndependentPhone<T>, T> {
    return new GetByKeyRequestBuilder<BpAddressIndependentPhone<T>, T>(
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
   * Returns a request builder for updating an entity of type `BpAddressIndependentPhone`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpAddressIndependentPhone`.
   */
  update(
    entity: BpAddressIndependentPhone<T>,
  ): UpdateRequestBuilder<BpAddressIndependentPhone<T>, T> {
    return new UpdateRequestBuilder<BpAddressIndependentPhone<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentPhone`.
   * @param businessPartner Key property. See {@link BpAddressIndependentPhone.businessPartner}.
   * @param addressId Key property. See {@link BpAddressIndependentPhone.addressId}.
   * @param person Key property. See {@link BpAddressIndependentPhone.person}.
   * @param ordinalNumber Key property. See {@link BpAddressIndependentPhone.ordinalNumber}.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentPhone`.
   */
  delete(
    businessPartner: string,
    addressId: string,
    person: string,
    ordinalNumber: string,
  ): DeleteRequestBuilder<BpAddressIndependentPhone<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpAddressIndependentPhone`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpAddressIndependentPhone` by taking the entity as a parameter.
   */
  delete(
    entity: BpAddressIndependentPhone<T>,
  ): DeleteRequestBuilder<BpAddressIndependentPhone<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    addressId?: string,
    person?: string,
    ordinalNumber?: string,
  ): DeleteRequestBuilder<BpAddressIndependentPhone<T>, T> {
    return new DeleteRequestBuilder<BpAddressIndependentPhone<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpAddressIndependentPhone
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
