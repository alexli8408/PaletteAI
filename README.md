# PaletteAI

AI-powered color palette generator. Enter a keyword, upload an image, or create manually to create a palette.

**Live:** [paletteai.app](https://paletteai.app)

---

## Features

- **Keyword Generation** — Type any keyword, mood, or character name and get a curated 5-color palette powered by Azure OpenAI (GPT-4o)
- **Image Extraction** — Upload an image and let Azure AI Vision extract the dominant colors into a palette
- **Manual Creation** — Pick and tweak individual colors with a built-in color picker, or start from a randomly generated palette
- **Save & Manage** — Sign in with Google to save, search, and delete your palettes
- **Export** — Copy or download palettes as CSS variables, JSON, or SVG
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

| Layer     | Technology                    |
| --------- | ----------------------------- |
| Framework | Next.js 16 (App Router)       |
| Language  | TypeScript                    |
| Styling   | CSS Modules + custom tokens   |
| AI        | Azure OpenAI (GPT-4o)         |
| Vision    | Azure AI Vision               |
| Database  | MongoDB Atlas + Mongoose      |
| Auth      | NextAuth.js v5 (Google OAuth) |
| Hosting   | Vercel                        |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (local or Atlas)
- Azure OpenAI resource with a GPT-4o deployment
- Google OAuth credentials

### Environment Variables

Copy `.env.example` to `.env.local`:

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

### Run

```bash
npm install
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
  page.tsx                  Home — palette generation UI
  saved/page.tsx            Saved palette gallery
  palette/[id]/page.tsx     Palette detail view
  api/
    palettes/               CRUD, generate, and extract endpoints
    auth/                   NextAuth route

components/
  Navbar.tsx                Top bar with auth controls
  ColorSwatch.tsx           Color tile with hex/RGB/HSL and copy
  ExportModal.tsx           Export dialog (CSS, JSON, SVG)
  ImageDropzone.tsx         Drag-and-drop image upload
  PaletteCard.tsx           Palette preview card
  AuthProvider.tsx          NextAuth session wrapper

lib/
  palette-utils.ts          Color conversion, naming, harmony, and export
  mongodb.ts                Mongoose connection
  auth.ts                   NextAuth config

models/
  Palette.ts                Mongoose schema

types/
  index.ts                  Shared TypeScript interfaces
```

---

## License

This project is for educational purposes.
