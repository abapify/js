/**
 * ADT vit (Virtual Integration Technology) contracts.
 */

export * from './wb/objectproperties';

import {
  vitWbObjectPropertiesContract,
  type VitWbObjectPropertiesContract,
} from './wb/objectproperties';

export interface VitContract {
  wb: {
    objectProperties: VitWbObjectPropertiesContract;
  };
}

export const vitContract: VitContract = {
  wb: {
    objectProperties: vitWbObjectPropertiesContract,
  },
};
