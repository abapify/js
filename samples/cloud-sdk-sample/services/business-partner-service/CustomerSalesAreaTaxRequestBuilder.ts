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
import { CustomerSalesAreaTax } from './CustomerSalesAreaTax';

/**
 * Request builder class for operations supported on the {@link CustomerSalesAreaTax} entity.
 */
export class CustomerSalesAreaTaxRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustomerSalesAreaTax<T>, T> {
  /**
   * Returns a request builder for querying all `CustomerSalesAreaTax` entities.
   * @returns A request builder for creating requests to retrieve all `CustomerSalesAreaTax` entities.
   */
  getAll(): GetAllRequestBuilder<CustomerSalesAreaTax<T>, T> {
    return new GetAllRequestBuilder<CustomerSalesAreaTax<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `CustomerSalesAreaTax` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `CustomerSalesAreaTax`.
   */
  create(
    entity: CustomerSalesAreaTax<T>,
  ): CreateRequestBuilder<CustomerSalesAreaTax<T>, T> {
    return new CreateRequestBuilder<CustomerSalesAreaTax<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `CustomerSalesAreaTax` entity based on its keys.
   * @param customer Key property. See {@link CustomerSalesAreaTax.customer}.
   * @param salesOrganization Key property. See {@link CustomerSalesAreaTax.salesOrganization}.
   * @param distributionChannel Key property. See {@link CustomerSalesAreaTax.distributionChannel}.
   * @param division Key property. See {@link CustomerSalesAreaTax.division}.
   * @param departureCountry Key property. See {@link CustomerSalesAreaTax.departureCountry}.
   * @param customerTaxCategory Key property. See {@link CustomerSalesAreaTax.customerTaxCategory}.
   * @returns A request builder for creating requests to retrieve one `CustomerSalesAreaTax` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    salesOrganization: DeserializedType<T, 'Edm.String'>,
    distributionChannel: DeserializedType<T, 'Edm.String'>,
    division: DeserializedType<T, 'Edm.String'>,
    departureCountry: DeserializedType<T, 'Edm.String'>,
    customerTaxCategory: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustomerSalesAreaTax<T>, T> {
    return new GetByKeyRequestBuilder<CustomerSalesAreaTax<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        SalesOrganization: salesOrganization,
        DistributionChannel: distributionChannel,
        Division: division,
        DepartureCountry: departureCountry,
        CustomerTaxCategory: customerTaxCategory,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustomerSalesAreaTax`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustomerSalesAreaTax`.
   */
  update(
    entity: CustomerSalesAreaTax<T>,
  ): UpdateRequestBuilder<CustomerSalesAreaTax<T>, T> {
    return new UpdateRequestBuilder<CustomerSalesAreaTax<T>, T>(
      this.entityApi,
      entity,
    );
  }
}
