# Incentive PDF Tool

A two-page web app version of `Incentive_PDF_Tool.html`: upload an Excel workbook,
then view/download the exact same per-RM PDF breakdowns the original single-file
tool generates. No login, no roles, no dashboard — just upload → preview → export,
matching the original tool's flow.

## Why this produces identical output

The calculation engine and the HTML/PDF email template (`validateAndNormalize`,
`calculateIncentive`, `buildFullEmail`, `generateEmailHtml`, `generatePlainText`,
and their formatting helpers) are copied **verbatim** from
`Incentive_PDF_Tool.html` into [frontend/src/lib/engine.js](frontend/src/lib/engine.js).
Nothing in that file was rewritten — see the note at its top and bottom. The PDF
export pipeline (`html2canvas` → sliced `jsPDF` pages, zipped) is the same
algorithm too, in [frontend/src/lib/pdfExport.ts](frontend/src/lib/pdfExport.ts).

The backend's only job is turning the uploaded `.xlsx` into the same raw row
objects the original tool's `XLSX.utils.sheet_to_json()` produced — see
[backend/Excel/ExcelSheetReader.cs](backend/Excel/ExcelSheetReader.cs). All
validation, calculation, and rendering happens in the browser, using the
original code, so results are guaranteed to match.

## Project structure

```
/frontend    — React + TypeScript (Vite)
/backend     — ASP.NET Core (.NET 8) Web API — Excel upload only
```

## Flow

1. **Upload** — drop or browse an `.xlsx` with `RMs` and `Deals` sheets.
2. **Validation** — see row counts and any errors/warnings before proceeding.
3. **Preview** — pick a recipient from the searchable/filterable list, see their
   PDF rendered in an iframe, copy its HTML/plain text.
4. **Bulk export** — download a ZIP of one PDF per RM, or a ZIP of the raw HTML
   files.

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

## IMPORTANT — local path issue on this machine

This project's path contains a literal `|` character
(`.../Folders | Abhay/...`), which breaks the .NET SDK's MSBuild when
resolving build paths (unrelated to this project — a general MSBuild bug). The
frontend is unaffected. To build/run the backend locally on this machine, use a
synced copy at a path without special characters, e.g.:

```bash
rsync -a --exclude bin --exclude obj backend/ ~/dev/incentive-backend/
cd ~/dev/incentive-backend && dotnet run --urls http://localhost:5080
```

This has no effect on deployment (Render checks out the repo at a normal path).

## Deploying

- **Backend** (Render Web Service): root `backend/`, build `dotnet publish -c
  Release -o out`, start `dotnet out/IncentiveTool.Api.dll`. Set `CORS_ORIGINS`
  to the deployed frontend's URL.
- **Frontend** (Render Static Site): root `frontend/`, build `npm run build`,
  publish directory `dist/`. Set `VITE_API_BASE_URL` to the backend's URL.

## Known gap

QuestPDF/server-side PDF generation was deliberately **not** used — PDFs are
generated client-side via the original tool's own `html2canvas` + `jsPDF`
pipeline, so output matches exactly. This does mean PDF generation happens in
the visitor's browser (same as the original tool), which is fine for the
current ~200-RM scale but is worth knowing if that scale grows substantially.
