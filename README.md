# Welcome to React Router!

A modern, production-ready template for building full-stack React applications using React Router.

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/remix-run/react-router-templates/tree/main/default)

## Features

- 🚀 Server-side rendering
- ⚡️ Hot Module Replacement (HMR)
- 📦 Asset bundling and optimization
- 🔄 Data loading and mutations
- 🔒 TypeScript by default
- 🎉 TailwindCSS for styling
- 📖 [React Router docs](https://reactrouter.com/)

## Getting Started

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Deployment

### Docker Deployment

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

## Carrier Data Import

Use the importer script to parse an Excel file and populate a SQLite database with carrier offerings by state.

### Expected Excel workbook format

The workbook must have at least 2 sheets with the same headers:

- `Carrier`
- `Illinois` (or `IL`)
- `Indiana` (or `IN`)
- `Michigan` (or `MI`)

Sheet 1 values under state columns:

- `auto`
- `fire`
- `both`
- blank/none for no coverage

Sheet 2 values under state columns (flood coverage):

- `yes` / `no` (also supports `y/n`, `true/false`, `1/0`)

### Run import

```bash
npm run import:carriers -- ./path/to/carriers.xlsx
```

Optional custom database path:

```bash
npm run import:carriers -- ./path/to/carriers.xlsx ./data/insurance.db
```

The script creates a `carrier_offerings` table and upserts rows by the unique pair of `carrier_name` + `state`, combining auto/fire from sheet 1 with flood from sheet 2.

---

Built with ❤️ using React Router.
