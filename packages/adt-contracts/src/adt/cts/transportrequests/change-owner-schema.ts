import type { Serializable } from '../../../base';
import { transportmanagment, type InferTypedSchema } from '../../../schemas';

export interface ChangeOwnerBody {
  root: {
    number: string;
    targetuser: string;
    useraction: 'changeowner';
  };
}

type TransportManagementBody = InferTypedSchema<typeof transportmanagment>;

type ChangeOwnerRoot = ChangeOwnerBody['root'];

function isChangeOwnerRoot(root: unknown): root is ChangeOwnerRoot {
  if (typeof root !== 'object' || root === null) return false;
  const { useraction, number, targetuser } = root as Record<string, unknown>;
  return (
    useraction === 'changeowner' &&
    typeof number === 'string' &&
    number.length > 0 &&
    typeof targetuser === 'string' &&
    targetuser.length > 0
  );
}

/**
 * Narrow request schema for the CTS change-owner action.
 *
 * SAP models these attributes on the broader transport-management root. This
 * wrapper keeps the call-site body narrow while delegating XML parsing and
 * serialization to that generated SAP schema.
 */
export const changeOwnerBodySchema: Serializable<ChangeOwnerBody> = {
  _infer: undefined as unknown as ChangeOwnerBody,
  parse: (raw: string): ChangeOwnerBody => {
    const parsed = transportmanagment.parse(raw);
    const root = parsed?.root;
    if (!isChangeOwnerRoot(root)) {
      throw new Error('Invalid CTS change-owner body');
    }
    return {
      root: {
        number: root.number,
        targetuser: root.targetuser,
        useraction: 'changeowner',
      },
    };
  },
  build: (body: ChangeOwnerBody): string =>
    transportmanagment.build(body as unknown as TransportManagementBody),
};
