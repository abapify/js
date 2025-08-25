import { BaseObject } from '../base/base-object';
import { InterfaceData } from './types';

export class IntfObject extends BaseObject<InterfaceData> {
  async read(name: string): Promise<InterfaceData> {
    console.log(`🔌 Reading interface: ${name}`);

    try {
      // Interfaces use: /sap/bc/adt/oo/interfaces/{name}/source/main
      const sourceUri = `/sap/bc/adt/oo/interfaces/${name.toLowerCase()}/source/main`;
      const source = await this.fetchFromAdt(sourceUri);

      return {
        name,
        description: `Interface ${name}`, // Will be populated from search result
        source: source.trim(),
        metadata: {
          type: 'INTF',
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to read interface ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
