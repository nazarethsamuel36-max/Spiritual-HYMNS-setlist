# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    # Worship Song Library

    A React and TypeScript worship song library built with Vite. The app supports multilingual song search, chord transposition, offline storage, personal song versions, setlists, sharing, and Supabase synchronization.

    ## Requirements

    - Node.js 20 or newer
    - npm
    - A Supabase project configured with the application's database schema

    ## Setup

    Install dependencies:

    ```bash
    npm install
    ```

    Create a `.env` file in the project root:

    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

    Never commit `.env` or service-role keys. The application uses the Supabase anonymous key in the browser and relies on Supabase Row Level Security for access control.

    ## Development

    Start the Vite development server:

    ```bash
    npm run dev
    ```

    The local development URL is printed in the terminal, usually `http://localhost:5173`.

    ## Build and preview

    Create a production build:

    ```bash
    npm run build
    ```

    Preview the production build locally:

    ```bash
    npm run preview
    ```

    Run lint checks with:

    ```bash
    npm run lint
    ```

    ## Project structure

    ```text
    src/
      components/   User interface components
      db/           IndexedDB persistence through Dexie
      hooks/        React hooks
      search/       Multilingual search and transliteration
      services/     Supabase sync and application services
      store/        Zustand state management
      utils/        Chord, lyric, key, and search utilities
    public/         Static assets and PWA files
    supabase/       Supabase project configuration and migrations
    ```

    ## Data and security

    Song data is synchronized with Supabase and cached locally in IndexedDB for offline use. Authentication and authorization are enforced by the application and Supabase policies. Database migrations and administrative data tools should be run deliberately against the intended Supabase project.
