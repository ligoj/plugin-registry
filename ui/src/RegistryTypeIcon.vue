<!--
  RegistryTypeIcon — the icon for a registry artifact type (docker, maven, npm…).

  Hosted by plugin-registry and shared with the tool plugins through the parent's
  `renderTypeIcon` feature, so the type SELECT, the subscription-row chips and
  every registry tool render the same icon for a given type.

  Each known type ships a brand SVG (webjars/service/registry/img/<type>.svg),
  served under the host base like every tool icon — so an <img> is rendered.
  An unrecognised type has no SVG and falls back to a generic mdi package icon.

  `size` accepts an mdi size token (x-small/small/large…) or a pixel number;
  `start` adds the leading gap used when the icon prefixes a chip label. Any
  other attribute (class, …) passes straight through.

  Styling is inline on purpose: the plugin's compiled CSS ships as a separate
  index.css that the host does not load, so a scoped <style> block would never
  apply — only inline styles (carried in the JS bundle) reliably take effect.
-->
<template>
  <img
    v-if="src"
    :src="src"
    :alt="type"
    :height="dim"
    :style="imgStyle"
    v-bind="$attrs"
  >
  <v-icon v-else :size="size" :start="start" v-bind="$attrs">{{ fallbackIcon }}</v-icon>
</template>

<script setup>
import { computed } from 'vue'
import { typeIcon, typeIconSrc } from './registryTypes.js'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  // Artifact type string (docker / maven / nuget / npm / python). An unknown or
  // empty value falls back to a generic package icon.
  type: { type: String, default: '' },
  size: { type: [String, Number], default: 'small' },
  start: { type: Boolean, default: false },
})

const src = computed(() => typeIconSrc(props.type))
const fallbackIcon = computed(() => typeIcon(props.type))

// mdi size tokens → the pixel height of the SVG <img>.
const dim = computed(() => {
  const s = props.size
  if (s === 'x-small') return 14
  if (s === 'small') return 18
  if (s === 'large') return 28
  if (s === 'x-large') return 36
  const n = Number(s)
  return Number.isFinite(n) ? n : 18
})

const imgStyle = computed(() => ({
  width: 'auto',
  verticalAlign: 'middle',
  objectFit: 'contain',
  // Leading gap before a chip label; inline so it survives without the CSS file.
  ...(props.start ? { marginInlineEnd: '8px' } : {}),
}))
</script>
