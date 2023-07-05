

# Changelog

## Table of content:
- [Important](#important)
- [Usage](#usage)
- [Monorepo](#monorepo-support)
- [Configuration](#configuration)

### Important

`changelog` use GitHub api. You need provide GitHub Personal Access Token in `.changelogc`. You'll need a [personal access token](https://github.com/settings/tokens) for the GitHub API with the `repo` scope for private repositories or just `public_repo` scope for public repositories.

### Usage
```bash
npx changelog
```
------------------------------------------------------------------------------  
```md  
## Changelog.
#### It was automatically generated by [0x303133/changelog](https://github.com/0x303133/changelog).

## v1.0.0

#### :rocket: Enhancement
  * [#5](https://github.com/0x303133/changelog/pull/5) feat: Create CLI ([@0x303133](https://github.com/0x303133))

#### Other
  * [#3](https://github.com/0x303133/changelog/pull/3) chore(deps-dev): Bump @typescript-eslint/parser from 5.60.1 to 5.61.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#4](https://github.com/0x303133/changelog/pull/4) chore(deps-dev): Bump @typescript-eslint/eslint-plugin from 5.60.1 to 5.61.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
  * [#1](https://github.com/0x303133/changelog/pull/1) chore: Create base configuration for repo ([@0x303133](https://github.com/0x303133))

#### Committers: 1
- [@0x303133](https://github.com/0x303133)
#### Full changelog: [`v0.0.0...v1.0.0`](https://github.com/0x303133/changelog/compare/v0.0.0...v1.0.0)
```  
------------------------------------------------------------------------------

By default  `0x303133/changelog`  will show all pull requests that have been merged since the latest tagged commit in the repository. That is however only true for pull requests with certain labels applied. The labels that are supported by default are:

-   `breaking`  (💥 Breaking Change)
-   `enhancement`  (🚀  Enhancement)
-   `bug`  (🐛  Bug Fix)
-   `documentation`  (📝 Documentation)
-   `internal`  (🏠 Internal)

You can also use the  `--from`  and  `--to`  options to view a different range of pull requests:

```bash 
npx changelog --from=v1.0.0 --to=v2.0.0
```

### Monorepo support

If you have a packages folder and your projects in subfolders of that folder  `changelog`  will detect it and include the package names in the changelog for the relevant changes.

### Configuration

You can use the cli settings to simplify your life and avoid mistakes.
| title               | description                                                          |
|---------------------|----------------------------------------------------------------------|
| from                | A git tag that determines the lower bound of the range of commits    |
| to                  | A git tag that determines the upper bound of the range of commits    |
| next-version        | The name of the next version                                         |
| contributors-marker | Contributors marker that will be used in render. Default: -          |
| commits-marker      | Commits marker that will be used in render. Default: *               |
| filename            | Output filename, without extension                                   |

### License

`changelog`  is released under the  [MIT License](https://github.com/0x303133/changelog/blob/main/LICENSE).