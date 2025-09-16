import { ConnectionManager } from '../../client/connection-manager.js';
import { createLogger } from '../../utils/logger.js';

// Generic interfaces to avoid circular dependency with ADK
export interface GenericSpec {
  kind: string;
  metadata: {
    name: string;
    description?: string;
  };
  spec: any;
}

export interface DeploymentOptions {
  transport?: string;
  package?: string;
  overwrite?: boolean;
  activate?: boolean;
}

export interface DeploymentResult {
  success: boolean;
  objectName: string;
  objectType: string;
  transport?: string;
  messages: string[];
}

export class ObjectDeploymentService {
  private logger: any;

  constructor(private connectionManager: ConnectionManager, logger: any) {
    this.logger = logger;
  }

  async deployObject(
    spec: GenericSpec,
    options: DeploymentOptions = {}
  ): Promise<DeploymentResult> {
    this.logger.debug(`🚀 Deploying ${spec.kind}: ${spec.metadata.name}`);
    this.logger.debug(`📋 ADK Spec:`, JSON.stringify(spec, null, 2));

    try {
      switch (spec.kind) {
        case 'Interface':
          return await this.deployInterface(spec, options);
        case 'Class':
          return await this.deployClass(spec, options);
        case 'Domain':
          return await this.deployDomain(spec, options);
        default:
          throw new Error(
            `Unsupported object type for deployment: ${spec.kind}`
          );
      }
    } catch (error) {
      this.logger.error(`❌ Failed to deploy ${spec.metadata.name}:`);
      this.logger.error(`Full error details:`, error);
      return {
        success: false,
        objectName: spec.metadata.name,
        objectType: spec.kind,
        messages: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  private async deployInterface(
    spec: GenericSpec,
    options: DeploymentOptions
  ): Promise<DeploymentResult> {
    const interfaceName = spec.spec.name;
    this.logger.debug(`📝 Creating interface: ${interfaceName}`);

    // Create interface via ADT REST API with correct XML format
    const createPayload = this.buildInterfaceCreatePayload(spec, options);
    this.logger.debug(`📦 Interface create payload:`, createPayload);

    const response = await this.connectionManager.request(
      '/sap/bc/adt/oo/interfaces',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.oo.interfaces.v1+xml',
          Accept: 'application/vnd.sap.adt.oo.interfaces.v1+xml',
        },
        body: createPayload,
      }
    );

    this.logger.debug(
      `📡 Interface creation response: ${response.status} ${response.statusText}`
    );
    const responseText = await response.text();
    this.logger.debug(`📋 Response body:`, responseText);

    if (!response.ok) {
      this.logger.error(
        `❌ Interface creation failed with ${response.status}: ${responseText}`
      );
      throw new Error(
        `Interface creation failed: ${response.status} ${response.statusText} - ${responseText}`
      );
    }

    // Update source code if provided
    if (spec.spec.sourceCode) {
      await this.updateObjectSource(
        interfaceName,
        'INTF',
        spec.spec.sourceCode,
        options
      );
    }

    // Activate object if requested
    if (options.activate !== false) {
      await this.activateObject(interfaceName, 'INTF', options);
    }

    return {
      success: true,
      objectName: interfaceName,
      objectType: 'INTF',
      transport: options.transport,
      messages: [`Interface ${interfaceName} deployed successfully`],
    };
  }

  private async deployClass(
    spec: GenericSpec,
    options: DeploymentOptions
  ): Promise<DeploymentResult> {
    const className = spec.spec.name;
    this.logger.debug(`📝 Creating class: ${className}`);

    const createPayload = this.buildClassCreatePayload(spec, options);

    const response = await this.connectionManager.request(
      '/sap/bc/adt/oo/classes',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.oo.classes.v1+xml',
          Accept: 'application/vnd.sap.adt.oo.classes.v1+xml',
        },
        body: createPayload,
      }
    );

    if (!response.ok) {
      const responseText = await response.text();
      this.logger.error(
        `❌ Class creation failed with ${response.status}: ${responseText}`
      );
      throw new Error(
        `Class creation failed: ${response.status} ${response.statusText} - ${responseText}`
      );
    }

    if (spec.spec.sourceCode) {
      await this.updateObjectSource(
        className,
        'CLAS',
        spec.spec.sourceCode,
        options
      );
    }

    if (options.activate !== false) {
      await this.activateObject(className, 'CLAS', options);
    }

    return {
      success: true,
      objectName: className,
      objectType: 'CLAS',
      transport: options.transport,
      messages: [`Class ${className} deployed successfully`],
    };
  }

  private async deployDomain(
    spec: GenericSpec,
    options: DeploymentOptions
  ): Promise<DeploymentResult> {
    const domainName = spec.spec.name;
    this.logger.debug(`📝 Creating domain: ${domainName}`);

    const createPayload = this.buildDomainCreatePayload(spec, options);

    const response = await this.connectionManager.request(
      '/sap/bc/adt/ddic/domains',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/vnd.sap.adt.ddic.domains.v1+xml',
          Accept: 'application/vnd.sap.adt.ddic.domains.v1+xml',
        },
        body: createPayload,
      }
    );

    if (!response.ok) {
      throw new Error(
        `Domain creation failed: ${response.status} ${response.statusText}`
      );
    }

    if (options.activate !== false) {
      await this.activateObject(domainName, 'DOMA', options);
    }

    return {
      success: true,
      objectName: domainName,
      objectType: 'DOMA',
      transport: options.transport,
      messages: [`Domain ${domainName} deployed successfully`],
    };
  }

  private buildInterfaceCreatePayload(
    spec: GenericSpec,
    options: DeploymentOptions
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<intf:abapInterface xmlns:intf="http://www.sap.com/adt/oo/interfaces" 
                    xmlns:adtcore="http://www.sap.com/adt/core" 
                    adtcore:description="${
                      spec.spec.description || spec.metadata.description
                    }"
                    adtcore:language="EN"
                    adtcore:name="${spec.spec.name}"
                    adtcore:type="INTF/OI"
                    adtcore:masterLanguage="${spec.spec.language || 'EN'}"
                    adtcore:masterSystem="H01"
                    adtcore:responsible="${
                      process.env.SAP_USER || 'DEVELOPER'
                    }">
    
  <adtcore:packageRef adtcore:name="${options.package || 'ZPEPL'}"/>
  ${
    options.transport
      ? `<adtcore:corroboratedBy adtcore:name="${options.transport}"/>`
      : ''
  }
