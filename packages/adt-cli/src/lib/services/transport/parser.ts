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

  parseTransportList(xmlContent: string): TransportList {
    const result = this.parser.parse(xmlContent);

    // This is a placeholder - we'll need to adjust based on actual ADT XML structure
    const transports: Transport[] = [];

    // ADT XML structure is typically:
    // <asx:abap>
    //   <asx:values>
    //     <TRANSPORTS>
    //       <item>
    //         <TRKORR>TR_NUMBER</TRKORR>
    //         <AS4TEXT>Description</AS4TEXT>
    //         ...
    //       </item>
    //     </TRANSPORTS>
    //   </asx:values>
    // </asx:abap>

    // We'll implement the actual parsing once we see the real XML structure
    console.log('Transport XML structure:', JSON.stringify(result, null, 2));

    return {
      transports,
      totalCount: transports.length,
    };
  }

  private parseTransport(transportData: any): Transport {
    return {
      number: transportData.TRKORR || transportData['@number'] || '',
      description: transportData.AS4TEXT || transportData.description || '',
      status: this.parseStatus(transportData.TRSTATUS || transportData.status),
      owner: transportData.AS4USER || transportData.owner || '',
      created: this.parseDate(transportData.AS4DATE || transportData.created),
      target: transportData.TARGET || transportData.target,
      tasks: this.parseTasks(transportData.tasks || transportData.TASKS || []),
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

    // Handle ABAP date format (YYYYMMDD)
    if (typeof dateStr === 'string' && dateStr.length === 8) {
      const year = parseInt(dateStr.substring(0, 4));
      const month = parseInt(dateStr.substring(4, 6)) - 1; // Month is 0-based
      const day = parseInt(dateStr.substring(6, 8));
      return new Date(year, month, day);
    }

    return new Date(dateStr);
  }

  private parseTasks(tasksData: any[]): Task[] {
    if (!Array.isArray(tasksData)) return [];

    return tasksData.map((taskData) => ({
      number: taskData.TRKORR || taskData.number || '',
      description: taskData.AS4TEXT || taskData.description || '',
      status: this.parseStatus(taskData.TRSTATUS || taskData.status),
      owner: taskData.AS4USER || taskData.owner || '',
      created: this.parseDate(taskData.AS4DATE || taskData.created),
      type: taskData.TRFUNCTION || taskData.type || '',
    }));
  }
}
