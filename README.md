# github-actions-workflows

Reusable GitHub Actions workflows shared across repositories.

## Available Workflows

- `.github/workflows/shift-left.yml`
	- Trigger: `workflow_call`
	- Purpose: shared security and CI checks (audit, CodeQL, lint, tests, build, optional IaC checks)

- `.github/workflows/shift-left-ci.yml`
	- Trigger: `push`, `pull_request`, `workflow_dispatch`
	- Purpose: runs the reusable Shift Left workflow in this repository and tags `main` on success

## Usage

From a caller repository, create a trigger workflow and call the reusable workflow:

```yaml
name: Shift Left

on:
	push:
		branches:
			- "**"
	workflow_dispatch:

jobs:
	checks:
		uses: almmechanics/github-actions-workflows/.github/workflows/shift-left.yml@main
		with:
			node-version: "22.16"
			npm-version: "10.9"
			enable-codeql: false
			# Optional IaC folder; omit or leave empty to skip Terraform/TFLint/Checkov
			iac: ""
		secrets: inherit
```

## Inputs

- `node-version` (default: `22.16`)
- `npm-version` (default: `10.9`)
- `python-version` (default: `3.10`)
- `enable-codeql` (default: `false`)
- `terraform-version` (default: `1.9.8`)
- `iac` (default: `""`)

Set `enable-codeql: true` only in repositories where GitHub Code Scanning is enabled.

## Semantic Version And Tagging

- Semantic version is stored in `package.json` (`version` field).
- On successful `main` runs of `.github/workflows/shift-left-ci.yml`, the `tag` job runs `npm run version:tag`.
- Tag format is `v<package.json version>`, for example `v0.1.0`.
- If a tag already exists on another commit, the job fails and you must bump `package.json` version first.
