/**
 * All test scenarios
 * 
 * Add new scenarios here to include them in tests.
 */

import { TmCreateScenario, TmFullScenario, TmTaskScenario } from './tm';
import { PackagesScenario } from './packages';

export const SCENARIOS = [
  new TmCreateScenario(),
  new TmFullScenario(),
  new TmTaskScenario(),
  new PackagesScenario(),
];
