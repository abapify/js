/**
 * Contract Scenarios Registry
 * 
 * Add new scenarios here to include them in tests.
 */

import { TransportsScenario, TransportRequestsScenario } from './cts';
import { AtcRunsScenario, AtcResultsScenario, AtcWorklistsScenario } from './atc';
import { DiscoveryScenario } from './discovery';
import { ClassesScenario, ClassSourceScenario, InterfacesScenario, ClassRunScenario } from './oo';
import { PackagesScenario } from './packages';

export const SCENARIOS = [
  // CTS
  new TransportsScenario(),
  new TransportRequestsScenario(),
  // ATC
  new AtcRunsScenario(),
  new AtcResultsScenario(),
  new AtcWorklistsScenario(),
  // Discovery
  new DiscoveryScenario(),
  // OO
  new ClassesScenario(),
  new ClassSourceScenario(),
  new InterfacesScenario(),
  new ClassRunScenario(),
  // Packages
  new PackagesScenario(),
];
