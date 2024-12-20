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
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder,
} from '@sap-cloud-sdk/odata-v2';
import { BpContactToAddress } from './BpContactToAddress';

/**
 * Request builder class for operations supported on the {@link BpContactToAddress} entity.
 */
export class BpContactToAddressRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpContactToAddress<T>, T> {
  /**
   * Returns a request builder for querying all `BpContactToAddress` entities.
   * @returns A request builder for creating requests to retrieve all `BpContactToAddress` entities.
   */
  getAll(): GetAllRequestBuilder<BpContactToAddress<T>, T> {
    return new GetAllRequestBuilder<BpContactToAddress<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `BpContactToAddress` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpContactToAddress`.
   */
  create(
    entity: BpContactToAddress<T>,
  ): CreateRequestBuilder<BpContactToAddress<T>, T> {
    return new CreateRequestBuilder<BpContactToAddress<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpContactToAddress` entity based on its keys.
   * @param relationshipNumber Key property. See {@link BpContactToAddress.relationshipNumber}.
   * @param businessPartnerCompany Key property. See {@link BpContactToAddress.businessPartnerCompany}.
   * @param businessPartnerPerson Key property. See {@link BpContactToAddress.businessPartnerPerson}.
   * @param validityEndDate Key property. See {@link BpContactToAddress.validityEndDate}.
   * @param addressId Key property. See {@link BpContactToAddress.addressId}.
   * @returns A request builder for creating requests to retrieve one `BpContactToAddress` entity based on its keys.
   */
  getByKey(
    relationshipNumber: DeserializedType<T, 'Edm.String'>,
    businessPartnerCompany: DeserializedType<T, 'Edm.String'>,
    businessPartnerPerson: DeserializedType<T, 'Edm.String'>,
    validityEndDate: DeserializedType<T, 'Edm.DateTime'>,
    addressId: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpContactToAddress<T>, T> {
    return new GetByKeyRequestBuilder<BpContactToAddress<T>, T>(
      this.entityApi,
      {
        RelationshipNumber: relationshipNumber,
        BusinessPartnerCompany: businessPartnerCompany,
        BusinessPartnerPerson: businessPartnerPerson,
        ValidityEndDate: validityEndDate,
        AddressID: addressId,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpContactToAddress`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpContactToAddress`.
   */
  update(
    entity: BpContactToAddress<T>,
  ): UpdateRequestBuilder<BpContactToAddress<T>, T> {
    return new UpdateRequestBuilder<BpContactToAddress<T>, T>(
      this.entityApi,
      entity,
    );
  }
}
