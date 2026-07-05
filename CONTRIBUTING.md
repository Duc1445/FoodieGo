# Contributing to FoodieGo

First off, thank you for considering contributing to FoodieGo! 

## Branching Strategy

We use a feature-branch workflow. 
- `main`: Contains production-ready, stable releases.
- `develop`: The active development branch. All feature branches must branch off and merge back into `develop`.
- `feature/*`: For new capabilities. (e.g. `feature/platform-foundation`)
- `fix/*`: For bug fixes.

## Commit Guidelines

We use [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).
Format:
`<type>[optional scope]: <description>`

Examples:
- `feat(platform): add messaging foundation`
- `fix(order): resolve checkout race condition`
- `docs(adr): document ADR-005`

## Development Workflow

1. Fork the repo and create your branch from `develop`.
2. Run `npm install` (or `pnpm install`) at the root to setup monorepo workspaces.
3. Start the infrastructure via `docker-compose up -d`.
4. Ensure your code passes all linting (`npm run lint`) and tests before creating a PR.
5. Create a Pull Request against `develop`.

Thank you!
