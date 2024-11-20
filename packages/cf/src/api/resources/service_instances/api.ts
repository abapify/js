import { BaseClient } from '../base';
import { AllowedFields, PaginatedResponse, timestamp } from '../common';
import { ServiceInstance } from './types';

export class ServiceInstanceAPI extends BaseClient {
  create = (data: {
    name: string;
    type: 'managed' | 'user-provided';
    relationships: {
      space: {
        data: {
          guid: string;
        };
      };
      service_plan?: {
        data: {
          guid: string;
        };
      };
    };
    tags?: string[];
    syslog_drain_url?: string;
    route_service_url?: string;
    metadata?: {
      labels?: { [key: string]: string };
      annotations?: { [key: string]: string };
    };
  }) => this.client.post<ServiceInstance>('/v3/service_instances', data);

  get = (guid: string) =>
    this.client.get<ServiceInstance>(`/v3/service_instances/${guid}`);

  list = (params?: {
    names?: string[];
    guids?: string[];
    type?: ('managed' | 'user-provided')[];
    space_guids?: string[];
    organization_guids?: string[];
    service_plan_guids?: string[];
    service_plan_names?: string[];
    page?: number;
    per_page?: number;
    order_by?: string;
    label_selector?: string;
    // only values from allowed_fields
    fields?: AllowedFields<allowed_fields>;
    created_ats?: timestamp[];
    updated_ats?: timestamp[];
  }) =>
    this.client.get<PaginatedResponse<ServiceInstance>>(
      '/v3/service_instances',
      { params }
    );

  update = (
    guid: string,
    data: {
      name?: string;
      tags?: string[];
      syslog_drain_url?: string;
      route_service_url?: string;
      metadata?: {
        labels?: { [key: string]: string };
        annotations?: { [key: string]: string };
      };
    }
  ) =>
    this.client.patch<ServiceInstance>(`/v3/service_instances/${guid}`, data);

  delete = (guid: string) =>
    this.client.delete(`/v3/service_instances/${guid}`);

  getParameters = (guid: string) =>
    this.client.get<unknown>(`/v3/service_instances/${guid}/parameters`);

  getSharedSpaces = (guid: string) =>
    this.client.get<unknown>(`/v3/service_instances/${guid}/shared_spaces`);

  share = (
    guid: string,
    data: {
      data: {
        guid: string;
      }[];
    }
  ) =>
    this.client.post<ServiceInstance>(
      `/v3/service_instances/${guid}/relationships/shared_spaces`,
      data
    );

  unshare = (guid: string, spaceGuid: string) =>
    this.client.delete(
      `/v3/service_instances/${guid}/relationships/shared_spaces/${spaceGuid}`
    );
}

type allowed_fields = {
  space: ['guid', 'name', 'relationships.organization'];
  'space.organization': ['guid', 'name'];
  service_plan: ['guid', 'name', 'relationships.service_offering'];
  'service_plan.service_offering': [
    'guid',
    'name',
    'description',
    'documentation_url',
    'tags',
    'relationships.service_broker'
  ];
  'service_plan.service_offering.service_broker': ['guid', 'name'];
};
