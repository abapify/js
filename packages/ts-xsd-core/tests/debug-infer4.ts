// Debug - check what types resolve to
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
} as const;

type Order = InferSchema<typeof orderSchema>;

// Debug: what is Order?
type _DebugOrder = Order;

// Debug: what is status specifically?
type _DebugStatus = Order extends { status: infer S } ? S : "no status";

// Try to assign
const testStatus: _DebugStatus = "pending";
