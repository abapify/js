// Debug file - import actual types
import type { InferSchema, SchemaLike } from '../src/infer/types';

const orderSchema = {
  targetNamespace: "http://example.com/order",
  element: [
    { name: "Order", type: "tns:OrderType" },
  ],
  complexType: [
    {
      name: "OrderType",
      sequence: {
        element: [
          { name: "orderId", type: "xs:string" },
          { name: "status", type: "tns:OrderStatusType" },
          { name: "items", type: "tns:ItemListType" },
          { name: "notes", type: "xs:string", minOccurs: 0 },
        ],
      },
    },
    {
      name: "ItemListType",
      sequence: {
        element: [
          { name: "item", type: "tns:ItemType", maxOccurs: "unbounded" as const },
        ],
      },
    },
    {
      name: "ItemType",
      sequence: {
        element: [
          { name: "sku", type: "xs:string" },
          { name: "name", type: "xs:string" },
          { name: "quantity", type: "xs:int" },
        ],
      },
    },
  ],
  simpleType: [
    {
      name: "OrderStatusType",
      restriction: {
        base: "xs:string",
        enumeration: [
          { value: "pending" },
          { value: "confirmed" },
          { value: "shipped" },
        ],
      },
    },
  ],
} as const satisfies SchemaLike;

type Order = InferSchema<typeof orderSchema>;

const order: Order = {
  orderId: 'ORD-001',
  status: 'pending',
  items: {
    item: [
      { sku: 'SKU-001', name: 'Widget', quantity: 5 },
    ],
  },
};

console.log(order);
