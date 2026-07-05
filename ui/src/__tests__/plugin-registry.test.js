/*
 * Contract tests for the registry service-level parent plugin: manifest
 * shape, i18n merge, and parent->tool delegation via subPluginIdFor.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { pluginRegistry, useI18nStore } from '@ligoj/host'
import def, { service } from '../index.js'
import { typeIcon, typeLabel, typeIconSrc, TYPE_ICONS } from '../registryTypes.js'

beforeEach(() => { setActivePinia(createPinia()) })

describe('plugin-registry manifest', () => {
  it('exposes a valid service-level manifest', () => {
    expect(def.id).toBe('registry')
    expect(def.label).toBe('Registry')
    expect(def.routes).toBeUndefined()
    expect(def.component).toBeUndefined()
    expect(typeof def.install).toBe('function')
    expect(typeof def.feature).toBe('function')
    expect(def.service).toBeTypeOf('object')
    expect(def.meta).toMatchObject({ icon: expect.any(String), color: expect.any(String) })
  })

  it('merges en + fr i18n on install', () => {
    const i18n = useI18nStore()
    def.install()
    expect(i18n.t('service:registry')).toBe('Registry')
    i18n.setLocale('fr')
    expect(i18n.t('service:registry')).toBe('Registre')
  })

  it('throws for an unknown feature', () => {
    expect(() => def.feature('nope')).toThrow(/Plugin "registry" has no feature "nope"/)
  })

  it('subPluginIdFor maps node ids to tool plugin ids', () => {
    expect(service.subPluginIdFor({ node: { id: 'service:registry:harbor:1' } })).toBe('registry-harbor')
    expect(service.subPluginIdFor({ node: { id: 'service:registry' } })).toBeNull()
    expect(service.subPluginIdFor({})).toBeNull()
  })

  it('returns empty results when no tool plugin is registered', () => {
    expect(def.feature('renderFeatures', { node: { id: 'service:registry:none:1' }, parameters: {} })).toEqual([])
    expect(def.feature('renderDetailsKey', { node: { id: 'service:registry:none:1' }, parameters: {} })).toBeNull()
    expect(def.feature('renderDetailsFeatures', { node: { id: 'service:registry:none:1' }, parameters: {} })).toBeNull()
  })

  it('parameterField provides the icon type-select for any registry :type parameter', () => {
    const field = def.feature('parameterField', { parameter: { id: 'service:registry:harbor:type', type: 'SELECT' } })
    expect(field).toBeTruthy()
    expect(field).toBe(def.feature('parameterField', { parameter: { id: 'service:registry:nexus:type' } }))
    // Any other parameter (or none) falls back to the wizard's default field.
    expect(def.feature('parameterField', { parameter: { id: 'service:registry:nexus:base-dn' } })).toBeNull()
    expect(def.feature('parameterField', {})).toBeNull()
  })

  it('parameterField provides the repository autocomplete for any registry :registry parameter', () => {
    const field = def.feature('parameterField', { parameter: { id: 'service:registry:nexus:registry' } })
    expect(field).toBeTruthy()
    // Shared across tools, and distinct from the type field.
    expect(field).toBe(def.feature('parameterField', { parameter: { id: 'service:registry:harbor:registry' } }))
    expect(field).not.toBe(def.feature('parameterField', { parameter: { id: 'service:registry:nexus:type' } }))
  })

  it('parameterLayout orders url, user then the secret for any registry node', () => {
    expect(def.feature('parameterLayout', { nodeId: 'service:registry:nexus' })).toEqual([{
      parameters: [
        'service:registry:nexus:url',
        'service:registry:nexus:user',
        'service:registry:nexus:password',
        'service:registry:nexus:secret',
        'service:registry:nexus:token',
      ],
    }])
    // Ids are derived from the node id, so it works for every tool.
    expect(def.feature('parameterLayout', { nodeId: 'service:registry:artifactory' })[0].parameters[0])
      .toBe('service:registry:artifactory:url')
    // No node id → nothing to order.
    expect(def.feature('parameterLayout', {})).toEqual([])
  })
})

describe('plugin-registry shared type icon', () => {
  it('typeIcon maps each known artifact type, case-insensitively', () => {
    expect(typeIcon('docker')).toBe('mdi-docker')
    expect(typeIcon('maven')).toBe('mdi-language-java')
    expect(typeIcon('npm')).toBe('mdi-npm')
    expect(typeIcon('NuGet')).toBe(TYPE_ICONS.nuget)  // case-insensitive
    expect(typeIcon('python')).toBe('mdi-language-python')
  })

  it('typeIcon falls back to a generic package icon for unknown/empty types', () => {
    expect(typeIcon('rust')).toBe('mdi-package-variant')
    expect(typeIcon('')).toBe('mdi-package-variant')
    expect(typeIcon(null)).toBe('mdi-package-variant')
    expect(typeIcon(undefined)).toBe('mdi-package-variant')
  })

  it('typeLabel gives each known type a proper label, case-insensitively', () => {
    expect(typeLabel('docker')).toBe('Docker')
    expect(typeLabel('maven')).toBe('Maven')
    expect(typeLabel('npm')).toBe('NPM')
    expect(typeLabel('NuGet')).toBe('NuGet')
    expect(typeLabel('python')).toBe('Python')
  })

  it('typeLabel capitalises unknown types and keeps empty empty', () => {
    expect(typeLabel('rust')).toBe('Rust')
    expect(typeLabel('')).toBe('')
    expect(typeLabel(null)).toBe('')
    expect(typeLabel(undefined)).toBe('')
  })

  it('typeIconSrc points at each type brand SVG, null when there is none', () => {
    expect(typeIconSrc('docker')).toMatch(/main\/service\/registry\/img\/docker\.svg$/)
    expect(typeIconSrc('NuGet')).toMatch(/\/nuget\.svg$/) // case-insensitive
    expect(typeIconSrc('rust')).toBeNull()
    expect(typeIconSrc('')).toBeNull()
    expect(typeIconSrc(null)).toBeNull()
  })

  it('renderTypeIcon returns the shared icon component with the type + forwarded attrs', () => {
    const vnode = def.feature('renderTypeIcon', { type: 'maven', size: 'small', start: true })
    expect(vnode.__v_isVNode).toBe(true)
    expect(vnode.props.type).toBe('maven')
    expect(vnode.props.size).toBe('small')
    expect(vnode.props.start).toBe(true)
    // Default (no opts) is still a valid vnode.
    expect(def.feature('renderTypeIcon').__v_isVNode).toBe(true)
  })
})

describe('plugin-registry -> tool delegation', () => {
  // A valid manifest (registry.register requires id + install) whose
  // feature() returns fake VNodes so every delegated hook hits its
  // "tool answered" branch.
  const fakeTool = {
    id: 'registry-foo',
    install() {},
    feature(action) {
      if (action === 'renderFeatures') return [{ __v_isVNode: true }]
      if (action === 'renderDetailsKey') return { __v_isVNode: true }
      if (action === 'renderDetailsFeatures') return [{ __v_isVNode: true }]
      throw new Error(`no feature "${action}"`)
    },
  }
  beforeEach(() => { pluginRegistry.register('registry-foo', fakeTool) })
  afterEach(() => { pluginRegistry.remove('registry-foo') })

  it('delegates renderFeatures to the registered tool', () => {
    const out = def.feature('renderFeatures', { node: { id: 'service:registry:foo:1' } })
    expect(Array.isArray(out)).toBe(true)
    expect(out[0].__v_isVNode).toBe(true)
  })

  it('delegates renderDetailsKey to the registered tool', () => {
    const out = def.feature('renderDetailsKey', { node: { id: 'service:registry:foo:1' } })
    expect(Array.isArray(out)).toBe(true)
    expect(out[0].__v_isVNode).toBe(true)
  })

  it('delegates renderDetailsFeatures to the registered tool', () => {
    const out = def.feature('renderDetailsFeatures', { node: { id: 'service:registry:foo:1' } })
    expect(Array.isArray(out)).toBe(true)
    expect(out[0].__v_isVNode).toBe(true)
  })
})
