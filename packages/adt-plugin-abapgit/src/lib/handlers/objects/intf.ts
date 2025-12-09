/**
 * Interface (INTF) object handler for abapGit format
 */

import { AdkInterface } from '../adk';
import { intf } from '../schemas';
import { createHandler } from '../base';

export const interfaceHandler = createHandler(AdkInterface, {
  schema: intf,

  toAbapGit: (obj) => ({
    CLSNAME: obj.name ?? '',
    LANGU: 'E',
    DESCRIPT: obj.description ?? '',
    EXPOSURE: '2', // 2 = Public
    STATE: '1', // 1 = Active
    UNICODE: 'X',
  }),

  getSource: (obj) => obj.getSource(),
});
