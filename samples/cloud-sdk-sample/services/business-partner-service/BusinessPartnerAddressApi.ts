/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import { BusinessPartnerAddress } from './BusinessPartnerAddress';
import { BusinessPartnerAddressRequestBuilder } from './BusinessPartnerAddressRequestBuilder';
import { BuPaAddressUsageApi } from './BuPaAddressUsageApi';
import { BpAddrDepdntIntlLocNumberApi } from './BpAddrDepdntIntlLocNumberApi';
import { BpIntlAddressVersionApi } from './BpIntlAddressVersionApi';
import { AddressEmailAddressApi } from './AddressEmailAddressApi';
import { AddressFaxNumberApi } from './AddressFaxNumberApi';
import { AddressPhoneNumberApi } from './AddressPhoneNumberApi';
import { AddressHomePageUrlApi } from './AddressHomePageUrlApi';
import {
  CustomField,
  defaultDeSerializers,
  DefaultDeSerializers,
  DeSerializers,
  AllFields,
  entityBuilder,
  EntityBuilderType,
  EntityApi,
  FieldBuilder,
  OrderableEdmTypeField,
  Link,
  OneToOneLink,
} from '@sap-cloud-sdk/odata-v2';
export class BusinessPartnerAddressApi<
  DeSerializersT extends DeSerializers = DefaultDeSerializers,
