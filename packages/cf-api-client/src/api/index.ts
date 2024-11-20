import axios, { AxiosInstance } from 'axios';
import QueryString from 'qs';
import { ServiceInstanceAPI } from './resources/service_instances/api';
import { ServiceCredentialBindingAPI } from './resources/service_credential_bindings/api';

export class CloudFoundryClient {
  private client: AxiosInstance;
  serviceCredentialBinding: ServiceCredentialBindingAPI;
  serviceInstances: ServiceInstanceAPI;

  constructor(apiEndpoint: string, accessToken: string) {
    this.client = axios.create({
      baseURL: apiEndpoint,
      headers: {
        Authorization: accessToken,
      },
      paramsSerializer: function (params) {
        return QueryString.stringify(params, { arrayFormat: 'comma' });
      },
    });
    this.serviceCredentialBinding = new ServiceCredentialBindingAPI(
      this.client
    );
    this.serviceInstances = new ServiceInstanceAPI(this.client);
  }
}
