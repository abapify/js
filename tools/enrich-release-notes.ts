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
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SILENT = { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] as const };

// Resolve binary paths once at startup to avoid PATH-based lookups in
// execFileSync (SonarCloud S4036).
const GH = execFileSync('which', ['gh'], SILENT).trim();
const GIT = execFileSync('which', ['git'], SILENT).trim();

// Validate that a string looks like a git tag (vX.Y.Z or similar).
// Prevents injection of malicious values via CLI args (SonarCloud S8705).
const TAG_RE = /^v?\d+\.\d+\.\d+(?:[-+].+)?$/;
function assertTag(value: string, label: string): void {
  if (!TAG_RE.test(value)) {
    throw new Error(`Invalid ${label}: ${value}`);
  }
}

// Validate that a string is a numeric release ID (SonarCloud S8705).
function assertReleaseId(value: string): void {
  if (!/^\d+$/.test(value)) {
    throw new Error(`Invalid release ID: ${value}`);
  }
}

function gh(endpoint: string, jq?: string): string {
  const args = ['api', endpoint];
  if (jq) args.push('--jq', jq);
  return execFileSync(GH, args, SILENT).trim();
}

function getPreviousTag(tag: string): string | null {
  try {
    return execFileSync(
      GIT,
      ['describe', '--tags', '--abbrev=0', `${tag}^`],
      SILENT,
    ).trim();
  } catch {
    return null;
  }
}

function getPrNumbers(prevTag: string, tag: string): number[] {
  const raw = execFileSync(
    GH,
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
  assertTag(tag, 'tag');
  const prevTag = process.argv[3] ?? getPreviousTag(tag);
  if (!prevTag) {
    console.log('No previous tag found, skipping enrichment');
    return null;
  }
  assertTag(prevTag, 'previous_tag');
  return { tag, prevTag };
}

function getReleaseBody(tag: string): { id: string; body: string } {
  const id = gh(`repos/{owner}/{repo}/releases/tags/${tag}`, '.id');
  if (!id) {
    console.error(`Release ${tag} not found`);
    process.exit(1);
  }
  assertReleaseId(id);
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

function appendToSection(lines: string[], missing: string[]): void {
  for (const m of missing) lines.push(`- ${m}`);
  lines.push('');
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
        appendToSection(out, missing);
        inserted = true;
      }
      inThanks = false;
      out.push(line);
      continue;
    }
    out.push(line);
  }

  if (inThanks && !inserted) {
    appendToSection(out, missing);
    inserted = true;
  }

  if (!inserted) {
    out.push('', '### ❤️ Thank You', '');
    appendToSection(out, missing);
  }

  return out.join('\n');
}

function updateRelease(
  releaseId: string,
  tag: string,
  newBody: string,
): string {
  // Use OS tmpdir with validated tag to construct a safe path (S8707).
  const tmpFile = join(tmpdir(), `release-body-${tag}.md`);
  writeFileSync(tmpFile, newBody);
  return execFileSync(
    GH,
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
