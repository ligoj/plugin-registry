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
}

export default service
