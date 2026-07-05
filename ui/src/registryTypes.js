/*
 * Registry artifact-type → icon vocabulary.
 *
 * Single source of truth for the icon shown for each registry artifact type
 * (docker, maven, npm, …). Consumed directly inside plugin-registry (the type
 * SELECT field, the RegistryTypeIcon component) and — because a plugin cannot
 * import another plugin's bundle — shared with the tool plugins (Nexus, Harbor,
 * Artifactory) through the parent's `renderTypeIcon` feature, so the SELECT, the
 * subscription chips and every tool draw the same icon for a given type.
 *
 * Each type ships a real brand SVG (webjars/service/registry/img/<type>.svg);
 * the mdi map below is only the fallback for an unrecognised type.
 */
import { APP_BASE } from '@ligoj/host'

/** Artifact types shipping a brand SVG under webjars/service/registry/img. */
export const TYPE_SVGS = ['docker', 'maven', 'nuget', 'npm', 'python']

/** URL of an artifact type's brand SVG, or null when it has none (case
 *  -insensitive). Built against the host base so it resolves under the host's
 *  deployment, mirroring how NodeIcon builds tool-icon URLs. */
export function typeIconSrc(type) {
  const key = String(type ?? '').toLowerCase()
  return TYPE_SVGS.includes(key) ? `${APP_BASE}main/service/registry/img/${key}.svg` : null
}

export const TYPE_ICONS = {
  docker: 'mdi-docker',
  maven: 'mdi-language-java',
  nuget: 'mdi-nuget',
  npm: 'mdi-npm',
  python: 'mdi-language-python',
}

/** Display label for an artifact type — proper casing that a plain
 *  capitalisation can't produce (npm → NPM, nuget → NuGet). */
export const TYPE_LABELS = {
  docker: 'Docker',
  maven: 'Maven',
  nuget: 'NuGet',
  npm: 'NPM',
  python: 'Python',
}

/** mdi icon name for an artifact type (case-insensitive); package fallback. */
export function typeIcon(type) {
  return TYPE_ICONS[String(type ?? '').toLowerCase()] || 'mdi-package-variant'
}

/** Human label for an artifact type (case-insensitive). Unknown types are
 *  capitalised (`rust` → `Rust`); empty stays empty. */
export function typeLabel(type) {
  const key = String(type ?? '').toLowerCase()
  if (TYPE_LABELS[key]) return TYPE_LABELS[key]
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : ''
}
