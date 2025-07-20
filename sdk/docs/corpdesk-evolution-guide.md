# 🧭 Corpdesk Evolution Strategy Guide

## ✅ High-Level Version Roadmap

| Version      | Focus Area                                             | Milestone Status            |
|--------------|--------------------------------------------------------|-----------------------------|
| `0.9.0`      | 'Draft' codes base as snapshot (baseline)              | ✅ Starting point           |
| `1.0.0-beta` | 'Dream1' Corpdesk                                      | 🎯 Target: Automation-ready | 
| `1.1.0`      | System-level improvements (SSL, CORS, bootstrap files) | 📅 Future                   |
| `1.2.0`      | Auto packaging, deployment, CD integration             | 🚧 Future planning          |

---

## ✅ GitHub Tools to Use

### 1. Tags for Version Control

Tags mark release points in your Git history.

```bash
git tag v0.9.0 -m "Baseline('Draft') legacy implementation before automation"
git push origin v0.9.0

git tag v1.0.0-beta -m "'Dream1': Refactored services and controllers - automation ready"
git tag v1.1.0 -m "Security + System setup upgrades"
```

> 💡 Use [SemVer](https://semver.org/) — you’re already on point with `MAJOR.MINOR.PATCH` + suffixes like `-beta`.

---

### 2. Releases Page (GitHub UI)

- Navigate to **"Releases" tab**
- Click **"Draft new release"**
- Choose a tag (e.g., `v1.0.0-beta`)
- Add release notes
- Optionally upload artifacts (ZIP, Dockerfile, etc.)

---

### 3. GitHub Projects (Kanban Boards)

- Create a project: `Corpdesk Evolution v1.x`
- Columns: `Backlog`, `In Progress`, `Testing`, `Done`
- Link to issues for tracking progress

---

### 4. Milestones

- Create a milestone `v1.0.0-beta`
- Link related issues (e.g., BaseService refactor, Controller standardization)

---

### 5. Branching Strategy

```text
main                 ← stable production
dev                  ← ongoing refactoring, testbed, automation prep
feature/service-refactor
feature/ssl-cors
release/v1.0.0-beta  ← finalize automation-ready release
```

---

### 6. Conventional Commits + CHANGELOG.md

```bash
git commit -m "feat(base-service): extract shared logic to utility"
git commit -m "refactor(controller): remove unused dependencies"
git commit -m "fix(service): correct pagination bug in list()"
```

Use tools like `standard-version` or `auto-changelog` to generate changelogs.

---

### 7. GitHub Actions (for v1.2.0+)

Use for:
- CI builds
- Testing
- Auto deployment
- Auto changelog generation

---

## 🛠 Suggested Immediate Steps

### ✅ Step 1: Tag current state

```bash
git checkout main
git tag v0.9.0 -m "Baseline before service/controller refactor"
git push origin v0.9.0
```

### ✅ Step 2: Create refactor branch

```bash
git checkout -b feature/service-controller-refactor
```

### ✅ Step 3: Create GitHub milestone `v1.0.0-beta`

- Add issues for BaseService, Controller refactor, etc.

### ✅ Step 4: Create CHANGELOG.md

```markdown
## [v1.0.0-beta] - 2025-07-09
### Added
- CRUD scaffold templates
- Auto testbed repository sync

### Changed
- Modular BaseService inheritance
- Directory structure for testbed entities

### Removed
- Redundant decorators
```

---

## 🔮 Future CLI Idea

`cd-cli` can support:

```bash
cd-cli version
cd-cli changelog
```

Backed by a `version.json` like:

```json
{
  "version": "1.0.0-beta",
  "released": "2025-07-09"
}
```

---

## 🧠 Summary

This GitHub-based roadmap will:
- Ensure trackable progress
- Help organize collaborative upgrades
- Enable smooth future packaging and CD
- Clearly show maturity milestones

---

**Date: 2025-07-09**  
**Time: 10:42 (EAT)**  
