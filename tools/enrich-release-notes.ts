#!/usr/bin/env node
/**
 * Enrich GitHub release notes with PR author @mentions that Nx missed.
 *
 * Nx's changelog generator resolves git author emails to GitHub usernames
 * via ungh.cc and GitHub search. If a contributor's email is private on
 * GitHub, both lookups fail and the author is listed without an @mention —
 * which means GitHub's release "Contributors" section skips them entirely.
 *
 * This script fills the gap by querying the GitHub PR API directly, which
 * always knows the PR author's login regardless of email privacy settings.
 *
 * Usage: npx tsx tools/enrich-release-notes.ts <tag> [previous_tag]
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const SILENT = { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] } as const;

function gh(endpoint: string, jq?: string): string {
  const args = ['gh', 'api', endpoint];
  if (jq) args.push('--jq', jq);
  return execFileSync('gh', args, SILENT).trim();
}

function getPreviousTag(tag: string): string | null {
  try {
    return execFileSync(
      'git',
      ['describe', '--tags', '--abbrev=0', `${tag}^`],
      SILENT,
    ).trim();
  } catch {
    return null;
  }
}

function getPrNumbers(prevTag: string, tag: string): number[] {
  const raw = execFileSync(
    'gh',
    [
      'api',
      `repos/{owner}/{repo}/compare/${prevTag}...${tag}`,
      '--paginate',
      '--jq',
      '.commits[].commit.message',
    ],
    SILENT,
  );
  const numbers = new Set<number>();
  for (const m of raw.matchAll(/#(\d+)/g)) {
    numbers.add(Number.parseInt(m[1], 10));
  }
  return [...numbers].sort((a, b) => a - b);
}

function getPrAuthor(pr: number): string | null {
  try {
    return gh(`repos/{owner}/{repo}/pulls/${pr}`, '.user.login') || null;
  } catch {
    return null;
  }
}

function resolveArgs(tag: string): { tag: string; prevTag: string } | null {
  const prevTag = process.argv[3] ?? getPreviousTag(tag);
  if (!prevTag) {
    console.log('No previous tag found, skipping enrichment');
    return null;
  }
  return { tag, prevTag };
}

function getReleaseBody(tag: string): { id: string; body: string } | null {
  const id = gh(`repos/{owner}/{repo}/releases/tags/${tag}`, '.id');
  if (!id) {
    console.error(`Release ${tag} not found`);
    process.exit(1);
  }
  return { id, body: gh(`repos/{owner}/{repo}/releases/${id}`, '.body') };
}

function findMissingContributors(
  prAuthors: Map<number, string>,
  body: string,
): string[] {
  const alreadyMentioned = new Set(
    body.match(/@[A-Za-z0-9_-]+(?:\[bot\])?/g) ?? [],
  );
  const missing: string[] = [];
  for (const [pr, login] of [...prAuthors.entries()].sort(
    (a, b) => a[0] - b[0],
  )) {
    if (login.includes('[bot]')) continue;
    const mention = `@${login}`;
    if (alreadyMentioned.has(mention)) continue;
    missing.push(`${mention} (#${pr})`);
  }
  return missing;
}

function insertIntoThankYou(body: string, missing: string[]): string {
  const lines = body.split('\n');
  const out: string[] = [];
  let inThanks = false;
  let inserted = false;

  for (const line of lines) {
    if (line.includes('### ❤️ Thank You')) {
      inThanks = true;
      out.push(line);
      continue;
    }
    if (
      inThanks &&
      line.trim().startsWith('### ') &&
      !line.includes('Thank You')
    ) {
      if (!inserted) {
        for (const m of missing) out.push(`- ${m}`);
        out.push('');
        inserted = true;
      }
      inThanks = false;
      out.push(line);
      continue;
    }
    out.push(line);
  }

  if (inThanks && !inserted) {
    for (const m of missing) out.push(`- ${m}`);
    inserted = true;
  }

  if (!inserted) {
    out.push('', '### ❤️ Thank You', '');
    for (const m of missing) out.push(`- ${m}`);
  }

  return out.join('\n');
}

function updateRelease(
  releaseId: string,
  tag: string,
  newBody: string,
): string {
  const tmpFile = `/tmp/release-body-${tag}.md`;
  writeFileSync(tmpFile, newBody);
  return execFileSync(
    'gh',
    [
      'api',
      '--method',
      'PATCH',
      `repos/{owner}/{repo}/releases/${releaseId}`,
      '-F',
      `body=${tmpFile}`,
      '--jq',
      '.html_url',
    ],
    SILENT,
  ).trim();
}

function main(): void {
  const tag = process.argv[2];
  if (!tag) {
    console.error('Usage: enrich-release-notes.ts <tag> [previous_tag]');
    process.exit(1);
  }

  const resolved = resolveArgs(tag);
  if (!resolved) return;

  console.log(`Enriching release ${tag} (range: ${resolved.prevTag}..${tag})`);

  const release = getReleaseBody(tag);

  const prNumbers = getPrNumbers(resolved.prevTag, tag);
  if (prNumbers.length === 0) {
    console.log('No PR references found in commits');
    return;
  }

  const prAuthors = new Map<number, string>();
  for (const pr of prNumbers) {
    const login = getPrAuthor(pr);
    if (login) prAuthors.set(pr, login);
  }

  if (prAuthors.size === 0) {
    console.log('No PR authors resolved');
    return;
  }

  const missing = findMissingContributors(prAuthors, release.body);
  if (missing.length === 0) {
    console.log('All PR authors already credited — nothing to enrich');
    return;
  }

  console.log(`Missing contributors: ${missing.join(', ')}`);
  const newBody = insertIntoThankYou(release.body, missing);
  const result = updateRelease(release.id, tag, newBody);

  console.log(`Release notes enriched: ${result}`);
  console.log(`Added: ${missing.join(', ')}`);
}

main();
