# Development Guidelines

## YouTube Highlighter Extension – Project Standards (AI Agent Use Only)

---

### 1. Project Overview
- This project is a Chrome extension that highlights trending YouTube videos on the homepage using a calculated hot score.
- **Do not explain project functionality in this document.**

---

### 2. Directory and File Standards
- `/docs/`: Store all product requirements and design documents. Update when requirements change.
- `/public/manifest.json`: Always update when adding/removing permissions, content scripts, or options pages. Must match features in `/src/content.ts`.
- `/public/style.css`: Store global extension styles. Add highlight styles here if not injected dynamically.
- `/src/content.ts`: Main content script. Implement DOM parsing, hot score calculation, and highlight logic here.
- `/src/utils/`: Place all utility functions (e.g., parsing view counts, time, score calculation). Name files by function (e.g., `parseViews.ts`).
- `/src/vite-env.d.ts`: Only update when TypeScript environment types change.
- `/index.html`, `/vite.config.ts`, `/tsconfig.json`: Only update for build or config changes. Do not modify for feature logic.

**Key Rule:**
- When adding a new feature that requires permissions or new scripts, update both `manifest.json` and the relevant source files.
- When updating parsing logic, update both `/src/content.ts` and relevant utils in `/src/utils/`.

---

### 3. Code Standards
- Use camelCase for variables and functions, PascalCase for types and components.
- Write concise, single-responsibility functions. Place parsing and calculation logic in `/src/utils/`.
- Add comments only for non-obvious logic. Do not comment general knowledge.
- Use TypeScript types for all function parameters and return values.

**Example:**
- Do: `function parseViewCount(text: string): number { ... }`
- Do not: `function parse_view_count(text) { ... }`

---

### 4. Implementation Standards
- Parse all video cards on YouTube home using DOM queries in `/src/content.ts`.
- Extract title, view count, upload time, URL, and thumbnail for each card.
- Use utility functions for parsing view count and upload time. Place in `/src/utils/`.
- Calculate hot score as: `hotScore = viewCount / (hoursSinceUpload + 1)`.
- Highlight cards with hot score >= threshold (default: 5000). Apply `3px solid red` border and `border-radius: 10px`.
- Add options page for user to set threshold. Store in `chrome.storage.sync`.
- Always update both content script and options logic when changing threshold logic.

**Key Rule:**
- When changing the hot score formula, update all related parsing, calculation, and UI display logic.

---

### 5. External Dependency Usage
- Use Vite for build and development. Do not add new build tools without updating `vite.config.ts`.
- Use Chrome Extension APIs (`chrome.storage.sync`, etc.) only in content or options scripts.
- Do not add unrelated third-party libraries.

---

### 6. Workflow Standards
- Test all changes on the actual YouTube homepage before committing.
- When adding new options, update both the options page and storage logic.
- Build with Vite before release. Do not commit broken builds.

---

### 7. Key File Interaction Standards
- When adding a new content script or permission, update both `manifest.json` and the relevant script in `/src/`.
- When changing parsing logic, update both `/src/content.ts` and `/src/utils/`.
- When updating user options, update both the options page and content script to reflect changes.

**Example:**
- Do: When adding a new highlight style, update both `/public/style.css` and `/src/content.ts` if styles are injected.
- Do not: Update only one file when multiple are required for feature consistency.

---

### 8. AI Decision-Making Standards
- When ambiguous, always update all related files for a feature (e.g., manifest, content script, utils, options).
- If unsure about a file's role, review its contents and the PRD before modifying.
- Prioritize updating documentation in `/docs/` when requirements or features change.
- **Never ask the user for clarification before attempting autonomous analysis.**

---

### 9. Prohibited Actions
- **Do NOT** add general-purpose code or unrelated features.
- **Do NOT** modify files outside the scope of the requested feature or fix.
- **Do NOT** add new dependencies without updating config and documenting the reason.
- **Do NOT** explain project functionality in this document.

**Examples:**
- Do: Add a new utility in `/src/utils/` for parsing a new YouTube field.
- Do not: Add a general-purpose math library.
- Do: Update both `manifest.json` and `/src/content.ts` when adding a new permission.
- Do not: Update only one and leave the other inconsistent.

---

**All rules must be followed by AI Agents. Violation of these rules is strictly prohibited.** 