import {
  uuid,
  timestamp,
  to_one_relationship,
  labels,
  annotations,
  links,
} from '../common';

export interface Organization {
  guid: uuid;
  created_at: timestamp;
  updated_at: timestamp;
  name: string;
  suspended: boolean;
  relationships: {
    quota: to_one_relationship;
  };
  metadata: {
    labels: labels;
    annotations: annotations;
  };
  links: links;
}
