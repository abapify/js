/*
 * Copyright (c) 2024 SAP SE or an SAP affiliate company. All rights reserved.
 *
 * This is a generated file powered by the SAP Cloud SDK for JavaScript.
 */
import {
  Entity,
  DefaultDeSerializers,
  DeSerializers,
  DeserializedType,
} from '@sap-cloud-sdk/odata-v2';
import type { SupplierPurchasingOrgApi } from './SupplierPurchasingOrgApi';
import {
  SupplierPartnerFunc,
  SupplierPartnerFuncType,
} from './SupplierPartnerFunc';
import {
  SupplierPurchasingOrgText,
  SupplierPurchasingOrgTextType,
} from './SupplierPurchasingOrgText';

/**
 * This class represents the entity "A_SupplierPurchasingOrg" of service "API_BUSINESS_PARTNER".
 */
export class SupplierPurchasingOrg<
    T extends DeSerializers = DefaultDeSerializers,
  >
  extends Entity
  implements SupplierPurchasingOrgType<T>
{
  /**
   * Technical entity name for SupplierPurchasingOrg.
   */
  static override _entityName = 'A_SupplierPurchasingOrg';
  /**
   * Default url path for the according service.
   */
  static override _defaultBasePath = '/sap/opu/odata/sap/API_BUSINESS_PARTNER';
  /**
   * All key fields of the SupplierPurchasingOrg entity.
   */
  static _keys = ['Supplier', 'PurchasingOrganization'];
  /**
   * Supplier's Account Number.
   * Maximum length: 10.
   */
  declare supplier: DeserializedType<T, 'Edm.String'>;
  /**
   * Purchasing Organization.
   * Maximum length: 4.
   */
  declare purchasingOrganization: DeserializedType<T, 'Edm.String'>;
  /**
   * Automatic evaluated receipt settlement for return items.
   * @nullable
   */
  declare automaticEvaluatedRcptSettlmt?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Group for Calculation Schema (Supplier).
   * Maximum length: 2.
   * @nullable
   */
  declare calculationSchemaGroupCode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Deletion Indicator for Supplier at Purchasing Level.
   * @nullable
   */
  declare deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Evaluated Receipt Settlement (ERS).
   * @nullable
   */
  declare evaldReceiptSettlementIsActive?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Incoterms (Part 1).
   * Maximum length: 3.
   * @nullable
   */
  declare incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms (Part 2).
   * Maximum length: 28.
   * @nullable
   */
  declare incotermsTransferLocation?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Version.
   * Maximum length: 4.
   * @nullable
   */
  declare incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 1.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Incoterms Location 2.
   * Maximum length: 70.
   * @nullable
   */
  declare incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnLoc1AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnLoc2AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  /**
   * Location UUID.
   * @nullable
   */
  declare incotermsSupChnDvtgLocAddlUuid?: DeserializedType<
    T,
    'Edm.Guid'
  > | null;
  /**
   * Mode of Transport at the Border (Intrastat).
   * Maximum length: 1.
   * @nullable
   */
  declare intrastatCrsBorderTrMode?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicator: GR-Based Invoice Verification.
   * @nullable
   */
  declare invoiceIsGoodsReceiptBased?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Indicator for Service-Based Invoice Verification.
   * @nullable
   */
  declare invoiceIsMmServiceEntryBased?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Planned Delivery Time in Days.
   * @nullable
   */
  declare materialPlannedDeliveryDurn?: DeserializedType<
    T,
    'Edm.Decimal'
  > | null;
  /**
   * Minimum order value.
   * @nullable
   */
  declare minimumOrderAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  /**
   * Key for Terms of Payment.
   * Maximum length: 4.
   * @nullable
   */
  declare paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Planning Cycle.
   * Maximum length: 3.
   * @nullable
   */
  declare planningCycle?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Price Determination (Pricing) Date Control.
   * Maximum length: 1.
   * @nullable
   */
  declare pricingDateControl?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Profile for transferring material data via IDoc PROACT.
   * Maximum length: 4.
   * @nullable
   */
  declare prodStockAndSlsDataTransfPrfl?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Unit of Measure Group.
   * Maximum length: 4.
   * @nullable
   */
  declare productUnitGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Automatic Generation of Purchase Order Allowed.
   * @nullable
   */
  declare purOrdAutoGenerationIsAllowed?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Purchase order currency.
   * Maximum length: 5.
   * @nullable
   */
  declare purchaseOrderCurrency?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchasing Group.
   * Maximum length: 3.
   * @nullable
   */
  declare purchasingGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Purchasing block at purchasing organization level.
   * @nullable
   */
  declare purchasingIsBlockedForSupplier?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Rounding Profile.
   * Maximum length: 4.
   * @nullable
   */
  declare roundingProfile?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Shipping Conditions.
   * Maximum length: 2.
   * @nullable
   */
  declare shippingCondition?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Checkbox.
   * @nullable
   */
  declare suplrDiscountInKindIsGranted?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * Revaluation allowed.
   * @nullable
   */
  declare suplrInvcRevalIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Indicator: Relevant for Settlement Management.
   * @nullable
   */
  declare suplrIsRlvtForSettlmtMgmt?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Indicator: "relev. to price determination (vend. hierarchy).
   * @nullable
   */
  declare suplrPurgOrgIsRlvtForPriceDetn?: DeserializedType<
    T,
    'Edm.Boolean'
  > | null;
  /**
   * ABC indicator.
   * Maximum length: 1.
   * @nullable
   */
  declare supplierAbcClassificationCode?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Our account number with the supplier.
   * Maximum length: 12.
   * @nullable
   */
  declare supplierAccountNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Indicates whether supplier is returns supplier.
   * @nullable
   */
  declare supplierIsReturnsSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Supplier's Telephone Number.
   * Maximum length: 16.
   * @nullable
   */
  declare supplierPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Responsible Salesperson at Supplier's Office.
   * Maximum length: 30.
   * @nullable
   */
  declare supplierRespSalesPersonName?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Confirmation Control Key.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierConfirmationControlKey?: DeserializedType<
    T,
    'Edm.String'
  > | null;
  /**
   * Order Acknowledgment Requirement.
   * @nullable
   */
  declare isOrderAcknRqd?: DeserializedType<T, 'Edm.Boolean'> | null;
  /**
   * Authorization Group.
   * Maximum length: 4.
   * @nullable
   */
  declare authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * Supplier Account Group.
   * Maximum length: 4.
   * @nullable
   */
  declare supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  /**
   * One-to-many navigation property to the {@link SupplierPartnerFunc} entity.
   */
  declare toPartnerFunction: SupplierPartnerFunc<T>[];
  /**
   * One-to-many navigation property to the {@link SupplierPurchasingOrgText} entity.
   */
  declare toPurchasingOrgText: SupplierPurchasingOrgText<T>[];

  constructor(_entityApi: SupplierPurchasingOrgApi<T>) {
    super(_entityApi);
  }
}

