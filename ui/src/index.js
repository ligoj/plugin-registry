/*
 * Plugin "registry" — Artifact registry (service-level).
 *
 * Parent of the registry-<tool> plugins (Harbor, Nexus, …). It owns no
 * view of its own — like `plugin-scm` — so it ships only:
 *   - generic artifact-registry i18n;
 *   - the parent→child delegation hooks that merge a tool plugin's row
 *     features / detail chips into its own output, resolved via
 *     `subPluginIdFor`.
 *
 * Authored as source — compiled to `/main/registry/vue/index.js` by Vite.
 */
import { useI18nStore } from '@ligoj/host'
import enMessages from './i18n/en.js'
import frMessages from './i18n/fr.js'
import service from './service.js'

const features = {
  renderFeatures: service.renderFeatures,
  renderDetailsKey: service.renderDetailsKey,
  renderDetailsFeatures: service.renderDetailsFeatures,
}

export default {
  id: 'registry',
  label: 'Registry',
  // No routes / component — screens come from the tool plugins and the
  // host's generic subscription rows.
  install() {
    const i18n = useI18nStore()
    i18n.merge(enMessages, 'en')
    i18n.merge(frMessages, 'fr')
  },
  feature(action, ...args) {
    const fn = features[action]
    if (!fn) throw new Error(`Plugin "registry" has no feature "${action}"`)
    return fn(...args)
  },
  service,
  meta: { icon: 'mdi-package-variant-closed', color: 'blue-grey-darken-2' },
}

export { service }
