# Incentive PDF Tool

A web version of the Incentive PDF Tool: upload an Excel workbook, review the results,
then preview and download a PDF breakdown for every RM.

## Flow

1. **Upload** (`/`): drop or select an `.xlsx` with `RMs` and `Deals` sheets.
2. **Validation** (`/validate`): row counts plus any errors or warnings.
3. **Preview** (`/preview`): search and filter recipients, see each breakdown, download its PDF or
   HTML, or copy the plain text.
4. **Export** (`/export`): download every PDF as one ZIP, or the raw HTML files.

## PDF generation

PDFs are generated on the server with [QuestPDF](https://www.questpdf.com), which redraws
the template with the same wording and colours. The site calls `POST /api/pdf/single` (one
RM) and `POST /api/pdf/zip` (an array of RMs). Both take the same RM objects the frontend
already holds (RM fields plus the calculation results), so no calculation logic is
duplicated in C#. The renderer is in [backend/Pdf/Renderer.cs](backend/Pdf/Renderer.cs);
fonts (Inter and JetBrains Mono, both SIL OFL) are in `backend/Pdf/fonts`.

Rough numbers on a laptop: 500 RMs takes about 34 seconds and produces a ZIP of about
90 MB (each PDF embeds its fonts).

The HTML version of each breakdown is built in the browser and can be downloaded per RM
from the preview page, or as a ZIP from the export page.

## Where the calculation lives

The validation, calculation and HTML template code is in
[frontend/src/lib/engine.js](frontend/src/lib/engine.js), a plain JavaScript file copied
from the original single-file tool. The only edits made to it are replacing em dashes with
hyphens in text that appears in the PDF. The backend's Excel job is to turn the upload into
raw row objects ([backend/Excel/ExcelSheetReader.cs](backend/Excel/ExcelSheetReader.cs)).

## Project structure

```
/frontend    React + TypeScript (Vite)
/backend     ASP.NET Core (.NET 8) Web API: Excel upload and QuestPDF generation
```

## Local development

Backend:
```bash
cd backend
dotnet run --urls http://localhost:5080
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL, defaults to http://localhost:5080
npm run dev
```

## Path note for .NET

If the repository path contains a `|` character, MSBuild fails to resolve project
outputs. Clone or copy the repo to a path without special characters before building the
backend. The frontend is not affected.

## Deploying

The frontend is static and the backend is a .NET service, so they deploy separately and the
frontend must be told where the backend is.

1. **Backend** (Render Web Service, environment `Docker`): root directory `backend/`. The
   included `Dockerfile` builds and runs it. Set the environment variable `CORS_ORIGINS` to
   the frontend's URL, for example `https://squareincentive.vercel.app` (comma separated
   for several).
2. **Frontend** (Vercel): root directory `frontend/`. Set `VITE_API_BASE_URL` to the
   backend's public URL, for example `https://your-service.onrender.com`, then redeploy.
   Vite reads this at build time, so changing it needs a new build. `vercel.json` makes
   page refreshes on `/validate`, `/preview` and `/export` work.

Without step 2 the site tries `http://localhost:5080` and shows "Could not parse file:
Failed to fetch". Free Render services sleep when idle, so the first request after a
break can take about a minute.

## Licensing note

QuestPDF is used under its Community license, which is free for open-source projects and
small organisations. Check the current terms at https://www.questpdf.com/license/ if the
tool is used commercially.
