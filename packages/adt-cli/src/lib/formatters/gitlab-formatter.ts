import { writeFile } from 'fs/promises';
import { AtcResult, AtcFinding } from '../services/atc/service';

export async function outputGitLabCodeQuality(
  result: AtcResult,
  outputFile: string
): Promise<void> {
  // Transform ATC findings to GitLab Code Quality format
  const gitlabReport = result.findings.map((finding: AtcFinding) => {
    // Map ATC priority to GitLab severity
    let severity: string;
    switch (finding.priority) {
      case 1:
        severity = 'blocker';
        break;
      case 2:
        severity = 'major';
        break;
      case 3:
        severity = 'minor';
        break;
      default:
        severity = 'info';
        break;
    }

    // Extract file path from object reference
    const filePath = `src/${finding.objectType.toLowerCase()}/${finding.objectName.toLowerCase()}.${finding.objectType.toLowerCase()}`;

    // Create unique fingerprint for the finding
    const fingerprint = `${finding.checkId}-${finding.objectName}-${
      finding.location?.line || 0
    }`;

    return {
      description: finding.messageText,
      check_name: finding.checkTitle || finding.checkId,
      fingerprint,
      severity,
      location: {
        path: filePath,
        lines: {
          begin: finding.location?.line || 1,
          end: finding.location?.line || 1,
        },
      },
    };
  });

  await writeFile(outputFile, JSON.stringify(gitlabReport, null, 2));
  console.log(`\n📄 GitLab Code Quality report written to: ${outputFile}`);
  console.log(`📊 ${result.totalFindings} issues exported`);
}
