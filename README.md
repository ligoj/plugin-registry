# :package: Ligoj Registry plugin ![Maven Central](https://img.shields.io/maven-central/v/org.ligoj.plugin/plugin-registry)

[![License](http://img.shields.io/:license-mit-blue.svg)](http://fabdouglas.mit-license.org/)

[Ligoj](https://github.com/ligoj/ligoj) artifact-registry service plugin.

Service-level parent (node `service:registry`) of the registry tool plugins.
Like [plugin-scm](https://github.com/ligoj/plugin-scm) it owns no view of its
own; it ships generic i18n and delegates the subscription-row hooks
(`renderFeatures`, `renderDetailsKey`, `renderDetailsFeatures`) to the
`registry-<tool>` sub-plugin resolved from the node id.

## Tool plugins

| Plugin                  | Node                      | Notes                                                       |
| ----------------------- | ------------------------- | ----------------------------------------------------------- |
| plugin-registry-harbor  | `service:registry:harbor` | CNCF Harbor — artifact type fixed to `docker`.              |
| plugin-registry-nexus   | `service:registry:nexus`  | Sonatype Nexus — `docker` / `maven` / `nuget` / `npm` / `python`. |

## Parameter model

Every registry tool declares the same shape of parameters. Two are used to
**validate the node** (the registry server connection), two are collected
**at subscription time** (which registry/format a project consumes):

| Parameter   | Type             | Scope (CSV gate)                             | Purpose                                |
| ----------- | ---------------- | -------------------------------------------- | -------------------------------------- |
| `url`       | `TEXT`           | node only (`availableForSubscription=FALSE`) | Base URL of the registry server.       |
| `user`      | `TEXT`           | node only (`availableForSubscription=FALSE`) | Credentials — login.                   |
| `password`  | `TEXT` (secured) | node only (`availableForSubscription=FALSE`) | Credentials — secret.                  |
| `type`      | `SELECT`         | subscription only (`availableForNode=FALSE`) | Artifact type (`docker`, `maven`, …).  |
| `registry`  | `TEXT`           | subscription only (`availableForNode=FALSE`) | Target registry / repository name.     |

`url` + credentials are required for node validation; `registry` + `type` are
required only when subscribing a project. See each tool's
`src/main/resources/csv/parameter.csv`.

## Backend (Java) module

`RegistryResource` (`service:registry`) is the service-level plug-in; tools
implement `RegistryServicePlugin`. Build & test with Maven:

```bash
mvn -Pjacoco verify     # runs JUnit + JaCoCo (100% coverage)
mvn install             # install for the tool plugins to resolve
```

## UI (Vue) module

The Vue source lives in `ui/` and is built into the plugin JAR under
`META-INF/resources/webjars/registry/vue/`.

```bash
cd ui
npm install
npm run build
npm run lint
npm test
npm run test:coverage   # enforces 100% coverage
```
