<!--
  RegistryRepositoryField — subscribe-wizard input for the registry/repository
  parameter (service:registry:<tool>:registry). Instead of free text, it is a
  search-as-you-type autocomplete backed by the tool's own REST resource, which
  lists the repositories/registries that actually exist in the remote instance:

      GET rest/service/registry/<tool>/<node>/<criteria>   → [{ id, name }, …]

  where <node> is the subscribed instance (its saved url / user / password reach
  the remote tool) and <criteria> is what the user typed. Provided by the parent
  plugin-registry via `parameterField`, so every registry tool (Nexus, Harbor,
  Artifactory) shares it.

  Uses LigojAutocomplete (from the host) which suppresses the browser's native
  autofill — server-side filtering only (`no-filter`).
-->
<template>
  <LigojAutocomplete
    :model-value="modelValue"
    :items="items"
    :loading="loading"
    :label="label"
    :rules="rules"
    item-title="name"
    item-value="id"
    no-filter
    clearable
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    @update:model-value="$emit('update:modelValue', $event ?? null)"
    @update:search="onSearch"
    @update:menu="onMenu"
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useApi, useI18nStore, LigojAutocomplete } from '@ligoj/host'

const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  parameter: { type: Object, default: () => ({}) },
  formValues: { type: Object, default: () => ({}) },
  mode: { type: String, default: null },
  isNode: { type: Boolean, default: false },
  nodeId: { type: String, default: null },
  instanceNodeId: { type: String, default: null },
})
defineEmits(['update:modelValue'])

const api = useApi()
const i18n = useI18nStore()

const items = ref([])
const loading = ref(false)
let lastQuery = null

// Tool segment of the parameter id: service:registry:<tool>:registry.
const tool = computed(() => String(props.parameter?.id || '').split(':')[2] || '')
// Prefer the subscribed instance (its saved credentials reach the remote tool);
// fall back to the tool node when there is no instance yet.
const node = computed(() => props.instanceNodeId || props.nodeId || '')

// The sibling artifact type (service:registry:<tool>:type) selected in the same
// form. When set, the search is filtered to that type so a docker registry
// doesn't suggest maven repositories.
const typeParamId = computed(() => String(props.parameter?.id || '').replace(/:registry$/, ':type'))
const selectedType = computed(() => {
  const v = props.formValues?.[typeParamId.value]
  return (v == null || v === '') ? '' : String(v)
})
// Re-filter from scratch whenever the chosen type changes.
watch(selectedType, () => { items.value = []; lastQuery = null })

const label = computed(() => {
  const id = props.parameter?.id
  const translated = id ? i18n.t(id) : ''
  const base = translated && translated !== id ? translated : (id || '')
  return props.parameter?.mandatory ? `${base} *` : base
})
const rules = computed(() => (props.parameter?.mandatory
  ? [(v) => (v != null && v !== '') || i18n.t('wizard.rule.required')]
  : []))

async function search(raw) {
  const criteria = String(raw ?? '').trim()
  // The REST path needs a non-empty criteria segment, plus a tool + node.
  if (!tool.value || !node.value || !criteria) { items.value = []; return }
  if (criteria === lastQuery) return
  lastQuery = criteria
  loading.value = true
  try {
    let url = `rest/service/registry/${tool.value}/${encodeURIComponent(node.value)}/${encodeURIComponent(criteria)}`
    if (selectedType.value) url += `?type=${encodeURIComponent(selectedType.value)}`
    const data = await api.get(url, { silent: true })
    const list = Array.isArray(data) ? data : (data?.data || [])
    items.value = list.map((r) => ({ id: r.id ?? r.name, name: r.name ?? r.id }))
  } catch {
    items.value = []
  } finally {
    loading.value = false
  }
}
function onSearch(q) { search(q) }
// Keep the current value visible when the menu opens before any search runs.
function onMenu(open) {
  if (open && props.modelValue != null && props.modelValue !== '' && !items.value.some((i) => i.id === props.modelValue)) {
    items.value = [{ id: props.modelValue, name: String(props.modelValue) }, ...items.value]
  }
}
</script>