> implements EntityApi<BusinessPartnerAddress<DeSerializersT>, DeSerializersT>
{
  public deSerializers: DeSerializersT;

  private constructor(
    deSerializers: DeSerializersT = defaultDeSerializers as any,
  ) {
    this.deSerializers = deSerializers;
  }

  /**
   * Do not use this method or the constructor directly.
   * Use the service function as described in the documentation to get an API instance.
   */
  public static _privateFactory<
    DeSerializersT extends DeSerializers = DefaultDeSerializers,
  >(
    deSerializers: DeSerializersT = defaultDeSerializers as any,
  ): BusinessPartnerAddressApi<DeSerializersT> {
    return new BusinessPartnerAddressApi(deSerializers);
  }

  private navigationPropertyFields!: {
    /**
     * Static representation of the one-to-many navigation property {@link toAddressUsage} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_ADDRESS_USAGE: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BuPaAddressUsageApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link toBpAddrDepdntIntlLocNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_BP_ADDR_DEPDNT_INTL_LOC_NUMBER: OneToOneLink<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BpAddrDepdntIntlLocNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toBpIntlAddressVersion} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_BP_INTL_ADDRESS_VERSION: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BpIntlAddressVersionApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toEmailAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_EMAIL_ADDRESS: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressEmailAddressApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toFaxNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_FAX_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressFaxNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toMobilePhoneNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_MOBILE_PHONE_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressPhoneNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPhoneNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PHONE_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressPhoneNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toUrlAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_URL_ADDRESS: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressHomePageUrlApi<DeSerializersT>
    >;
  };

  _addNavigationProperties(
    linkedApis: [
      BuPaAddressUsageApi<DeSerializersT>,
      BpAddrDepdntIntlLocNumberApi<DeSerializersT>,
      BpIntlAddressVersionApi<DeSerializersT>,
      AddressEmailAddressApi<DeSerializersT>,
      AddressFaxNumberApi<DeSerializersT>,
      AddressPhoneNumberApi<DeSerializersT>,
      AddressPhoneNumberApi<DeSerializersT>,
      AddressHomePageUrlApi<DeSerializersT>,
    ],
  ): this {
    this.navigationPropertyFields = {
      TO_ADDRESS_USAGE: new Link('to_AddressUsage', this, linkedApis[0]),
      TO_BP_ADDR_DEPDNT_INTL_LOC_NUMBER: new OneToOneLink(
        'to_BPAddrDepdntIntlLocNumber',
        this,
        linkedApis[1],
      ),
      TO_BP_INTL_ADDRESS_VERSION: new Link(
        'to_BPIntlAddressVersion',
        this,
        linkedApis[2],
      ),
      TO_EMAIL_ADDRESS: new Link('to_EmailAddress', this, linkedApis[3]),
      TO_FAX_NUMBER: new Link('to_FaxNumber', this, linkedApis[4]),
      TO_MOBILE_PHONE_NUMBER: new Link(
        'to_MobilePhoneNumber',
        this,
        linkedApis[5],
      ),
      TO_PHONE_NUMBER: new Link('to_PhoneNumber', this, linkedApis[6]),
      TO_URL_ADDRESS: new Link('to_URLAddress', this, linkedApis[7]),
    };
    return this;
  }

  entityConstructor = BusinessPartnerAddress;

  requestBuilder(): BusinessPartnerAddressRequestBuilder<DeSerializersT> {
    return new BusinessPartnerAddressRequestBuilder<DeSerializersT>(this);
  }

  entityBuilder(): EntityBuilderType<
    BusinessPartnerAddress<DeSerializersT>,
    DeSerializersT
  > {
    return entityBuilder<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT
    >(this);
  }

  customField<NullableT extends boolean = false>(
    fieldName: string,
    isNullable: NullableT = false as NullableT,
  ): CustomField<
    BusinessPartnerAddress<DeSerializersT>,
    DeSerializersT,
    NullableT
  > {
    return new CustomField(
      fieldName,
      this.entityConstructor,
      this.deSerializers,
      isNullable,
    ) as any;
  }

  private _fieldBuilder?: FieldBuilder<
    typeof BusinessPartnerAddress,
    DeSerializersT
  >;
  get fieldBuilder() {
    if (!this._fieldBuilder) {
      this._fieldBuilder = new FieldBuilder(
        BusinessPartnerAddress,
        this.deSerializers,
      );
    }
    return this._fieldBuilder;
  }

  private _schema?: {
    BUSINESS_PARTNER: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    ADDRESS_ID: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      false,
      true
    >;
    VALIDITY_START_DATE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    VALIDITY_END_DATE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.DateTimeOffset',
      true,
      true
    >;
    AUTHORIZATION_GROUP: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_UUID: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.Guid',
      true,
      true
    >;
    ADDITIONAL_STREET_PREFIX_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDITIONAL_STREET_SUFFIX_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_TIME_ZONE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CARE_OF_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CITY_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    CITY_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COMPANY_POSTAL_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COUNTRY: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COUNTY: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_SERVICE_NUMBER: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DELIVERY_SERVICE_TYPE_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    DISTRICT: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FORM_OF_ADDRESS: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    FULL_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    HOME_CITY_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    HOUSE_NUMBER: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    HOUSE_NUMBER_SUPPLEMENT_TEXT: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    LANGUAGE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX_DEVIATING_CITY_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX_DEVIATING_COUNTRY: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX_DEVIATING_REGION: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX_IS_WITHOUT_NUMBER: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.Boolean',
      true,
      true
    >;
    PO_BOX_LOBBY_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PO_BOX_POSTAL_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PERSON: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    POSTAL_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    PRFRD_COMM_MEDIUM_TYPE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    REGION: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    STREET_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    STREET_PREFIX_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    STREET_SUFFIX_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TAX_JURISDICTION: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TRANSPORT_ZONE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    ADDRESS_ID_BY_EXTERNAL_SYSTEM: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    COUNTY_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TOWNSHIP_CODE: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    TOWNSHIP_NAME: OrderableEdmTypeField<
      BusinessPartnerAddress<DeSerializers>,
      DeSerializersT,
      'Edm.String',
      true,
      true
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toAddressUsage} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_ADDRESS_USAGE: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BuPaAddressUsageApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-one navigation property {@link toBpAddrDepdntIntlLocNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_BP_ADDR_DEPDNT_INTL_LOC_NUMBER: OneToOneLink<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BpAddrDepdntIntlLocNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toBpIntlAddressVersion} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_BP_INTL_ADDRESS_VERSION: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      BpIntlAddressVersionApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toEmailAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_EMAIL_ADDRESS: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressEmailAddressApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toFaxNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_FAX_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressFaxNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toMobilePhoneNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_MOBILE_PHONE_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressPhoneNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toPhoneNumber} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_PHONE_NUMBER: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressPhoneNumberApi<DeSerializersT>
    >;
    /**
     * Static representation of the one-to-many navigation property {@link toUrlAddress} for query construction.
     * Use to reference this property in query operations such as 'select' in the fluent request API.
     */
    TO_URL_ADDRESS: Link<
      BusinessPartnerAddress<DeSerializersT>,
      DeSerializersT,
      AddressHomePageUrlApi<DeSerializersT>
    >;
    ALL_FIELDS: AllFields<BusinessPartnerAddress<DeSerializers>>;
  };

  get schema() {
    if (!this._schema) {
      const fieldBuilder = this.fieldBuilder;
      this._schema = {
        /**
         * Static representation of the {@link businessPartner} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        BUSINESS_PARTNER: fieldBuilder.buildEdmTypeField(
          'BusinessPartner',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link addressId} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_ID: fieldBuilder.buildEdmTypeField(
          'AddressID',
          'Edm.String',
          false,
        ),
        /**
         * Static representation of the {@link validityStartDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_START_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityStartDate',
          'Edm.DateTimeOffset',
          true,
        ),
        /**
         * Static representation of the {@link validityEndDate} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        VALIDITY_END_DATE: fieldBuilder.buildEdmTypeField(
          'ValidityEndDate',
          'Edm.DateTimeOffset',
          true,
        ),
        /**
         * Static representation of the {@link authorizationGroup} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        AUTHORIZATION_GROUP: fieldBuilder.buildEdmTypeField(
          'AuthorizationGroup',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link addressUuid} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_UUID: fieldBuilder.buildEdmTypeField(
          'AddressUUID',
          'Edm.Guid',
          true,
        ),
        /**
         * Static representation of the {@link additionalStreetPrefixName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_STREET_PREFIX_NAME: fieldBuilder.buildEdmTypeField(
          'AdditionalStreetPrefixName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link additionalStreetSuffixName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDITIONAL_STREET_SUFFIX_NAME: fieldBuilder.buildEdmTypeField(
          'AdditionalStreetSuffixName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link addressTimeZone} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_TIME_ZONE: fieldBuilder.buildEdmTypeField(
          'AddressTimeZone',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link careOfName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CARE_OF_NAME: fieldBuilder.buildEdmTypeField(
          'CareOfName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link cityCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CITY_CODE: fieldBuilder.buildEdmTypeField(
          'CityCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link cityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        CITY_NAME: fieldBuilder.buildEdmTypeField(
          'CityName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link companyPostalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COMPANY_POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'CompanyPostalCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link country} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTRY: fieldBuilder.buildEdmTypeField('Country', 'Edm.String', true),
        /**
         * Static representation of the {@link county} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTY: fieldBuilder.buildEdmTypeField('County', 'Edm.String', true),
        /**
         * Static representation of the {@link deliveryServiceNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_SERVICE_NUMBER: fieldBuilder.buildEdmTypeField(
          'DeliveryServiceNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link deliveryServiceTypeCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DELIVERY_SERVICE_TYPE_CODE: fieldBuilder.buildEdmTypeField(
          'DeliveryServiceTypeCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link district} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        DISTRICT: fieldBuilder.buildEdmTypeField(
          'District',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link formOfAddress} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FORM_OF_ADDRESS: fieldBuilder.buildEdmTypeField(
          'FormOfAddress',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link fullName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        FULL_NAME: fieldBuilder.buildEdmTypeField(
          'FullName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link homeCityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HOME_CITY_NAME: fieldBuilder.buildEdmTypeField(
          'HomeCityName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link houseNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HOUSE_NUMBER: fieldBuilder.buildEdmTypeField(
          'HouseNumber',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link houseNumberSupplementText} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        HOUSE_NUMBER_SUPPLEMENT_TEXT: fieldBuilder.buildEdmTypeField(
          'HouseNumberSupplementText',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link language} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        LANGUAGE: fieldBuilder.buildEdmTypeField(
          'Language',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link poBox} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX: fieldBuilder.buildEdmTypeField('POBox', 'Edm.String', true),
        /**
         * Static representation of the {@link poBoxDeviatingCityName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_DEVIATING_CITY_NAME: fieldBuilder.buildEdmTypeField(
          'POBoxDeviatingCityName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link poBoxDeviatingCountry} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_DEVIATING_COUNTRY: fieldBuilder.buildEdmTypeField(
          'POBoxDeviatingCountry',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link poBoxDeviatingRegion} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_DEVIATING_REGION: fieldBuilder.buildEdmTypeField(
          'POBoxDeviatingRegion',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link poBoxIsWithoutNumber} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_IS_WITHOUT_NUMBER: fieldBuilder.buildEdmTypeField(
          'POBoxIsWithoutNumber',
          'Edm.Boolean',
          true,
        ),
        /**
         * Static representation of the {@link poBoxLobbyName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_LOBBY_NAME: fieldBuilder.buildEdmTypeField(
          'POBoxLobbyName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link poBoxPostalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PO_BOX_POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'POBoxPostalCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link person} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PERSON: fieldBuilder.buildEdmTypeField('Person', 'Edm.String', true),
        /**
         * Static representation of the {@link postalCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        POSTAL_CODE: fieldBuilder.buildEdmTypeField(
          'PostalCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link prfrdCommMediumType} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        PRFRD_COMM_MEDIUM_TYPE: fieldBuilder.buildEdmTypeField(
          'PrfrdCommMediumType',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link region} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        REGION: fieldBuilder.buildEdmTypeField('Region', 'Edm.String', true),
        /**
         * Static representation of the {@link streetName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_NAME: fieldBuilder.buildEdmTypeField(
          'StreetName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link streetPrefixName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_PREFIX_NAME: fieldBuilder.buildEdmTypeField(
          'StreetPrefixName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link streetSuffixName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        STREET_SUFFIX_NAME: fieldBuilder.buildEdmTypeField(
          'StreetSuffixName',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link taxJurisdiction} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TAX_JURISDICTION: fieldBuilder.buildEdmTypeField(
          'TaxJurisdiction',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link transportZone} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TRANSPORT_ZONE: fieldBuilder.buildEdmTypeField(
          'TransportZone',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link addressIdByExternalSystem} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        ADDRESS_ID_BY_EXTERNAL_SYSTEM: fieldBuilder.buildEdmTypeField(
          'AddressIDByExternalSystem',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link countyCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        COUNTY_CODE: fieldBuilder.buildEdmTypeField(
          'CountyCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link townshipCode} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TOWNSHIP_CODE: fieldBuilder.buildEdmTypeField(
          'TownshipCode',
          'Edm.String',
          true,
        ),
        /**
         * Static representation of the {@link townshipName} property for query construction.
         * Use to reference this property in query operations such as 'select' in the fluent request API.
         */
        TOWNSHIP_NAME: fieldBuilder.buildEdmTypeField(
          'TownshipName',
          'Edm.String',
          true,
        ),
        ...this.navigationPropertyFields,
        /**
         *
         * All fields selector.
         */
        ALL_FIELDS: new AllFields('*', BusinessPartnerAddress),
      };
    }

    return this._schema;
  }
}
