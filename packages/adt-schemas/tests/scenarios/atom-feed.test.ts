import { describe, expect } from 'vitest';
import { fixtures } from '@abapify/adt-fixtures';
import { atomFeed } from '../../src/schemas/index';
import { Scenario, runScenario, type SchemaType } from './base/scenario';

class AtomFeedScenario extends Scenario<typeof atomFeed> {
  readonly schema = atomFeed;
  readonly fixtures = [fixtures.repository.sourceversions.program];

  validateParsed(data: SchemaType<typeof atomFeed>): void {
    const feed = (data as { feed?: { entry?: unknown } }).feed;
    const entry = Array.isArray(feed?.entry) ? feed.entry[0] : feed?.entry;

    expect(entry).toMatchObject({
      id: '00042',
      content: {
        type: 'text/plain',
        src: '/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042',
      },
    });
  }

  override validateBuilt(xml: string): void {
    expect(xml).toContain('atom:content');
    expect(xml).toContain(
      'src="/sap/bc/adt/programs/programs/ztest_gcts_program/source/main/versions/00042"',
    );
  }
}

describe('atom feed schema scenario', () => {
  runScenario(new AtomFeedScenario());
});
