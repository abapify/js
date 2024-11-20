import { AxiosInstance } from 'axios';

export abstract class BaseClient {
  constructor(protected readonly client: AxiosInstance) {}
}
