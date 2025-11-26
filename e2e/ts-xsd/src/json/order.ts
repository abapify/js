import Order from './schemas/order';
import { parse } from 'ts-xsd';


// Example usage:
const xml = `<ord:Order xmlns:ord="http://example.com/order" ord:id="123">
  <ord:customer>Acme</ord:customer>
  <ord:items><ord:item ord:sku="A1"><ord:name>Widget</ord:name><ord:quantity>5</ord:quantity><ord:price>10</ord:price></ord:item></ord:items>
  <ord:total>50</ord:total>
</ord:Order>`;

const data = parse(Order, xml);
console.log(data.customer);  // ✅ Typed!