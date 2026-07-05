<!--
  RegistryTypeField — subscribe-wizard input for the registry artifact `type`
  SELECT parameter (service:registry:<tool>:type). Each allowed value is shown
  with its icon and a properly-cased label (Docker, Maven, NuGet, NPM, Python),
  in both the closed selection and the dropdown — the same icon vocabulary as
  the subscription row's registry chip.

  Provided by the parent `plugin-registry` via `parameterField`, so every
  registry tool (Harbor, Nexus, Artifactory) shares this one field. The form
  binds the option VALUE ("docker"); a persisted SELECT arriving as its option
  INDEX ("0") is normalised back to the value so the picker still matches.
-->
<template>
  <v-select
    :model-value="selectedValue"
    :items="items"
    item-title="title"
    item-value="value"
    :label="label"
    :rules="rules"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selection="{ item }">
      <RegistryTypeIcon :type="item.value" size="18" class="mr-2" />{{ item.title }}
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps" :title="item.title">
        <template #prepend>
          <RegistryTypeIcon :type="item.value" />
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18nStore } from '@ligoj/host'
import RegistryTypeIcon from './RegistryTypeIcon.vue'
import { typeLabel } from './registryTypes.js'

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  parameter: { type: Object, default: () => ({}) },
})
defineEmits(['update:modelValue'])

const i18n = useI18nStore()

// One option per allowed artifact type: bound by its value string, shown with a
// proper label + icon.
const values = computed(() => props.parameter?.values || [])
const items = computed(() => values.value.map((v) => ({ title: typeLabel(v), value: v })))

// The value may arrive as the option value ("docker") or, from persisted data,
// as its option INDEX ("0"); normalise to the value so an option matches (and
// its label + icon show).
const selectedValue = computed(() => {
  const mv = props.modelValue
  if (mv == null || mv === '') return null
  const i = Number(mv)
  if (Number.isInteger(i) && String(i) === String(mv) && i >= 0 && i < values.value.length) return values.value[i]
  return mv
})

const label = computed(() => {
  const id = props.parameter?.id
  const translated = id ? i18n.t(id) : ''
  const base = translated && translated !== id ? translated : (id || '')
  return props.parameter?.mandatory ? `${base} *` : base
})
const rules = computed(() => (props.parameter?.mandatory
  ? [(v) => (v != null && v !== '') || i18n.t('wizard.rule.required')]
  : []))
</script>
