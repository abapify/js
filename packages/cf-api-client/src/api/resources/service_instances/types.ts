// Name	Type	Description
// guid	uuid	Unique identifier for the service instance
// created_at	timestamp	The time with zone when the object was created
// updated_at	timestamp	The time with zone when the object was last updated
// name	string	Name of the service instance
// type	string	Either managed or user-provided
// tags	list of strings	Tags are used by apps to identify service instances; they are shown in the app VCAP_SERVICES env
// syslog_drain_url	string	URL to which logs for bound applications will be streamed; only shown when type is user-provided
// route_service_url	string	URL to which requests for bound routes will be forwarded; only shown when type is user-provided
// maintenance_info	maintenance_info object	Information about the version of this service instance; only shown when type is managed
// upgrade_available	bool	Whether or not an upgrade of this service instance is available on the current Service Plan; details are available in the maintenance_info object; Only shown when type is managed
// dashboard_url	string	The URL to the service instance dashboard (or null if there is none); only shown when type is managed
// last_operation	last operation object	The last operation of this service instance
// relationships.service_plan	to-one relationship	The service plan the service instance relates to; only shown when type is managed
// relationships.space	to-one relationship	The space the service instance is contained in
// metadata.labels	label object	Labels applied to the service instance
// metadata.annotations	annotation object	Annotations applied to the service instance
// links	links object	Links to related resources

import {
  links,
  metadata,
  timestamp,
  to_one_relationship,
  uuid,
} from '../common';

export interface ServiceInstance {
  guid: uuid;
  created_at: timestamp;
  updated_at: timestamp;
  name: string;
  type: 'managed' | 'user-provided';
  tags: string[];
  syslog_drain_url?: string;
  route_service_url?: string;
  maintenance_info?: ServiceInstanceMaintenanceInfo;
  upgrade_available?: boolean;
  dashboard_url?: string;
  last_operation?: ServiceInstanceLastOperation;
  relationships: ServiceInstanceRelationships;
  metadata: metadata;
  links: links;
}

export interface ServiceInstanceMaintenanceInfo {
  version: string;
  description: string;
}

export interface ServiceInstanceLastOperation {
  type: 'create' | 'update' | 'delete';
  state: 'initial' | 'in progress' | 'succeeded' | 'failed';
  description: string;
  updated_at: timestamp;
  created_at: timestamp;
}

export interface ServiceInstanceRelationships {
  service_plan?: to_one_relationship;
  space: to_one_relationship;
}
