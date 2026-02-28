# PaletteAI

AI-powered color palette generator. Describe a mood, enter a keyword, or upload an image to generate harmonized color palettes instantly.

**Live Demo:** [paletteai.app](https://paletteai.app)

---

## Features

- **Keyword Generation** -- Enter any keyword, mood, or character name and get a curated 5-color palette powered by GPT-4o
- **Image Extraction** -- Upload an image and let vision AI extract the dominant colors into a cohesive palette
- **Save and Manage** -- Authenticate with Google to save, browse, and delete your palette collection
- **Export** -- Download or copy palettes as CSS variables, JSON, or SVG
- **Responsive** -- Fully responsive layout across desktop and mobile

---

## Tech Stack

| Layer         | Technology                          |
| ------------- | ----------------------------------- |
| Framework     | Next.js 16 (App Router)             |
| Language      | TypeScript                          |
| Styling       | CSS Modules                         |
| AI            | Azure OpenAI (GPT-4o)               |
| Database      | MongoDB with Mongoose               |
| Auth          | NextAuth.js v5 (Google OAuth)       |
| Hosting       | Vercel                              |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Azure OpenAI resource with a GPT-4o deployment
- Google OAuth credentials (Cloud Console)

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```env
MONGODB_URI=mongodb://localhost:27017/paletteai

AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com
AZURE_OPENAI_KEY=your_key
AZURE_OPENAI_DEPLOYMENT=your_deployment

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Install and Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
app/
  page.tsx                Home page with palette generation UI
  saved/page.tsx          Saved palettes gallery
  palette/[id]/page.tsx   Individual palette detail view
  api/
    palettes/             CRUD, generate, and extract endpoints
    auth/                 NextAuth catch-all route

components/
  AuthProvider.tsx        NextAuth session provider
  Navbar.tsx              Navigation bar with auth controls
  PaletteCard.tsx         Palette preview card
  ColorSwatch.tsx         Color swatch with hex/RGB/HSL display and copy
  ExportModal.tsx         Export dialog for CSS, JSON, and SVG
  ImageDropzone.tsx       Drag-and-drop image upload

lib/
  palette-utils.ts        Color conversion, naming, and export utilities
  mongodb.ts              Mongoose connection with caching
  auth.ts                 NextAuth configuration

models/
  Palette.ts              Mongoose schema and model

types/
  index.ts                Shared TypeScript interfaces
```

---

## License

This project is for educational purposes.
