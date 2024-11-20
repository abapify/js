/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
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
import { BpFinancialServicesExtn } from './BpFinancialServicesExtn';

/**
 * Request builder class for operations supported on the {@link BpFinancialServicesExtn} entity.
 */
export class BpFinancialServicesExtnRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpFinancialServicesExtn<T>, T> {
  /**
   * Returns a request builder for querying all `BpFinancialServicesExtn` entities.
   * @returns A request builder for creating requests to retrieve all `BpFinancialServicesExtn` entities.
   */
  getAll(): GetAllRequestBuilder<BpFinancialServicesExtn<T>, T> {
    return new GetAllRequestBuilder<BpFinancialServicesExtn<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BpFinancialServicesExtn` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpFinancialServicesExtn`.
   */
  create(
    entity: BpFinancialServicesExtn<T>,
  ): CreateRequestBuilder<BpFinancialServicesExtn<T>, T> {
    return new CreateRequestBuilder<BpFinancialServicesExtn<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BpFinancialServicesExtn` entity based on its keys.
   * @param businessPartner Key property. See {@link BpFinancialServicesExtn.businessPartner}.
   * @returns A request builder for creating requests to retrieve one `BpFinancialServicesExtn` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<BpFinancialServicesExtn<T>, T> {
    return new GetByKeyRequestBuilder<BpFinancialServicesExtn<T>, T>(
      this.entityApi,
      { BusinessPartner: businessPartner },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BpFinancialServicesExtn`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpFinancialServicesExtn`.
   */
  update(
    entity: BpFinancialServicesExtn<T>,
  ): UpdateRequestBuilder<BpFinancialServicesExtn<T>, T> {
    return new UpdateRequestBuilder<BpFinancialServicesExtn<T>, T>(
      this.entityApi,
      entity,
    );
  }
}
