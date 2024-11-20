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
import { CustSlsAreaAddrDepdntTaxInfo } from './CustSlsAreaAddrDepdntTaxInfo';

/**
 * Request builder class for operations supported on the {@link CustSlsAreaAddrDepdntTaxInfo} entity.
 */
export class CustSlsAreaAddrDepdntTaxInfoRequestBuilder<
  T extends DeSerializers = DefaultDeSerializers,
> extends RequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
  /**
   * Returns a request builder for querying all `CustSlsAreaAddrDepdntTaxInfo` entities.
   * @returns A request builder for creating requests to retrieve all `CustSlsAreaAddrDepdntTaxInfo` entities.
   */
  getAll(): GetAllRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
    return new GetAllRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>(
      this.entityApi,
    );
  }

  /**
   * Returns a request builder for creating a `CustSlsAreaAddrDepdntTaxInfo` entity.
   * @param entity The entity to be created
   * @returns A request builder for creating requests that create an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   */
  create(
    entity: CustSlsAreaAddrDepdntTaxInfo<T>,
  ): CreateRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
    return new CreateRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for retrieving one `CustSlsAreaAddrDepdntTaxInfo` entity based on its keys.
   * @param customer Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.customer}.
   * @param salesOrganization Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.salesOrganization}.
   * @param distributionChannel Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.distributionChannel}.
   * @param division Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.division}.
   * @param addressId Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.addressId}.
   * @param departureCountry Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.departureCountry}.
   * @param customerTaxCategory Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.customerTaxCategory}.
   * @returns A request builder for creating requests to retrieve one `CustSlsAreaAddrDepdntTaxInfo` entity based on its keys.
   */
  getByKey(
    customer: DeserializedType<T, 'Edm.String'>,
    salesOrganization: DeserializedType<T, 'Edm.String'>,
    distributionChannel: DeserializedType<T, 'Edm.String'>,
    division: DeserializedType<T, 'Edm.String'>,
    addressId: DeserializedType<T, 'Edm.String'>,
    departureCountry: DeserializedType<T, 'Edm.String'>,
    customerTaxCategory: DeserializedType<T, 'Edm.String'>,
  ): GetByKeyRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
    return new GetByKeyRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>(
      this.entityApi,
      {
        Customer: customer,
        SalesOrganization: salesOrganization,
        DistributionChannel: distributionChannel,
        Division: division,
        AddressID: addressId,
        DepartureCountry: departureCountry,
        CustomerTaxCategory: customerTaxCategory,
      },
    );
  }

  /**
   * Returns a request builder for updating an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   * @param entity The entity to be updated
   * @returns A request builder for creating requests that update an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   */
  update(
    entity: CustSlsAreaAddrDepdntTaxInfo<T>,
  ): UpdateRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
    return new UpdateRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>(
      this.entityApi,
      entity,
    );
  }

  /**
   * Returns a request builder for deleting an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   * @param customer Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.customer}.
   * @param salesOrganization Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.salesOrganization}.
   * @param distributionChannel Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.distributionChannel}.
   * @param division Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.division}.
   * @param addressId Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.addressId}.
   * @param departureCountry Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.departureCountry}.
   * @param customerTaxCategory Key property. See {@link CustSlsAreaAddrDepdntTaxInfo.customerTaxCategory}.
   * @returns A request builder for creating requests that delete an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   */
  delete(
    customer: string,
    salesOrganization: string,
    distributionChannel: string,
    division: string,
    addressId: string,
    departureCountry: string,
    customerTaxCategory: string,
  ): DeleteRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>;
  /**
   * Returns a request builder for deleting an entity of type `CustSlsAreaAddrDepdntTaxInfo`.
   * @param entity Pass the entity to be deleted.
   * @returns A request builder for creating requests that delete an entity of type `CustSlsAreaAddrDepdntTaxInfo` by taking the entity as a parameter.
   */
  delete(
    entity: CustSlsAreaAddrDepdntTaxInfo<T>,
  ): DeleteRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>;
  delete(
    customerOrEntity: any,
    salesOrganization?: string,
    distributionChannel?: string,
    division?: string,
    addressId?: string,
    departureCountry?: string,
    customerTaxCategory?: string,
  ): DeleteRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T> {
    return new DeleteRequestBuilder<CustSlsAreaAddrDepdntTaxInfo<T>, T>(
      this.entityApi,
      customerOrEntity instanceof CustSlsAreaAddrDepdntTaxInfo
        ? customerOrEntity
        : {
            Customer: customerOrEntity!,
            SalesOrganization: salesOrganization!,
            DistributionChannel: distributionChannel!,
            Division: division!,
            AddressID: addressId!,
            DepartureCountry: departureCountry!,
            CustomerTaxCategory: customerTaxCategory!,
          },
    );
  }
}
