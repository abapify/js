import { uuid, timestamp, labels, annotations } from '../common';
import { Organization } from './organization';

export interface OrganizationsAPI {
  createOrganization: (data: {
    name: string;
    suspended?: boolean;
    metadata?: {
      labels?: labels;
      annotations?: annotations;
    };
  }) => Promise<Organization>;
  getOrganization: (guid: uuid) => Promise<Organization>;
  listOrganizations: (query: {
    names?: string[];
    guids?: uuid[];
    per_page?: number;
    page?: number;
    order_by?: string;
    label_selector?: string;
    created_ats?: timestamp[];
    updated_ats?: timestamp[];
  }) => Promise<Organization[]>;
  updateOrganization: (
    guid: uuid,
    data: {
      name?: string;
      suspended?: boolean;
      metadata?: {
        labels?: labels;
        annotations?: annotations;
      };
    }
  ) => Promise<Organization>;
}
