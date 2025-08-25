import { BaseObject } from '../base/base-object';
import { ClassData } from './types';

export class ClasObject extends BaseObject<ClassData> {
  async read(name: string): Promise<ClassData> {
    console.log(`🏛️ Reading class: ${name}`);

    try {
      // Classes use: /sap/bc/adt/oo/classes/{name}/source/main
      const sourceUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}/source/main`;
      const source = await this.fetchFromAdt(sourceUri);

      // TODO: Fetch metadata from main object URI if needed
      // const metadataUri = `/sap/bc/adt/oo/classes/${name.toLowerCase()}`;

      return {
        name,
        description: `Class ${name}`, // Will be populated from search result
        source: source.trim(),
        metadata: {
          type: 'CLAS',
        },
      };
    } catch (error) {
      throw new Error(
        `Failed to read class ${name}: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
}
