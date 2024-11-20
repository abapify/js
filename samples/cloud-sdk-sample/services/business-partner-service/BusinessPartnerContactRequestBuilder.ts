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
import { BusinessPartnerContact } from './BusinessPartnerContact';

/**
 * Request builder class for operations supported on the {@link BusinessPartnerContact} entity.
 */
export class BusinessPartnerContactRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<BusinessPartnerContact<T>, T> {
  /**
   * Returns a request builder for querying all `BusinessPartnerContact` entities.
   * @returns A request builder for creating requests to retrieve all `BusinessPartnerContact` entities.
   */
  getAll(): GetAllRequestBuilder<BusinessPartnerContact<T>, T> {
    return new GetAllRequestBuilder<BusinessPartnerContact<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `BusinessPartnerContact` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `BusinessPartnerContact`.
   */
  create(
    entity: BusinessPartnerContact<T>,
  ): CreateRequestBuilder<BusinessPartnerContact<T>, T> {
    return new CreateRequestBuilder<BusinessPartnerContact<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `BusinessPartnerContact` entity based on its keys.
   * @param relationshipNumber Key property. See {@link BusinessPartnerContact.relationshipNumber}.
   * @param businessPartnerCompany Key property. See {@link BusinessPartnerContact.businessPartnerCompany}.
   * @param businessPartnerPerson Key property. See {@link BusinessPartnerContact.businessPartnerPerson}.
   * @param validityEndDate Key property. See {@link BusinessPartnerContact.validityEndDate}.
   * @returns A request builder for creating requests to retrieve one `BusinessPartnerContact` entity based on its keys.
   */
  getByKey(
    relationshipNumber: DeserializedType<T, 'Edm.String'>,
    businessPartnerCompany: DeserializedType<T, 'Edm.String'>,
    businessPartnerPerson: DeserializedType<T, 'Edm.String'>,
    validityEndDate: DeserializedType<T, 'Edm.DateTime'>,
  ): GetByKeyRequestBuilder<BusinessPartnerContact<T>, T> {
    return new GetByKeyRequestBuilder<BusinessPartnerContact<T>, T>(
      this.entityApi,
      {
        RelationshipNumber: relationshipNumber,
        BusinessPartnerCompany: businessPartnerCompany,
        BusinessPartnerPerson: businessPartnerPerson,
        ValidityEndDate: validityEndDate,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `BusinessPartnerContact`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `BusinessPartnerContact`.
   */
  update(
    entity: BusinessPartnerContact<T>,
  ): UpdateRequestBuilder<BusinessPartnerContact<T>, T> {
    return new UpdateRequestBuilder<BusinessPartnerContact<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerContact`.
   * @param relationshipNumber Key property. See {@link BusinessPartnerContact.relationshipNumber}.
   * @param businessPartnerCompany Key property. See {@link BusinessPartnerContact.businessPartnerCompany}.
   * @param businessPartnerPerson Key property. See {@link BusinessPartnerContact.businessPartnerPerson}.
   * @param validityEndDate Key property. See {@link BusinessPartnerContact.validityEndDate}.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerContact`.
   */
  delete(
    relationshipNumber: string,
    businessPartnerCompany: string,
    businessPartnerPerson: string,
    validityEndDate: Moment,
  ): DeleteRequestBuilder<BusinessPartnerContact<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `BusinessPartnerContact`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `BusinessPartnerContact` by taking the entity as a parameter.
   */
  delete(
    entity: BusinessPartnerContact<T>,
  ): DeleteRequestBuilder<BusinessPartnerContact<T>, T>;
  delete(
    relationshipNumberOrEntity: any,
    businessPartnerCompany?: string,
    businessPartnerPerson?: string,
    validityEndDate?: Moment,
  ): DeleteRequestBuilder<BusinessPartnerContact<T>, T> {
    return new DeleteRequestBuilder<BusinessPartnerContact<T>, T>(
      this.entityApi,
      relationshipNumberOrEntity instanceof BusinessPartnerContact
        ? relationshipNumberOrEntity
        : {
            RelationshipNumber: relationshipNumberOrEntity!,
            BusinessPartnerCompany: businessPartnerCompany!,
            BusinessPartnerPerson: businessPartnerPerson!,
            ValidityEndDate: validityEndDate!,
          },
    );
  }
}
