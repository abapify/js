import { XMLParser } from 'fast-xml-parser';
import { Transport, Task, TransportList, TransportObject } from './types';

export class TransportParser {
  private parser: XMLParser;

  constructor() {
    this.parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@',
      parseAttributeValue: true,
      trimValues: true,
    });
  }

  parseTransportList(xmlContent: string, debug = false): TransportList {
    const result = this.parser.parse(xmlContent);

    if (debug) {
      console.log('📄 Received', xmlContent.length, 'bytes of transport XML');
      console.log('First 500 chars of XML:', xmlContent.substring(0, 500));
      console.log('Transport XML structure:', JSON.stringify(result, null, 2));
    }

    const transports: Transport[] = [];

    // The actual XML structure from ADT shows tm:root but might have nested transport data
    // Let's explore the structure more thoroughly
    if (result['tm:root'] || result.root) {
      const root = result['tm:root'] || result.root;

      // Look for transport requests in the actual ADT structure
      const workbench = root['tm:workbench'];
      if (workbench) {
        const target = workbench['tm:target'];
        if (target) {
          const modifiable = target['tm:modifiable'];
          if (modifiable) {
            const requests = modifiable['tm:request'];
            if (requests) {
              if (debug) {
                console.log(
                  'Found transport requests in tm:workbench > tm:target > tm:modifiable > tm:request'
                );
              }

              if (Array.isArray(requests)) {
                for (const item of requests) {
                  const transport = this.parseTransport(item);
                  if (transport) transports.push(transport);
                }
              } else {
                const transport = this.parseTransport(requests);
                if (transport) transports.push(transport);
              }
            }
          }
        }
      }

      // If no transport nodes found, this might be an empty result or different structure
      if (transports.length === 0 && debug) {
        console.log('No transport nodes found in expected locations');
        console.log('Root keys:', Object.keys(root));
      }
    }

    return {
      transports,
      totalCount: transports.length,
    };
  }

  parseTransportDetail(
    xmlContent: string,
    requestedNumber: string,
    debug = false
  ): Transport | null {
    const result = this.parser.parse(xmlContent);

    if (debug) {
      console.log(
        '📄 Received',
        xmlContent.length,
        'bytes of transport detail XML'
      );
      console.log(
        'Transport detail XML structure:',
        JSON.stringify(result, null, 2)
      );
    }

    // Check if this is a task request vs transport request
    const root = result['tm:root'];
    const requestedIsTask =
      root?.['@adtcore:name'] === requestedNumber &&
      root?.['@tm:object_type'] === 'T';

    if (debug) {
      console.log(
        `Requested: ${requestedNumber}, Found root name: ${root?.['@adtcore:name']}, Object type: ${root?.['@tm:object_type']}`
      );
      console.log(`Is task request: ${requestedIsTask}`);
    }

    // Try to find the transport in different possible locations
    const possibleTransportNodes = [
      result['tm:root']?.['tm:request'], // Detail API structure
      result['tm:request'],
      result['asx:abap']?.['asx:values']?.['TRANSPORT'],
      result.transport,
      result.request,
      result,
    ];

    for (const node of possibleTransportNodes) {
      if (node && typeof node === 'object') {
        const transport = this.parseTransport(node);
        if (transport && transport.number) {
          // If this was a task request, we need to make sure the task is included
          if (requestedIsTask && root?.['tm:task']) {
            const taskData = root['tm:task'];
            const task = this.parseTask(taskData);
            if (task) {
              // Add the task to the transport if not already there
              if (!transport.tasks) transport.tasks = [];
              if (!transport.tasks.find((t) => t.number === task.number)) {
                transport.tasks.push(task);
              }
            }
          }
          return transport;
        }
      }
    }

    if (debug) {
      console.log('Could not find transport in expected locations');
      console.log('Root keys:', Object.keys(result));
    }

    return null;
  }

  private parseTask(taskData: any): Task {
    return {
      number: taskData['@tm:number'] || '',
      description: taskData['@tm:desc'] || '',
      status: this.parseStatus(taskData['@tm:status']),
      owner: taskData['@tm:owner'] || '',
      created: this.parseDate(taskData['@tm:lastchanged_timestamp']),
      type: taskData['@tm:type'] || '',
    };
  }

  private parseTransport(transportData: any): Transport {
    return {
      number: transportData['@tm:number'] || '',
      description: transportData['@tm:desc'] || '',
      status: this.parseStatus(transportData['@tm:status']),
      owner: transportData['@tm:owner'] || '',
      created: this.parseDate(transportData['@tm:lastchanged_timestamp']),
      target:
        transportData['@tm:target'] || transportData['@tm:target_desc'] || '',
      tasks: this.parseTasks(transportData['tm:task'] || []),
    };
  }

  private parseStatus(status: string): 'modifiable' | 'released' | 'protected' {
    switch (status?.toLowerCase()) {
      case 'modifiable':
      case 'd':
        return 'modifiable';
      case 'released':
      case 'r':
        return 'released';
      default:
        return 'protected';
    }
  }

  private parseDate(dateStr: string | number): Date {
    if (!dateStr) return new Date();

    // Handle ABAP timestamp format (YYYYMMDDHHMMSS)
    if (
      typeof dateStr === 'number' ||
      (typeof dateStr === 'string' && dateStr.length >= 8)
    ) {
      const dateString = dateStr.toString();
      const year = parseInt(dateString.substring(0, 4));
      const month = parseInt(dateString.substring(4, 6)) - 1; // Month is 0-based
      const day = parseInt(dateString.substring(6, 8));

      let hour = 0,
        minute = 0,
        second = 0;
      if (dateString.length >= 14) {
        hour = parseInt(dateString.substring(8, 10));
        minute = parseInt(dateString.substring(10, 12));
        second = parseInt(dateString.substring(12, 14));
      }

      return new Date(year, month, day, hour, minute, second);
    }

    return new Date(dateStr);
  }

  private parseTasks(tasksData: any): Task[] {
    if (!tasksData) return [];

    const tasks: Task[] = [];

    if (Array.isArray(tasksData)) {
      for (const taskData of tasksData) {
        tasks.push({
          number: taskData['@tm:number'] || '',
          description: taskData['@tm:desc'] || '',
          status: this.parseStatus(taskData['@tm:status']),
          owner: taskData['@tm:owner'] || '',
          created: this.parseDate(taskData['@tm:lastchanged_timestamp']),
          type: taskData['@tm:type'] || '',
        });
      }
    } else {
      tasks.push({
        number: tasksData['@tm:number'] || '',
        description: tasksData['@tm:desc'] || '',
        status: this.parseStatus(tasksData['@tm:status']),
        owner: tasksData['@tm:owner'] || '',
        created: this.parseDate(tasksData['@tm:lastchanged_timestamp']),
        type: tasksData['@tm:type'] || '',
      });
    }

    return tasks;
  }

  parseTransportObjects(xmlContent: string, debug = false): TransportObject[] {
    const result = this.parser.parse(xmlContent);

    if (debug) {
      console.log(
        '📄 Received',
        xmlContent.length,
        'bytes of transport objects XML'
      );
      console.log('First 500 chars of XML:', xmlContent.substring(0, 500));
      console.log(
        'Transport objects XML structure:',
        JSON.stringify(result, null, 2)
      );
    }

    const objects: TransportObject[] = [];

    // Parse transport objects from ADT XML structure
    // The structure may vary depending on the ADT API version and transport type
    const root = result['tm:root'] || result.root;
    if (root) {
      // Look for object entries in various possible locations
      const objectEntries = this.findObjectEntries(root, debug);

      for (const entry of objectEntries) {
        const obj = this.parseTransportObject(entry);
        if (obj) {
          objects.push(obj);
        }
      }
    }

    if (debug) {
      console.log(`Parsed ${objects.length} transport objects`);
    }

    return objects;
  }

  private findObjectEntries(root: any, debug = false): any[] {
    const entries: any[] = [];

    // Common ADT patterns for transport object entries
    const possiblePaths = [
      'tm:objects.tm:object',
      'tm:object',
      'objects.object',
      'object',
      'tm:entries.tm:entry',
      'tm:entry',
      'entries.entry',
      'entry',
    ];

    for (const path of possiblePaths) {
      const pathParts = path.split('.');
      let current = root;

      for (const part of pathParts) {
        if (current && current[part]) {
          current = current[part];
        } else {
          current = null;
          break;
        }
      }

      if (current) {
        if (Array.isArray(current)) {
          entries.push(...current);
        } else {
          entries.push(current);
        }

        if (debug) {
          console.log(`Found object entries at path: ${path}`);
        }
        break; // Use first matching path
      }
    }

    return entries;
  }

  private parseTransportObject(entry: any): TransportObject | null {
    try {
      // Extract object information from ADT XML entry
      const name = entry['@adtcore:name'] || entry['@name'] || entry.name || '';
      const type = entry['@adtcore:type'] || entry['@type'] || entry.type || '';
      const description =
        entry['@adtcore:description'] ||
        entry['@description'] ||
        entry.description ||
        '';
      const packageName =
        entry['@adtcore:package'] || entry['@package'] || entry.package || '';
      const uri = entry['@adtcore:uri'] || entry['@uri'] || entry.uri || '';

      // Build fullType from type and subtype if available
      const subtype = entry['@adtcore:subtype'] || entry['@subtype'] || '';
      const fullType = subtype ? `${type}/${subtype}` : type;

      if (!name || !type) {
        return null; // Skip entries without essential information
      }

      return {
        name,
        type,
        description,
        packageName,
        uri,
        fullType,
      };
    } catch (error) {
      return null; // Skip malformed entries
    }
  }
}
