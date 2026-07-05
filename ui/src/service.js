/*
 * Service layer for plugin "registry" (Artifact registry, service-level).
 *
 * The parent owns no rendering of its own: the tool plugins
 * (registry-harbor, registry-nexus) own their rendering and the parent
 * delegates the subscription-row hooks (`renderFeatures`,
 * `renderDetailsKey`, `renderDetailsFeatures`) to the registry-<tool>
 * sub-plugin resolved from the node id — the same pattern as `scm` →
 * `scm-github` and `vm` → `vm-aws`.
 *
 * Kept free of Vue SFC imports so it can be unit-tested without a DOM.
 */
import { toolPluginId, delegateFeature } from '@ligoj/host'
import RegistryTypeField from './RegistryTypeField.vue'

/**
 * Derive the sub-plugin id for a registry tool subscription. A registry
 * node id is `service:registry:<tool>[:<instance>]` — segment 3 is the
 * tool, so `service:registry:<tool>:1` → `registry-<tool>`. Returns null
 * when there is no tool segment to delegate to.
 */
export const subPluginIdFor = toolPluginId

/** Delegate `action` to the registry-<tool> sub-plugin; `[]` on any failure. */
export const delegateToToolPlugin = (subscription, action) => delegateFeature(subscription, action, 'registry')

const service = {
  subPluginIdFor,
  delegateToToolPlugin,

  /** Subscription-row buttons — delegated wholesale to the registry-<tool>. */
  renderFeatures(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderFeatures')
    return out.length ? out : []
  },

  /** Resource-key chips for the details column — delegated to the tool. */
  renderDetailsKey(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderDetailsKey')
    return out.length ? out : null
  },

  /** Live detail chips — delegated to the tool. */
  renderDetailsFeatures(subscription) {
    const out = delegateToToolPlugin(subscription, 'renderDetailsFeatures')
    return out.length ? out : null
  },

  /*
   * Subscribe-wizard field for the registry artifact `type` SELECT
   * (service:registry:<tool>:type): a value picker showing each type's icon.
   * Owned by the parent so all registry tools share one field — the wizard
   * asks the sub-plugin first (which has no parameterField) then falls back
   * to us. Any other parameter uses the wizard's default type-based input.
   */
  parameterField({ parameter } = {}) {
    return /^service:registry:[^:]+:type$/.test(parameter?.id || '') ? RegistryTypeField : null
  },

  /*
   * Order the connection parameters common to every registry tool: url,
   * then user, then the secret (whichever of password / secret / token the
   * tool defines) — ahead of the default name-ascending order. Owned by the
   * parent so all registry tools share it; ids are derived from the node id
   * (`service:registry:<tool>`), and any parameter absent from the current
   * form is skipped. A tool plugin that needs a different layout (e.g.
   * registry-nexus' type-before-registry on subscription) returns its own
   * and is consulted first.
   */
  parameterLayout({ nodeId } = {}) {
    if (!nodeId) return []
    return [{ parameters: [`${nodeId}:url`, `${nodeId}:user`, `${nodeId}:password`, `${nodeId}:secret`, `${nodeId}:token`] }]
  },
}

export default service
