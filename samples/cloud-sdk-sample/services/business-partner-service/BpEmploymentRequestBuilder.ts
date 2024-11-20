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
import { BpEmployment } from './BpEmployment';

/**
 * Request builder class for operations supported on the {@link BpEmployment} entity.
 */
export class BpEmploymentRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BpEmployment<T>, T> {
  /**
   * Returns a request builder for querying all `BpEmployment` entities.
   * @returns A request builder for creating requests to retrieve all `BpEmployment` entities.
   */
  getAll(): GetAllRequestBuilder<BpEmployment<T>, T> {
    return new GetAllRequestBuilder<BpEmployment<T>, T>(this.entityApi);
  }

  /**
   * Returns a request builder for creating a `BpEmployment` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BpEmployment`.
   */
  create(entity: BpEmployment<T>): CreateRequestBuilder<BpEmployment<T>, T> {
    return new CreateRequestBuilder<BpEmployment<T>, T>(this.entityApi, entity);
  }

  /**
   * Returns a request builder for retrieving one `BpEmployment` entity based on its keys.
   * @param businessPartner Key property. See {@link BpEmployment.businessPartner}.
   * @param bpEmploymentStartDate Key property. See {@link BpEmployment.bpEmploymentStartDate}.
   * @returns A request builder for creating requests to retrieve one `BpEmployment` entity based on its keys.
   */
  getByKey(
    businessPartner: DeserializedType<T, 'Edm.String'>,
    bpEmploymentStartDate: DeserializedType<T, 'Edm.DateTime'>,
  ): GetByKeyRequestBuilder<BpEmployment<T>, T> {
    return new GetByKeyRequestBuilder<BpEmployment<T>, T>(this.entityApi, {
      BusinessPartner: businessPartner,
      BPEmploymentStartDate: bpEmploymentStartDate,
    });
  }

  /**
   * Returns a request builder for updating an entity of type `BpEmployment`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BpEmployment`.
   */
  update(entity: BpEmployment<T>): UpdateRequestBuilder<BpEmployment<T>, T> {
    return new UpdateRequestBuilder<BpEmployment<T>, T>(this.entityApi, entity);
  }

  /**
   * Returns a request builder for deleting an entity of type `BpEmployment`.
   * @param businessPartner Key property. See {@link BpEmployment.businessPartner}.
   * @param bpEmploymentStartDate Key property. See {@link BpEmployment.bpEmploymentStartDate}.
   * @returns A request builder for creating requests that delete an entity of type `BpEmployment`.
   */
  delete(
    businessPartner: string,
    bpEmploymentStartDate: Moment,
  ): DeleteRequestBuilder<BpEmployment<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BpEmployment`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BpEmployment` by taking the entity as a parameter.
   */
  delete(entity: BpEmployment<T>): DeleteRequestBuilder<BpEmployment<T>, T>;
  delete(
    businessPartnerOrEntity: any,
    bpEmploymentStartDate?: Moment,
  ): DeleteRequestBuilder<BpEmployment<T>, T> {
    return new DeleteRequestBuilder<BpEmployment<T>, T>(
      this.entityApi,
      businessPartnerOrEntity instanceof BpEmployment
        ? businessPartnerOrEntity
        : {
            BusinessPartner: businessPartnerOrEntity!,
            BPEmploymentStartDate: bpEmploymentStartDate!,
          },
    );
  }
}
