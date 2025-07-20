#!/bin/bash

# Define the root versioning directory
VERSIONING_DIR=".cd-versioning"

# Create the directory structure
mkdir -p "${VERSIONING_DIR}/docs"

# Sample roadmap.json
cat > "${VERSIONING_DIR}/roadmap.json" <<EOF
[
  {
    "id": "roadmap-001",
    "title": "Initialize versioning support",
    "description": "Set up structure for changelog, roadmap, and contributors.",
    "status": "done",
    "modifiedAt": "$(date --iso-8601=seconds)"
  }
]
EOF

# Sample changelog.json
cat > "${VERSIONING_DIR}/changelog.json" <<EOF
[
  {
    "id": "changelog-001",
    "roadmapId": "roadmap-001",
    "message": "Scaffolded versioning directory and initialized tracking.",
    "commitHash": "abc1234",
    "author": "system",
    "date": "$(date --iso-8601=seconds)"
  }
]
EOF

# Sample contributors.json
cat > "${VERSIONING_DIR}/contributors.json" <<EOF
[
  {
    "name": "George Oremo",
    "email": "george.oremo@gmail.com",
    "role": "Owner",
    "profileLink": "https://github.com/georemo"
  }
]
EOF

# Sample DEVELOPMENT.md
cat > "${VERSIONING_DIR}/docs/DEVELOPMENT.md" <<EOF
# Development Strategy for Corpdesk Versioning

This document outlines the approach to automated versioning using \`cd-cli\`.

## Key Directories

- \`roadmap.json\`: Lists planned features and tasks.
- \`changelog.json\`: Auto-generated from Git commit logs, tagged against roadmap items.
- \`contributors.json\`: Lists developers involved in the project.
- \`docs/DEVELOPMENT.md\`: This documentation.

## Versioning Policy

- Versioning is tag-based and managed by \`cd-cli\`.
- Roadmap items are mapped to changelog entries.
- Contributors are derived from Git history.
EOF

# Completion message
echo "✅ .cd-versioning structure created with sample content."
