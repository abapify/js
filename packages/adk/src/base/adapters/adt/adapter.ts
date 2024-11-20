import { Kind } from '../../../objects/kind';
import { Spec } from '../../../objects/base';
import { BaseAdapter } from '../../adapter';
import { AdtCoreType } from './type';
import { toXML } from './xml';

export abstract class AdtAdapter<
  T extends Spec<unknown, Kind>
> extends BaseAdapter<T> {
  abstract toAdt(): Record<string, unknown>;
  get adtcore(): Record<string, unknown> {
    return {
      type: AdtCoreType[this.kind as keyof typeof AdtCoreType],
      name: this.name,
    };
  }
  toAdtXML(): string {
    return toXML(this.toAdt());
  }
}
