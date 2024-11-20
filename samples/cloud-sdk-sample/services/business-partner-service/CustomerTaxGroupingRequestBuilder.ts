/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  DeSerializers,
  DefaultDeSerializers,
  DeleteRequestBuilder,
  DeserializedType,
  GetAllRequestBuilder,
  GetByKeyRequestBuilder,
  RequestBuilder,
  UpdateRequestBuilder,
} from '@sap-cloud-sdk/odata-v2';
import { CustomerTaxGrouping } from './CustomerTaxGrouping';

/**
 * Request builder class for operations supported on the {@link CustomerTaxGrouping} entity.
 */
export class CustomerTaxGroupingRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustomerTaxGrouping<T>, T> {
  /**
   * Returns a request builder for querying all `CustomerTaxGrouping` entities.
   * @returns A request builder for creating requests to retrieve all `CustomerTaxGrouping` entities.
   */
  getAll(): GetAllRequestBuilder<CustomerTaxGrouping<T>, T> {
    return new GetAllRequestBuilder<CustomerTaxGrouping<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for retrieving one `CustomerTaxGrouping` entity based on its keys.
   * @param customer Key property. See {@link CustomerTaxGrouping.customer}.
   * @param customerTaxGroupingCode Key property. See {@link CustomerTaxGrouping.customerTaxGroupingCode}.
   * @returns A request builder for creating requests to retrieve one `CustomerTaxGrouping` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    customerTaxGroupingCode: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustomerTaxGrouping<T>, T> {
    return new GetByKeyRequestBuilder<CustomerTaxGrouping<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        CustomerTaxGroupingCode: customerTaxGroupingCode,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustomerTaxGrouping`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustomerTaxGrouping`.
   */
  update(
    entity: CustomerTaxGrouping<T>,
  ): UpdateRequestBuilder<CustomerTaxGrouping<T>, T> {
    return new UpdateRequestBuilder<CustomerTaxGrouping<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `CustomerTaxGrouping`.
   * @param customer Key property. See {@link CustomerTaxGrouping.customer}.
   * @param customerTaxGroupingCode Key property. See {@link CustomerTaxGrouping.customerTaxGroupingCode}.
   * @returns A request builder for creating requests that delete an entity of type `CustomerTaxGrouping`.
   */
  delete(
    customer: string,
    customerTaxGroupingCode: string,
  ): DeleteRequestBuilder<CustomerTaxGrouping<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `CustomerTaxGrouping`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `CustomerTaxGrouping` by taking the entity as a parameter.
   */
  delete(
    entity: CustomerTaxGrouping<T>,
  ): DeleteRequestBuilder<CustomerTaxGrouping<T>, T>;
  delete(
    customerOrEntity: any,
    customerTaxGroupingCode?: string,
  ): DeleteRequestBuilder<CustomerTaxGrouping<T>, T> {
    return new DeleteRequestBuilder<CustomerTaxGrouping<T>, T>(
      this.entityApi,
      customerOrEntity instanceof CustomerTaxGrouping
        ? customerOrEntity
        : {
            Customer: customerOrEntity!,
            CustomerTaxGroupingCode: customerTaxGroupingCode!,
          },
    );
  }
}
