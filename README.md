# plate-harness

A production-ready harness (boilerplate + agent harness) for building React applications with TypeScript, Vite, Material-UI, and Supabase. It enforces strict architectural rules and includes authentication as an example feature.

## Features

- ⚡️ **Vite** - Fast build tool and dev server
- ⚛️ **React 19** - Latest React with TypeScript
- 🎨 **Material-UI (MUI)** - Comprehensive UI component library
- 🗄️ **Supabase** - Backend-as-a-Service for authentication and database (optional)
- 🧭 **React Router** - Client-side routing
- 📏 **ESLint + GTS + Prettier** - Code quality and style enforcement (see [ARCHITECTURE.md](./ARCHITECTURE.md#code-quality-tools))
- 🧪 **Vitest** - Fast unit testing framework
- 🏗️ **Strict Architecture** - Enforced folder structure and import rules
- 🔒 **Authentication** - Complete auth flow (login, signup, logout) - requires Supabase
- 📊 **Airtable Integration** - Connect to Airtable as a data source (optional)

## Tech stack (pinned in `package.json`)

| Area | Version |
|------|---------|
| Runtime / UI | React 19, MUI 9, React Router 7 |
| Build | Vite 8, TypeScript 6 |
| Data | TanStack Query 5, Supabase JS 2 |
| Quality | ESLint 10, Vitest 4, Prettier 3, dependency-cruiser 17 |
| Agent onboarding | Root `AGENTS.md` (see [ARCHITECTURE.md](./ARCHITECTURE.md)) |

## Prerequisites

### Required

- **Node.js** 20.x or higher - [Download here](https://nodejs.org/)
- **pnpm** 9.15.4 or higher (recommended) or npm/yarn
  - Install globally: `npm install -g pnpm`
- **Git** - Required for cloning the repository and git hooks
  - [Download here](https://git-scm.com/downloads)

### Optional

- **Supabase Account** (optional) - [Sign up here](https://supabase.com) if you want to use authentication and database features
- **Graphviz** (optional) - Required only for generating architecture graph visualizations
  - Install: `choco install graphviz` (Windows with Chocolatey) or [download installer](https://graphviz.org/download/)
  - Only needed if you want to run `pnpm arch:graph` to visualize the architecture
- **Airtable Account** (optional) - [Sign up here](https://airtable.com) if you want to use Airtable as a data source

### Configure Line Endings

**IMPORTANT:** Before starting, configure VS Code/Cursor to use Linux line endings (`\n`). This ensures consistent line endings across all files and prevents linting errors.

#### Editor Configuration (VS Code / Cursor)

**Note:** Cursor uses VS Code settings. Configure the line ending setting in VS Code/Cursor settings:

1. Press `Ctrl + ,` to open Settings
2. Search for `files.eol` or `line ending`
3. Change the setting from `auto` to `\n` (Linux)
   - The setting is: **"Files: Eol"** → Select `\n` from the dropdown

See [this guide](https://stackoverflow.com/questions/71240918/how-to-set-default-line-endings-in-visual-studio-code) for more details.

#### Git Configuration

Configure Git to preserve LF line endings (the repository already includes `.gitattributes` to enforce this):

```bash
git config core.autocrlf false
```

This prevents Git from converting LF to CRLF on Windows systems.

**Why this matters:** The repository uses LF line endings. Without proper configuration, Git on Windows may convert them to CRLF, causing thousands of Prettier/ESLint errors.

### Linter Setup

This project uses **ESLint** and **Prettier** for code quality and formatting. The linters are already configured and will run automatically.

#### Verify Linter Installation

After running `pnpm install`, verify that the linters work correctly:

```bash
# Check for linting issues
pnpm lint

# Check if code formatting is correct
pnpm format:check
```

#### Common Linter Commands

- `pnpm lint` - Check for code quality issues (ESLint)
- `pnpm lint:fix` - Auto-fix ESLint errors
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check if code is formatted correctly

#### Editor Integration

**Recommended:** Configure VS Code/Cursor to:
- Format on save using Prettier
- Show ESLint errors in real-time
- Install the ESLint and Prettier extensions

**If you see many linting errors after cloning:**
- This is usually due to line ending issues (see [Configure Line Endings](#configure-line-endings) above)
- Run `pnpm format` to auto-fix formatting issues
- Run `pnpm lint:fix` to auto-fix linting issues

### Using Cursor Agent

When using Cursor's AI agent to make commits, you may encounter permission issues. This section explains how to configure Cursor to allow Git commits. To allow the agent to perform Git commits automatically, configure the **Command Allowlist** in Cursor settings.

#### Configure Command Allowlist

1. Open Cursor Settings (`Ctrl + ,`)
2. Search for "Command Allowlist" or "allowlist"
3. Add the following commands to the allowlist:
   - `powershell`
   - `Set-Location`
   - `git diff`
   - `git commit`
   - `cd`
   - `git add`

**Why this is needed:** By default, Cursor's agent runs in a sandboxed environment. Adding these commands to the allowlist allows Git operations to run outside the sandbox, preventing permission errors (like `env.exe: couldn't create signal pipe, Win32 error 5`) when committing.

**Note:** After adding these commands to the allowlist, the Cursor agent can perform Git commits without requiring elevated permissions (`all`), making the workflow smoother.

## Quick Start Guide

This guide uses **Option B (fork + clone)** so your project starts in your own GitHub repo.

### Step 1: Fork this harness

1. Open this repository on GitHub.
2. Click **Fork**.
3. Create the fork under your account or organization.

### Step 2: Clone your fork and install dependencies

```bash
git clone https://github.com/<your-org-or-username>/<your-repo-name>.git
cd <your-repo-name>
pnpm install
```

**Note:** You may see TypeScript type errors in tooling output during setup. Vite still runs the app in development mode.

### Step 3: Set up branch workflow for this repo

Keep `main` as production and `develop` as long-lived staging/integration. Mode lives in `src/config/git-workflow.json` (SSOT behavior: `.cursor/rules/git-workflow/RULE.mdc`).

```bash
git switch -c develop
git push -u origin develop
```

**Choose a mode (fork onboarding):**

| Mode | Daily work | `develop` ruleset | Config |
|------|------------|-------------------|--------|
| **Model A** (default — feature branches + PR) | `feature/*` → squash PR → `develop` | PR + `test` + non-ff + deletion | `"mode": "model-a"` |
| **Model B** (opt-in — direct `develop`) | Commit/push on `develop` | `test` + non-ff + deletion (**no** PR required) | `"mode": "model-b"` |

Both modes: production via **Promote to production** (ff `main` ← `develop`). Never commit app code to `main`.

**Model A** first branch:

```bash
git switch develop && git pull origin develop
git switch -c feature/<name>
```

**Model B:** stay on `develop` after creating it; do not create `feature/*` for daily work.

Optional (to pull future plate-harness updates):

```bash
git remote add upstream https://github.com/TMI-apps/plate-harness.git
git fetch upstream
```

### Step 4: Start the development server

```bash
pnpm dev
```

The app runs at `http://localhost:5173/` (or another port if 5173 is busy).

In local dev, use the floating **Tasks** button (bottom-right) to open `/tasks` — your onboarding checklist lives there.

### Step 5: Complete onboarding tasks

Work through the dev task backlog at `/tasks` (or edit `src/config/app-tasks.json` directly). All sections are optional except what your app needs; configure what you want now and skip or archive the rest.

#### Supabase (optional, needed for auth/database) 🔐

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **Project Settings -> API**.
3. Copy your **Project URL** and **Publishable Key**.
4. Create `.env` in project root:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

5. Restart dev server after `.env` changes (`Ctrl+C`, then `pnpm dev`).

6. **Sign in with Google (optional):** Enabling the provider in Supabase is not enough until Google Cloud allows Supabase’s callback URL. Follow the single checklist: [documentation/DOC_SUPABASE_GOOGLE_OAUTH.md](./documentation/DOC_SUPABASE_GOOGLE_OAUTH.md) (SSOT for dashboard steps).

Legacy note: `VITE_SUPABASE_ANON_KEY` is still accepted for backward compatibility.

#### Airtable (optional) 📊

Add `VITE_AIRTABLE_API_KEY`, `VITE_AIRTABLE_BASE_ID`, and `VITE_AIRTABLE_TABLE_ID` to `.env`. See `.agents/skills/api-integrate/SKILL.md` (Airtable worked example) for schema inspection.

#### Theme customization (optional) 🎨

Customize `src/shared/theme/` or use [MUI Theme Creator](https://bareynol.github.io/mui-theme-creator/) as a starting point.

#### App vision

Collaborate with your coding agent to fill [documentation/DOC_APP_VISION.md](./documentation/DOC_APP_VISION.md) and set status to **ACTIVE**.

### Step 6: Verify app routes

- Home: `http://localhost:5173/`
- Tasks (dev only, via FAB): `http://localhost:5173/tasks`
- Login (when Supabase configured): use ProfileMenu in the topbar

### Testing on a physical phone (optional)

Chrome DevTools device mode is enough for width breakpoints; it is **not** enough for mobile OAuth, viewport height, or keyboard issues. To test **local dev on a real device** (Android `adb reverse` + localhost, iOS tunnel/preview), follow [documentation/DOC_MOBILE_LOCAL_DEV.md](./documentation/DOC_MOBILE_LOCAL_DEV.md).

### You're ready

Start building per your git-workflow mode (`src/config/git-workflow.json`): Model A uses `feature/*` → `develop`; Model B works on `develop`. Promote to `main` when staging looks good.

## Installation

For detailed installation instructions, see the [Quick Start Guide](#quick-start-guide) above.

### Optional: Manual Supabase Setup

If you prefer to set up Supabase manually (same as task #1 in the dev backlog):

1. Create a `.env` file in the project root directory

2. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```
**Note:** The legacy `VITE_SUPABASE_ANON_KEY` also works for backward compatibility.

3. Restart the development server for environment variables to take effect

### Features

- ✅ **Authentication**: Supabase authentication (when configured)
- ✅ **Airtable Integration**: Connect to Airtable as a data source (when configured)
- ✅ **Theme Customization**: Customize the MUI theme
- ✅ **Frontend Development**: All UI components and features work independently

### Configuring Supabase Later

If you skipped Supabase setup initially, you can configure it anytime:

1. Open `/tasks` in local dev (floating button) or edit `.env` directly
2. Add Supabase credentials to `.env` (see [Manual Supabase Setup](#optional-manual-supabase-setup))
3. **Restart your development server** (`Ctrl+C` then `pnpm dev`)


### Troubleshooting

**Dev task backlog not visible?**
- `/tasks` is dev-only — use the floating button when running `pnpm dev`
- Production builds show an info message instead of the task list

**Supabase connection failing?**
- Verify your credentials are correct (check for typos)
- Ensure your `.env` file is in the project root (not in `src/`)
- Make sure you've restarted the dev server after creating `.env`
- Check that your Supabase project is active and not paused

**Environment variables not working?**
- Vite requires environment variables to start with `VITE_`
- Restart the dev server after changing `.env` file
- Don't commit `.env` to git (it should be in `.gitignore`)

**TypeScript errors during installation or when running `pnpm dev`?**
- TypeScript compilation errors are normal and won't prevent the app from running
- Vite handles TypeScript transpilation on the fly for the dev server
- These errors are typically related to type definitions in node_modules and can be ignored during development

## Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview:worker` - Preview production build in Workers runtime (`pnpm build && wrangler dev`)
- `pnpm deploy` - Deploy to Cloudflare Workers (`wrangler deploy`)
- `pnpm lint` - Run ESLint (code quality checks)
- `pnpm lint:fix` - Auto-fix ESLint errors
- `pnpm format` - Format all code with Prettier
- `pnpm format:check` - Check if code is formatted correctly
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

### Code Quality Tools

This project uses **GTS**, **ESLint**, and **Prettier** together for code quality and formatting:

- **GTS** (Google TypeScript Style) - Provides pre-configured ESLint rules
- **ESLint** - Catches bugs and enforces code quality (with custom architecture rules)
- **Prettier** - Formats code automatically for consistency

**Quick Start:**
- Format code: `pnpm format`
- Check for issues: `pnpm lint`
- Auto-fix issues: `pnpm lint:fix`

**Editor Setup:**
- Configure your editor to format on save using Prettier
- ESLint will provide real-time feedback in your IDE
- See [ARCHITECTURE.md](./ARCHITECTURE.md#code-quality-tools) for detailed documentation

## Deployment (Cloudflare Workers Builds)

This starter targets **Cloudflare Workers** with static assets, deployed via **Workers Builds** (push-to-deploy). GitHub is the **CI/quality gate only** — it never deploys, and no `CLOUDFLARE_API_TOKEN` secret is needed.

- **GitHub:** runs `ci.yml` and enforces PR + green `test` check on `main`/`develop`.
- **Cloudflare Workers Builds:** builds and deploys on push (`develop` → preview, `main` → production).

To connect a fork:

1. Rename `name` in [`wrangler.jsonc`](./wrangler.jsonc).
2. In the Cloudflare dashboard, connect the repo (Build `pnpm install && pnpm run build`, Deploy `npx wrangler deploy`, Root directory **empty**).
3. Add build variables: `NODE_VERSION=20`, `CLOUDFLARE_ACCOUNT_ID`, and your `VITE_*` keys.
4. Add the deployed origin to Supabase Auth URLs.

The template is **fork-safe**: no account id or custom domain is committed. Full checklist, Pages migration mapping, OAuth URLs, and troubleshooting: **[documentation/DOC_CLOUDFLARE_WORKERS.md](./documentation/DOC_CLOUDFLARE_WORKERS.md)**.

## Architecture

This project follows a strict feature-based architecture. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about:

- Folder structure
- Code placement rules
- Dependency hierarchy
- Import patterns
- Code quality tools (GTS, ESLint, Prettier)

## Development Workflow

1. **Create a feature**: Add files in `src/features/[feature-name]/`
2. **Use common components**: Import from `@/components/common/...`
3. **Access shared code**: Import from `@/shared/...` or `@/features/...`
4. **Follow the layer rules**: Components → Hooks → Services
5. **Write tests**: Add tests alongside your code

## Project Structure

```
src/
├── assets/          # Static assets and global styles
├── components/      # App-level shared UI (Topbar, ProfileMenu, etc.)
│   └── common/
├── config/          # App config (e.g. dev task JSON)
├── features/        # Feature modules (auth, tasks, etc.)
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   └── tasks/
├── layouts/         # Layout components
├── pages/           # Route-level page components (subfolder per page)
├── routes/          # Router config and guards
└── shared/          # Cross-feature utilities, services, theme, context
    ├── context/
    ├── hooks/
    ├── services/
    ├── theme/
    └── utils/
```

## Testing

See **[documentation/DOC_TESTING.md](./documentation/DOC_TESTING.md)** for runners, file placement, naming, shared utilities, and examples.

Tests use Vitest and React Testing Library. Example tests are included for:
- Service functions (unit tests)
- React components (component tests)

Run tests:
```bash
pnpm test
pnpm test:classify   # classifier + executor unit tests
pnpm test:run        # full Vitest suite (CI merge gate)
pnpm test:staged     # dry-run — preview pre-commit test mode + paths
pnpm test:staged:live # run the same tests as pre-commit without committing
```

## CI/CD

GitHub Actions workflow runs on every push/PR:
- Type checking
- Linting
- Format checking
- Tests
- Build verification

## Contributing

See [documentation/DOC_CONTRIBUTING.md](./documentation/DOC_CONTRIBUTING.md) for how to contribute safely. Key points:

1. **Workflow & versioning** – Use [`.agents/skills/finish/SKILL.md`](./.agents/skills/finish/SKILL.md) before committing
2. **Architecture** – Follow [`.cursor/rules/architecture/RULE.mdc`](./.cursor/rules/architecture/RULE.mdc)
3. **Documentation index** – [documentation/DOC_INDEX.md](./documentation/DOC_INDEX.md) for all docs
4. Ensure all checks pass (`pnpm lint`, `pnpm format:check`, `pnpm test:classify`, `pnpm test:run`, `pnpm validate:version-sync`)
5. Update CHANGELOG.md for significant changes

