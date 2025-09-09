export interface AtcOptions {
  target: 'package' | 'transport';
  targetName: string;
  checkVariant?: string;
  maxResults?: number;
  includeExempted?: boolean;
  debug?: boolean;
}

export interface AtcResult {
  runId: string;
  worklistId: string;
  checkVariant: string;
  status: 'success' | 'error' | 'running';
  totalFindings: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  findings: AtcFinding[];
}

export interface AtcFinding {
  priority: number;
  checkId: string;
  checkTitle: string;
  messageText: string;
  objectName: string;
  objectType: string;
  location?: {
    line: number;
    column: number;
  };
}

export interface AtcOperations {
  run(options: AtcOptions): Promise<AtcResult>;
  getResults(runId: string): Promise<AtcResult>;
}
