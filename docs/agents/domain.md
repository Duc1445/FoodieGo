# Domain Docs

We use a **multi-context** layout for this monorepo.

- **CONTEXT-MAP.md**: A file at the repo root that points to the per-context `CONTEXT.md` files
- **CONTEXT.md**: A file in each sub-package defining the domain language and context for that specific area

### Rules for reading
- If you're working on a feature that spans multiple packages, read the `CONTEXT-MAP.md` first, then read the `CONTEXT.md` for the specific packages you're touching.
- Always adhere to the terminology and architecture constraints defined in these files.
