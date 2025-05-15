# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Code Navigator Frontend

This is the React frontend for the Code Navigator app, styled with TailwindCSS.

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:5173/](http://localhost:5173/) by default.

## Project Structure

```
frontend/
├── public/
└── src/
    ├── components/ (empty)
    ├── pages/
    │   └── Home.jsx (landing page component)
    ├── App.jsx
    ├── index.jsx
    ├── index.css (Tailwind imports configured here)
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Styling

TailwindCSS is used for all styling. You can add utility classes directly to your React components.

## Backend Integration

The landing page fetches repository metadata from the FastAPI backend at:

```
GET http://localhost:8000/repo/{owner}/{repo}/metadata
```

- The data is displayed on the landing page with loading and error states handled gracefully.
- You can change the owner/repo in `src/pages/Home.jsx` as needed.

## Sidebar File Navigation

- The sidebar now features a modern, minimalist design with clear icons for files and directories.
- Expand/collapse for directories is smooth and animated, with clear chevron indicators.
- Visual separation is improved with padding, hover effects, and a highlighted selected state.
- The color scheme matches the app's branding and is easy on the eyes.
- The sidebar remains scrollable for large file structures.
- Loading and error states are clearly indicated with friendly messages and spinners.

## File Content Viewing & Syntax Highlighting

- Click a file in the sidebar to view its content in the main area.
- File content is fetched from the backend and displayed with syntax highlighting using react-syntax-highlighter.
- Loading and error states are handled gracefully.

## AI File Summaries (On-Demand)

- When viewing a file, click the "Generate AI Summary" button to fetch and display an AI-generated summary for that specific file.
- The summary appears above the code viewer within the same panel.
- Loading and error states are clearly indicated during the summary generation process.
- This feature helps users quickly understand the purpose of individual files without leaving the context of the code.

## "Show Repo Overview" Button

- After navigating away from the initial automatic "Repo Vibe" display (e.g., by selecting a file), users can click the "📖 Show Repo Overview" button.
- This action re-fetches and displays the main VIBE.md (the overall repository summary) in the main content area.
- This replaces the previous modal functionality for viewing the Repo Vibe.

## YAML Context Export

- Click the "Export YAML Context" button to download a structured YAML summary of the repository for AI use.
- The file is downloaded as `{repo_name}-context.yaml`.
- Loading and error states are clearly indicated in the UI.

## Repo Vibe (Full Repo Markdown Summary)

- Click the "📖 View Repo Vibe" button to open a modal displaying a comprehensive, AI-generated Markdown summary of the repository.
- The summary is fetched from the backend `/repo/{owner}/{repo}/vibe` endpoint and rendered using react-markdown.
- Loading and error states are clearly indicated in the modal.
- The modal is scrollable and can be closed at any time.
- The summary is designed for non-technical users, providing a high-level overview, file structure, and the general "vibe" of the repo.

## Dynamic Repository Selection

- Use the header input to enter any public GitHub repository in the format `owner/repo`.
- Click the "Load" button to fetch and view the selected repository.
- Loading and error states are clearly indicated in the header.

## Automatic Repo Vibe Loading

- Upon successfully loading a repository via the header input, the application now automatically fetches and displays the "Repo Vibe" (a comprehensive Markdown summary) in the main content area.
- This provides users with an immediate, non-technical overview of the repository.
- A loading indicator is shown while the Vibe summary is being generated.
- If fetching or rendering the Vibe summary fails, a clear error message is displayed.
- If a user clicks a file in the sidebar, the Code Viewer will replace the Vibe summary for that file.
- The "View Repo Vibe (Modal)" button remains available to view the summary in a focused modal at any time.
