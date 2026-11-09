export type SlugEntityType =
  | "syllabus_topic" | "editorial" | "lexicon_entry" | "pyq"
  | "mains_prompt" | "test" | "vault_note" | "course" | "resource";

export interface SlugRegistryRecord {
  slugPath: string;
  entityType: SlugEntityType;
  canonicalId: string;
  parentSlug?: string | null;
  language?: "en" | "hi" | "bi";
}

export interface SlugAliasRecord {
  aliasPath: string;
  canonicalId: string;
}

const SEGMENT_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SEGMENT_LENGTH = 64;

/** Normalize a human-readable title into a stable ASCII URL segment.
 * Hindi content should use its approved English/transliterated canonical title.
 */
export function normalizeSlugSegment(input: string): string {
  const normalized = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");

  if (!normalized) throw new Error("Slug segment must contain ASCII letters or numbers.");
  if (normalized.length > MAX_SEGMENT_LENGTH) {
    throw new Error(`Slug segment exceeds ${MAX_SEGMENT_LENGTH} characters.`);
  }
  return normalized;
}

/** Validate a namespace-qualified path such as syllabus/upsc/gov-constitution. */
export function validateSlugPath(path: string): string {
  const canonical = path.trim().replace(/^\/+|\/+$/g, "");
  const segments = canonical.split("/");
  if (segments.length < 2) throw new Error("Slug paths must include a namespace and entity segment.");
  for (const segment of segments) {
    if (segment.length > MAX_SEGMENT_LENGTH || !SEGMENT_PATTERN.test(segment)) {
      throw new Error(`Invalid slug path segment: ${segment}`);
    }
  }
  return segments.join("/");
}

/** Resolve canonical paths first, then historical aliases.
 * The caller should issue HTTP 308 when matched through an alias.
 */
export function resolveSlugPath(
  path: string,
  canonicalRecords: readonly SlugRegistryRecord[],
  aliases: readonly SlugAliasRecord[] = [],
): { record: SlugRegistryRecord; redirected: boolean; canonicalPath: string } | null {
  let requested: string;
  try {
    requested = validateSlugPath(decodeURIComponent(path));
  } catch {
    return null;
  }

  const record = canonicalRecords.find((item) => item.slugPath === requested);
  if (record) return { record, redirected: false, canonicalPath: record.slugPath };

  const alias = aliases.find((item) => item.aliasPath === requested);
  if (!alias) return null;
  const target = canonicalRecords.find((item) => item.canonicalId === alias.canonicalId);
  if (!target) return null;
  return { record: target, redirected: true, canonicalPath: target.slugPath };
}