</intf:abapInterface>`;
  }

  private buildClassCreatePayload(
    spec: GenericSpec,
    options: DeploymentOptions
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<class:abapClass xmlns:class="http://www.sap.com/adt/oo/classes" 
                 xmlns:adtcore="http://www.sap.com/adt/core" 
                 adtcore:description="${
                   spec.spec.description || spec.metadata.description
                 }"
                 adtcore:language="EN"
                 adtcore:name="${spec.spec.name}"
                 adtcore:type="CLAS/OC"
                 adtcore:masterLanguage="${spec.spec.language || 'EN'}"
                 adtcore:masterSystem="H01"
                 adtcore:responsible="${process.env.SAP_USER || 'DEVELOPER'}"
                 class:final="${spec.spec.final ? 'true' : 'false'}"
                 class:abstract="${spec.spec.abstract ? 'true' : 'false'}">
    
  <adtcore:packageRef adtcore:name="${options.package || 'ZPEPL'}"/>
  ${
    options.transport
      ? `<adtcore:corroboratedBy adtcore:name="${options.transport}"/>`
      : ''
  }
</class:abapClass>`;
  }

  private buildDomainCreatePayload(
    spec: GenericSpec,
    options: DeploymentOptions
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<ddic:domain xmlns:ddic="http://www.sap.com/adt/ddic/domains" 
             xmlns:adtcore="http://www.sap.com/adt/core"
             adtcore:type="DOMA/DO"
             adtcore:description="${
               spec.spec.description || spec.metadata.description
             }"
             adtcore:name="${spec.spec.name}"
             adtcore:masterLanguage="E"
             adtcore:responsible="${process.env.SAP_USER || 'DEVELOPER'}"
             ddic:dataType="${spec.spec.dataType}"
             ddic:length="${spec.spec.length}"
             ddic:decimals="${spec.spec.decimals || 0}">
  <adtcore:packageRef adtcore:name="${options.package || 'ZPEPL'}"/>
  ${
    options.transport
      ? `<adtcore:corroboratedBy adtcore:name="${options.transport}"/>`
      : ''
  }
</ddic:domain>`;
  }

  private async updateObjectSource(
    objectName: string,
    objectType: string,
    sourceCode: string,
    options: DeploymentOptions
  ): Promise<void> {
    this.logger.debug(
      `📝 Updating source code for ${objectType}: ${objectName}`
    );

    const endpoint = this.getSourceEndpoint(objectType, objectName);

    const response = await this.connectionManager.request({
      method: 'PUT',
      endpoint,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Accept: 'text/plain',
      },
      body: sourceCode,
    });

    if (!response.ok) {
      throw new Error(
        `Source update failed: ${response.status} ${response.statusText}`
      );
    }
  }

  private async activateObject(
    objectName: string,
    objectType: string,
    options: DeploymentOptions
  ): Promise<void> {
    this.logger.debug(`⚡ Activating ${objectType}: ${objectName}`);

    const activationPayload = `<?xml version="1.0" encoding="UTF-8"?>
<adtcore:objectReferences xmlns:adtcore="http://www.sap.com/adt/core">
  <adtcore:objectReference adtcore:uri="/sap/bc/adt/oo/${this.getObjectPath(
    objectType
  )}/${objectName.toLowerCase()}" 
                           adtcore:name="${objectName}"/>
</adtcore:objectReferences>`;

    const response = await this.connectionManager.request({
      method: 'POST',
      endpoint: '/sap/bc/adt/activation',
      headers: {
        'Content-Type': 'application/vnd.sap.adt.activation+xml',
        Accept: 'application/vnd.sap.adt.activation+xml',
      },
      body: activationPayload,
    });

    if (!response.ok) {
      throw new Error(
        `Activation failed: ${response.status} ${response.statusText}`
      );
    }
  }

  private getSourceEndpoint(objectType: string, objectName: string): string {
    switch (objectType) {
      case 'INTF':
        return `/sap/bc/adt/oo/interfaces/${objectName.toLowerCase()}/source/main`;
      case 'CLAS':
        return `/sap/bc/adt/oo/classes/${objectName.toLowerCase()}/source/main`;
      default:
        throw new Error(
          `Source endpoint not defined for object type: ${objectType}`
        );
    }
  }

  private getObjectPath(objectType: string): string {
    switch (objectType) {
      case 'INTF':
        return 'interfaces';
      case 'CLAS':
        return 'classes';
      case 'DOMA':
        return 'ddic/domains';
      default:
        throw new Error(
          `Object path not defined for object type: ${objectType}`
        );
    }
  }
}
