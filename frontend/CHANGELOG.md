# Changelog

## [Unreleased]
- Initialized React project using Vite.
- Integrated TailwindCSS for styling.
- Set up project structure with components and pages directories.
- Added Home.jsx landing page with placeholder title and subtitle.
- Integrated frontend with backend FastAPI endpoint to fetch and display repository metadata on the landing page, with loading and error handling.
- Added Sidebar component to display repository file structure as an expandable/collapsible tree, with file click logging.
- Added CodeViewer component to fetch and display file content with syntax highlighting when a file is selected from the sidebar.
- Implemented jump-to-definition UI: highlights function/class names in Python files, enables smooth scrolling to definitions on click, and handles errors gracefully.
- Implemented find-references UI: clicking a highlighted name fetches and displays references in a modal, with loading and empty states handled gracefully.
- Implemented repo structure visualization: interactive tree view using react-d3-tree, accessible from the landing page, with clear distinction between files and directories.
- Integrated AI file summaries: fetches and displays GPT-4-generated summaries above the code viewer, with loading and error handling.
- Added 'Export YAML Context' button to UI: fetches and downloads YAML context from backend, with loading and error handling.
- Redesigned header with branding, dynamic repo input, and load button. Users can now load any public GitHub repository, with clear loading and error handling.
- Added /repo/{owner}/{repo}/vibe endpoint: generates a friendly, detailed Markdown summary (VIBE.md) of the repository using GPT-4, designed for non-technical users ("vibecoders").
- Integrated Repo Vibe feature in frontend: 'View Repo Vibe' button, modal UI, markdown rendering with react-markdown, loading and error handling, and documentation. 