export interface SupplierPurchasingOrgType<
  T extends DeSerializers = DefaultDeSerializers,
> {
  supplier: DeserializedType<T, 'Edm.String'>;
  purchasingOrganization: DeserializedType<T, 'Edm.String'>;
  automaticEvaluatedRcptSettlmt?: DeserializedType<T, 'Edm.Boolean'> | null;
  calculationSchemaGroupCode?: DeserializedType<T, 'Edm.String'> | null;
  deletionIndicator?: DeserializedType<T, 'Edm.Boolean'> | null;
  evaldReceiptSettlementIsActive?: DeserializedType<T, 'Edm.Boolean'> | null;
  incotermsClassification?: DeserializedType<T, 'Edm.String'> | null;
  incotermsTransferLocation?: DeserializedType<T, 'Edm.String'> | null;
  incotermsVersion?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation1?: DeserializedType<T, 'Edm.String'> | null;
  incotermsLocation2?: DeserializedType<T, 'Edm.String'> | null;
  incotermsSupChnLoc1AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  incotermsSupChnLoc2AddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  incotermsSupChnDvtgLocAddlUuid?: DeserializedType<T, 'Edm.Guid'> | null;
  intrastatCrsBorderTrMode?: DeserializedType<T, 'Edm.String'> | null;
  invoiceIsGoodsReceiptBased?: DeserializedType<T, 'Edm.Boolean'> | null;
  invoiceIsMmServiceEntryBased?: DeserializedType<T, 'Edm.Boolean'> | null;
  materialPlannedDeliveryDurn?: DeserializedType<T, 'Edm.Decimal'> | null;
  minimumOrderAmount?: DeserializedType<T, 'Edm.Decimal'> | null;
  paymentTerms?: DeserializedType<T, 'Edm.String'> | null;
  planningCycle?: DeserializedType<T, 'Edm.String'> | null;
  pricingDateControl?: DeserializedType<T, 'Edm.String'> | null;
  prodStockAndSlsDataTransfPrfl?: DeserializedType<T, 'Edm.String'> | null;
  productUnitGroup?: DeserializedType<T, 'Edm.String'> | null;
  purOrdAutoGenerationIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  purchaseOrderCurrency?: DeserializedType<T, 'Edm.String'> | null;
  purchasingGroup?: DeserializedType<T, 'Edm.String'> | null;
  purchasingIsBlockedForSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
  roundingProfile?: DeserializedType<T, 'Edm.String'> | null;
  shippingCondition?: DeserializedType<T, 'Edm.String'> | null;
  suplrDiscountInKindIsGranted?: DeserializedType<T, 'Edm.Boolean'> | null;
  suplrInvcRevalIsAllowed?: DeserializedType<T, 'Edm.Boolean'> | null;
  suplrIsRlvtForSettlmtMgmt?: DeserializedType<T, 'Edm.Boolean'> | null;
  suplrPurgOrgIsRlvtForPriceDetn?: DeserializedType<T, 'Edm.Boolean'> | null;
  supplierAbcClassificationCode?: DeserializedType<T, 'Edm.String'> | null;
  supplierAccountNumber?: DeserializedType<T, 'Edm.String'> | null;
  supplierIsReturnsSupplier?: DeserializedType<T, 'Edm.Boolean'> | null;
  supplierPhoneNumber?: DeserializedType<T, 'Edm.String'> | null;
  supplierRespSalesPersonName?: DeserializedType<T, 'Edm.String'> | null;
  supplierConfirmationControlKey?: DeserializedType<T, 'Edm.String'> | null;
  isOrderAcknRqd?: DeserializedType<T, 'Edm.Boolean'> | null;
  authorizationGroup?: DeserializedType<T, 'Edm.String'> | null;
  supplierAccountGroup?: DeserializedType<T, 'Edm.String'> | null;
  toPartnerFunction: SupplierPartnerFuncType<T>[];
  toPurchasingOrgText: SupplierPurchasingOrgTextType<T>[];
}
