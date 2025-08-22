import { XMLParser } from 'fast-xml-parser';
import { Transport, Task, TransportList } from './types';

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
}
