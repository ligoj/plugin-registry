/*
 * Contract tests for the registry service-level parent plugin: manifest
 * shape, i18n merge, and parent->tool delegation via subPluginIdFor.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { pluginRegistry, useI18nStore } from '@ligoj/host'
import def, { service } from '../index.js'

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
