import { BaseClient } from '../base';
import { PaginatedResponse, timestamp } from '../common';
import { ServiceCredentialBinding } from './types';

export class ServiceCredentialBindingAPI extends BaseClient {
  create = (data: {
    type: ServiceCredentialBinding['type'];
    relationships: {
      service_instance: {
        data: {
          guid: string;
        };
      };
    };
    metadata?: {
      labels?: { [key: string]: string };
      annotations?: { [key: string]: string };
    };
  }) =>
    this.client.post<ServiceCredentialBinding>(
      '/v3/service_credential_bindings',
      data
    );
  get = (guid: string) =>
    this.client.get<ServiceCredentialBinding>(
      `/v3/service_credential_bindings/${guid}`
    );
  //     Definition
  // GET /v3/service_credential_bindings

  // Query parameters
  // Name	Type	Description
  // names	list of strings	Comma-delimited list of service credential binding names to filter by
  // service_instance_guids	list of strings	Comma-delimited list of service instance guids to filter by
  // service_instance_names	list of strings	Comma-delimited list of service instance names to filter by
  // app_guids	list of strings	Comma-delimited list of app guids to filter by
  // app_names	strings	Comma-delimited list of app names to filter by
  // service_plan_guids	list of strings	Comma-delimited list of service plan guids to filter by
  // service_plan_names	list of strings	Comma-delimited list of service plan names to filter by
  // service_offering_guids	list of strings	Comma-delimited list of service offering guids to filter by
  // service_offering_names	list of strings	Comma-delimited list of service offering names to filter by
  // type	list of strings	Type of credential binding to filter by. Valid values are: app or key
  // guids	list of strings	Comma-delimited list of service route binding guids to filter by
  // created_ats	timestamp	Timestamp to filter by. When filtering on equality, several comma-delimited timestamps may be passed. Also supports filtering with relational operators
  // updated_ats	timestamp	Timestamp to filter by. When filtering on equality, several comma-delimited timestamps may be passed. Also supports filtering with relational operators
  // include	list of strings	Optionally include a list of unique related resources in the response. Valid values are: app, service_instance
  // label_selector	string	A query string containing a list of label selector requirements
  // page	integer	Page to display; valid values are integers >= 1
  // per_page	integer	Number of results per page;
  // valid values are 1 through 5000
  // order_by	string	Value to sort by. Defaults to ascending; prepend with - to sort descending
  // Valid values are created_at, updated_at, and name
  list = (params?: {
    names?: string[];
    service_instance_guids?: string[];
    service_instance_names?: string[];
    app_guids?: string[];
    app_names?: string[];
    service_plan_guids?: string[];
    service_plan_names?: string[];
    service_offering_guids?: string[];
    service_offering_names?: string[];
    type?: ServiceCredentialBinding['type'][];
    guids?: string[];
    created_ats?: timestamp[];
    updated_ats?: timestamp[];
    include?: Array<'app' | 'service_instance'>;
    label_selector?: string;
    page?: number;
    per_page?: number;
    order_by?: string;
  }) =>
    this.client.get<PaginatedResponse<ServiceCredentialBinding>>(
      '/v3/service_credential_bindings',
      { params }
    );

  //     PATCH /v3/service_credential_bindings/:guid
  // Optional parameters
  // Name	Type	Description
  // metadata.labels	label object	Labels applied to the service credential binding
  // metadata.annotations	annotation object	Annotations applied to the service credential binding

  update = (
    guid: string,
    data: {
      metadata?: {
        labels?: { [key: string]: string };
        annotations?: { [key: string]: string };
      };
    }
  ) =>
    this.client.patch<ServiceCredentialBinding>(
      `/v3/service_credential_bindings/${guid}`,
      data
    );

  //     Definition
  // DELETE /v3/service_credential_bindings/:guid
  delete = (guid: string) =>
    this.client.delete(`/v3/service_credential_bindings/${guid}`);
  //     This endpoint retrieves the service credential binding details.

  // Definition
  // GET /v3/service_credential_bindings/:guid/details
  getDetails = (guid: string) =>
    this.client.get<unknown>(`/v3/service_credential_bindings/${guid}/details`);

  //     Queries the Service Broker for the parameters associated with this service credential binding. The broker catalog must have enabled the bindings_retrievable feature for the Service Offering. Check the Service Offering object for the value of this feature flag. This endpoint is not available for User-Provided Service Instances.

  // Definition
  // GET /v3/service_credential_bindings/:guid/parameters
  getParameters = (guid: string) =>
    this.client.get<unknown>(
      `/v3/service_credential_bindings/${guid}/parameters`
    );
}
