import { z } from 'zod';

export const UAACredentialsSchema = z.object({
  tenantmode: z.string(),
  sburl: z.string().url(),
  subaccountid: z.string(),
  'credential-type': z.string(),
  clientid: z.string(),
  xsappname: z.string(),
  clientsecret: z.string(),
  serviceInstanceId: z.string(),
  url: z.string().url(),
  uaadomain: z.string(),
  verificationkey: z.string(),
  apiurl: z.string().url(),
  identityzone: z.string(),
  identityzoneid: z.string(),
  tenantid: z.string(),
  zoneid: z.string(),
});

export const CatalogSchema = z.object({
  path: z.string(),
  type: z.string(),
});

export const BindingSchema = z.object({
  env: z.string(),
  version: z.string(),
  type: z.string(),
  id: z.string(),
});

export const BTPServiceKeySchema = z.object({
  uaa: UAACredentialsSchema,
  url: z.string().url(),
  'sap.cloud.service': z.string(),
  systemid: z.string(),
  endpoints: z.record(z.string(), z.string().url()),
  catalogs: z.record(z.string(), CatalogSchema),
  binding: BindingSchema,
  preserve_host_header: z.boolean(),
});

export type UAACredentials = z.infer<typeof UAACredentialsSchema>;
export type Catalog = z.infer<typeof CatalogSchema>;
export type Binding = z.infer<typeof BindingSchema>;
export type BTPServiceKey = z.infer<typeof BTPServiceKeySchema>;
