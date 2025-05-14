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
