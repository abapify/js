const HEAP = '%heap'
const REF = '%ref'
const VAL = '%val'

export const AbapJsonProxyHandler: ProxyHandler<object> = {
  // Prevents '%heap' from showing up during iteration (e.g., Object.keys)
  ownKeys(target) {
    const ownKeys = Reflect.ownKeys(target);
    // if (ownKeys.includes(VAL)) {
    //   const val = Reflect.get(target, VAL);
    //   return Reflect.ownKeys(val);
    // }
    return ownKeys.filter(key => ![HEAP].includes(key.toString()));
  },
  get: (target, prop, receiver) => {
    // Use Reflect to access the property, but exclude '%heap'

    if (prop === HEAP) {
      return undefined;
    }

    let value = Reflect.get(target, prop, receiver);
    const heap = Reflect.get(target, HEAP, receiver);

    if (typeof value === "object" && value !== null && REF in value && /^#.*$/.test(value[REF])) {
      const refKey = value[REF].substring(1); // Remove leading "#"
      value = Reflect.get(heap, refKey);
    }

    if (typeof value === "object" && value !== null && VAL in value) {
      value = value[VAL];
    }

    if (typeof value === "object" && value !== null) {
      value = proxy(Object.assign(value, { [HEAP]: heap }));
    }

    return value;
  }
}

export function proxy(target: object): object {
  return new Proxy(target, AbapJsonProxyHandler);
}

export function transform(target: object): object {
  const proxy = new Proxy(target, AbapJsonProxyHandler);
  return Object.fromEntries(
    Object.entries(proxy)
  );
}

export function parse(asjson: string): object {
  return transform(JSON.parse(asjson));
}

