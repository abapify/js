import { Kind } from '../../../objects/kind';
import { Spec } from '../../../objects/base';
import { BaseAdapter } from '../../adapter';
import { AdtCoreType } from './type';
import { toXML } from './xml';
import { fromXML } from './parser';

export abstract class AdtAdapter<
  T extends Spec<unknown, Kind>
> extends BaseAdapter<T> {
  abstract toAdt(): Record<string, unknown>;
  abstract fromAdt(adtObject: Record<string, unknown>): T;

  get adtcore(): Record<string, unknown> {
    return {
      type: AdtCoreType[this.kind as keyof typeof AdtCoreType],
      name: this.name,
    };
  }

  toAdtXML(): string {
    return toXML(this.toAdt());
  }

  static fromAdtXML<TSpec extends Spec<unknown, Kind>>(
    this: new (spec: TSpec) => AdtAdapter<TSpec>,
    xml: string
  ): TSpec {
    const adtObject = fromXML(xml);
    // Create a temporary adapter instance to use fromAdt method
    // We'll need to extract the spec from the parsed object first
    const tempSpec = AdtAdapter.extractSpecFromAdt(adtObject);
    const adapter = new this(tempSpec as TSpec);
    return adapter.fromAdt(adtObject);
  }

  private static extractSpecFromAdt(
    adtObject: Record<string, unknown>
  ): Spec<unknown, Kind> {
    // Find the root element and extract basic metadata
    const rootKey = Object.keys(adtObject)[0];
    const rootElement = adtObject[rootKey] as any;

    // Extract name from adtcore attributes
    const name =
      rootElement['@adtcore:name'] || rootElement['@name'] || 'UNKNOWN';

    // Determine kind from root element name
    let kind: Kind;
    if (rootKey.includes('domain')) kind = Kind.Domain;
    else if (rootKey.includes('class')) kind = Kind.Class;
    else if (rootKey.includes('interface')) kind = Kind.Interface;
    else kind = Kind.Domain; // fallback

    return {
      kind,
      metadata: { name },
      spec: {}, // Will be filled by concrete implementation
    };
  }
}
