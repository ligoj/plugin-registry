<!--
  RegistryTypeField — subscribe-wizard input for the registry artifact `type`
  SELECT parameter (service:registry:<tool>:type). Renders each allowed value
  (docker / maven / nuget / npm / python) prefixed with its icon — both in the
  closed selection and in the dropdown — so the wizard shows the same icon
  vocabulary as the subscription row's registry chip.

  Provided by the parent `plugin-registry` via `parameterField`, so every
  registry tool (Harbor, Nexus, Artifactory) shares this one field. It binds
  the value exactly like the wizard's default <v-select> (the option string),
  only adding the icons.
-->
<template>
  <v-select
    :model-value="modelValue"
    :items="items"
    :label="label"
    :rules="rules"
    variant="outlined"
    density="comfortable"
    hide-details="auto"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <template #selection="{ item }">
      <v-icon size="18" class="mr-2">{{ iconFor(item.value) }}</v-icon>{{ item.title }}
    </template>
    <template #item="{ item, props: itemProps }">
      <v-list-item v-bind="itemProps">
        <template #prepend>
          <v-icon>{{ iconFor(item.value) }}</v-icon>
        </template>
      </v-list-item>
    </template>
  </v-select>
</template>

<script setup>
import { computed } from 'vue'
import { useI18nStore } from '@ligoj/host'

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  parameter: { type: Object, default: () => ({}) },
})
defineEmits(['update:modelValue'])

// Artifact-type → icon. Same mapping as the tools' registry chip.
const TYPE_ICONS = {
  docker: 'mdi-docker',
  maven: 'mdi-language-java',
  nuget: 'mdi-nuget',
  npm: 'mdi-npm',
  python: 'mdi-language-python',
}

function iconFor(value) {
  return TYPE_ICONS[String(value ?? '').toLowerCase()] || 'mdi-package-variant'
}

const i18n = useI18nStore()
const items = computed(() => props.parameter?.values || [])
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
