// Name	Type	Description
// guid	uuid	Unique identifier for the service credential binding
// name	string	Name of the binding.null when it’s not defined.
// type string	Either app or key
// last_operation	last operation object	The last operation of this binding
// created_at	timestamp	The time with zone when the object was created
// updated_at	timestamp	The time with zone when the object was last updated
// metadata.labels	label object	Labels applied to the service credential binding
// metadata.annotations	annotation object	Annotations applied to the service credential binding
// relationships.service_instance	to - one relationship	The service instance that this binding is originated from
// relationships.app	to - one relationship	The app using this binding; omitted for key bindings
// links	links object	Links to related resources
// The last operation object for service credential binding
// Name	Type	Description
// type string	Either create or delete
//     state	string	Either initial, in progress, succeeded, or failed
// Note: The initial state indicates that no response from the service broker has been received yet.
// description	string	A textual explanation associated with this state
// created_at	timestamp	The time with zone when the operation started
// updated_at	timestamp	The time with zone when the operation was last update

import {
  links,
  metadata,
  timestamp,
  to_one_relationship,
  uuid,
} from '../common';

export interface ServiceCredentialBinding {
  guid: uuid;
  name: string;
  type: 'app' | 'key';
  last_operation: last_operation;
  created_at: timestamp;
  updated_at: timestamp;
  metadata: metadata;
  relationships: {
    service_instance: to_one_relationship;
    app: to_one_relationship;
  };
  links: links;
}

interface last_operation {
  type: 'create' | 'delete';
  state: 'initial' | 'in progress' | 'succeeded' | 'failed';
  description: string;
  updated_at: timestamp;
  created_at: timestamp;
}
