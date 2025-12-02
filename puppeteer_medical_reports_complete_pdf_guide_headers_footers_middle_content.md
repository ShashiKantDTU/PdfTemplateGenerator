# Puppeteer Medical Reports – Complete PDF Guide (Headers/Footers + Middle Content)

This guide shows you **exactly** how to generate medical-report PDFs in Puppeteer with:
- Repeating **header** and **footer** on **every page**
- Content restricted to the **middle area** (between top/bottom margins)
- Clean pagination for long text and tables
- Practical patterns for dynamic data, images, page numbers, dates

> TL;DR: Use `page.pdf({ displayHeaderFooter: true, headerTemplate, footerTemplate, margin: {...} })`. Put only report content in your main HTML; let Puppeteer render header/footer separately.

---

## 1) What We’re Building (Mental Model)

When Chromium prints to PDF, the page is split into three zones:
1. **Top margin** → your header template is injected here.
2. **Content area** → your main HTML flows only in this middle space.
3. **Bottom margin** → your footer template is injected here.

So the plan is:
- Remove header/footer from your main HTML template.
- Provide small, self-contained `headerTemplate` / `footerTemplate` strings.
- Reserve space with `margin.top` and `margin.bottom` so the middle area is fixed.

---

## 2) Prerequisites

- Node.js 18+ (LTS recommended)
- Puppeteer 22+ (or the version you already use)
- Basic HTML/CSS knowledge

```bash
mkdir medical-pdf && cd medical-pdf
npm init -y
npm i puppeteer
```

> Tip: If you run in a server/CI environment, you may need `PUPPETEER_EXECUTABLE_PATH` or `puppeteer-core` with a system Chrome. Start locally first.

---

## 3) Project Structure

```
medical-pdf/
├─ src/
│  ├─ generatePdf.js          # main entry
│  ├─ templates/
│  │  ├─ report.html          # main content template (no header/footer!)
│  │  ├─ header.html          # header snippet
│  │  └─ footer.html          # footer snippet
│  └─ data/
│     └─ samplePatient.json   # sample medical data
└─ package.json
```

You can also inline the header/footer in JS strings. Files are clearer for iteration.

---

## 4) The Main Content Template (`report.html`)

**Goal:** contains only the middle content (no fixed header/footer). Use clean, print-friendly CSS.

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Medical Report</title>
  <style>
    @page { size: A4; margin: 0; }

    /* Base layout for readable print */
    body { font-family: Arial, sans-serif; font-size: 12px; color: #222; }

    /* Keep important blocks together across page breaks */
    .section { break-inside: avoid; page-break-inside: avoid; margin-bottom: 12px; }

    /* Tables: repeat header row automatically */
    table { width: 100%; border-collapse: collapse; margin: 8px 0; }
    th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }

    /* Manual forced page break when needed */
    .page-break { break-before: page; page-break-before: always; }

    /* Optional: nicer headings */
    h1, h2, h3 { margin: 0 0 6px; }
  </style>
</head>
<body>
  <div class="section">
    <h1>Patient Summary</h1>
    <div><strong>Patient:</strong> {{patientName}}</div>
    <div><strong>DOB:</strong> {{dob}}</div>
    <div><strong>Report Date:</strong> {{reportDate}}</div>
    <div><strong>Ref. Doctor:</strong> {{refDoctor}}</div>
  </div>

  <div class="section">
    <h2>Test Results</h2>
    <table>
      <thead>
        <tr>
          <th>Test</th>
          <th>Result</th>
          <th>Units</th>
          <th>Reference Range</th>
          <th>Flag</th>
        </tr>
      </thead>
      <tbody>
        {{#each results}}
        <tr>
          <td>{{this.name}}</td>
          <td>{{this.value}}</td>
          <td>{{this.units}}</td>
          <td>{{this.reference}}</td>
          <td>{{this.flag}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2>Notes</h2>
    <p>{{notes}}</p>
  </div>

  <!-- Example of forcing a new page for attachments/images -->
  <div class="page-break"></div>
  <div class="section">
    <h2>Attachments</h2>
    <img src="{{chartDataUrl}}" alt="Trend Chart" style="max-width:100%;"/>
  </div>
</body>
</html>
```

> Use your own templating method (Handlebars, EJS, string replace). The example shows `{{ }}` placeholders and `{{#each}}` loops conceptually.

---

## 5) Header and Footer Templates

**Rule:** These snippets **do not inherit** your main page styles. Include inline styles or a `<style>` block **inside the snippet**.

### `header.html`
```html
<style>
  .wrap { font-family: Arial, sans-serif; font-size: 10px; color: #333; width: 100%; }
  .line { border-bottom: 1px solid #ccc; padding: 6px 0; }
  .row { display: flex; justify-content: space-between; align-items: center; }
  .title { font-weight: bold; }
</style>
<div class="wrap">
  <div class="line row">
    <div class="title">Confidential Medical Report — <span class="title"></span></div>
    <div>Patient: <span class="patient"></span></div>
  </div>
</div>
```

> Puppeteer also injects built-in classes: `.date`, `.title`, `.url`, `.pageNumber`, `.totalPages`. You can mix your own spans too (e.g., `.patient`) by string-interpolating values before passing the template.

### `footer.html`
```html
<style>
  .wrap { font-family: Arial, sans-serif; font-size: 9px; color: #666; width: 100%; }
  .row { display: flex; justify-content: space-between; padding-top: 4px; }
</style>
<div class="wrap">
  <div class="row">
    <div>Generated: <span class="date"></span></div>
    <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
  </div>
</div>
```

> Avoid external fonts here. If you need logos, use small data URLs.

---

## 6) Generating the HTML (with Data)

Use a tiny helper to escape text and a simple replace function for placeholders.

```js
// src/utils.js
export function escapeHtml(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function fill(template, map) {
  return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
    const value = key.split('.').reduce((o, k) => (o ? o[k] : undefined), map);
    return escapeHtml(value ?? "");
  });
}
```

```js
// src/data/samplePatient.json
{
  "patientName": "John Doe",
  "dob": "1988-04-12",
  "reportDate": "2025-11-04",
  "refDoctor": "Dr. A. Sharma",
  "notes": "Patient is stable. Follow-up in 3 months.",
  "results": [
    { "name": "Hemoglobin", "value": 13.5, "units": "g/dL", "reference": "13.0–17.0", "flag": "Normal" },
    { "name": "WBC", "value": 12.2, "units": "×10^9/L", "reference": "4.0–11.0", "flag": "High" }
  ]
}
```

---

## 7) Core PDF Generation Code

```js
// src/generatePdf.js
import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { fill } from './utils.js';

const ROOT = path.resolve(process.cwd(), 'src');
const TPL = (p) => path.join(ROOT, 'templates', p);

async function load(file) {
  return fs.readFile(file, 'utf8');
}

export async function createMedicalPdf(data, outPath = 'report.pdf') {
  const [reportTpl, headerTpl, footerTpl] = await Promise.all([
    load(TPL('report.html')),
    load(TPL('header.html')),
    load(TPL('footer.html')),
  ]);

  // Fill main report HTML with data
  const reportHtml = fill(reportTpl, data);

  // Interpolate dynamic bits into header/footer if you need (e.g., patient name)
  const headerHtml = headerTpl
    .replace('<span class="patient"></span>', fill('<span class="patient">{{patientName}}</span>', data));

  const browser = await puppeteer.launch({
    headless: 'new', // or true/false depending on version
    // args: ['--font-render-hinting=none'] // optional for consistency
  });
  const page = await browser.newPage();

  // Ensure print CSS applies
  await page.emulateMediaType('print');

  // Load main content
  await page.setContent(reportHtml, { waitUntil: 'networkidle0' });

  // Choose either CSS @page size or explicit format
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: headerHtml,
    footerTemplate: footerTpl,
    margin: {
      top: '96px',      // ~1 inch; adjust to fit your header
      bottom: '72px',   // ~0.75 inch; adjust to fit your footer
      left: '40px',
      right: '40px'
    },
    preferCSSPageSize: false, // set true if you rely on @page size in CSS
    // scale: 1 // set to keep layout consistent across environments
  });

  await browser.close();
  await fs.writeFile(outPath, pdfBuffer);
  return outPath;
}

// Demo run when called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const data = JSON.parse(await fs.readFile(path.join(ROOT, 'data', 'samplePatient.json'), 'utf8'));
  createMedicalPdf(data, path.resolve(process.cwd(), 'medical-report.pdf'))
    .then((p) => console.log('PDF saved to', p))
    .catch((e) => { console.error(e); process.exitCode = 1; });
}
```

**Key options explained:**
- `displayHeaderFooter: true` → activates header/footer system
- `headerTemplate` / `footerTemplate` → HTML injected into top/bottom margins
- `margin.top`/`bottom` → **reserves** space so body stays in the middle
- `emulateMediaType('print')` → activates print CSS (e.g., `@page`, `break-before`)
- `printBackground: true` → allows backgrounds/borders in header/footer

---

## 8) Pagination Control Cheatsheet

**Keep elements together**
```css
.section { break-inside: avoid; page-break-inside: avoid; }
```

**Force new page**
```css
.page-break { break-before: page; page-break-before: always; }
```

**Repeat table header/footer**
```css
thead { display: table-header-group; }
tfoot { display: table-footer-group; }
```

**Avoid awkward splits** (e.g., 2–3 lines orphaned)
```css
p { orphans: 3; widows: 3; }
```

---

## 9) Images, Logos, and Fonts

- **Logos in header/footer**: Use **data URLs** (`<img src="data:image/png;base64,..."/>`) to avoid network timing issues.
- **Web fonts**: Can cause layout shifts → prefer system fonts or embed a minimal WOFF as data URL in header/footer.
- **Charts**: Render to `data:` images before printing; don’t rely on client-side JS in print.

---

## 10) Dynamic Fields in Header/Footer

Puppeteer auto-populates these classes **inside header/footer templates**:
- `.pageNumber`, `.totalPages`
- `.date` (print date)
- `.title` (document title)
- `.url`

You can inject your own, e.g., patient name or lab ID, by string interpolation **before** passing `headerTemplate`/`footerTemplate` to `pdf()`.

---

## 11) Testing Checklist (Medical-Report Specific)

- [ ] Header and footer appear on **every page**
- [ ] Body content never overlaps header/footer (adjust margins if needed)
- [ ] Long tables repeat table header rows
- [ ] Critical blocks (e.g., diagnosis summary) do not split across pages
- [ ] Page numbers correct (1 of N)
- [ ] No layout shift after fonts/images load
- [ ] Patient identifiers present on each page (as required by your compliance rules)
- [ ] Generated file size reasonable; images optimized

---

## 12) Troubleshooting & Gotchas

**Header/footer cut off** → Increase `margin.top`/`bottom` until it fits (include borders/padding).

**Content touches header/footer** → Your margins may be too small; remove extra padding in header/footer snippets; use left/right margins for alignment instead of padding.

**External styles don’t apply to header/footer** → Inline styles inside the templates.

**Long table splits mid-row** → Apply `break-inside: avoid` to the row or wrap related rows in a `.section` (note: very long rows may still split).

**Different results on server vs local** → Pin `puppeteer` version and set `scale: 1`; consider using the bundled Chromium.

**Images missing** → Convert to `data:` URLs or `await page.goto('file://...')` with absolute paths; avoid relative paths that depend on CWD.

**Need per-section running headers** (e.g., change header after “Biochemistry”):
- Easiest in Puppeteer: generate separate PDFs per section with different header templates and **merge**.
- For complex publishing needs, consider PrinceXML/PDFReactor.

---

## 13) Security & Compliance Notes

- Escape all patient-provided text (`escapeHtml`) to avoid accidental HTML injection.
- Do not leak internal URLs in `.url` unless required.
- If PDFs are shared, consider redacting sensitive fields (e.g., via a separate “for patient” version).

---

## 14) Minimal Working Example (Inline Templates)

```js
import puppeteer from 'puppeteer';

const headerTemplate = `
  <style>
    .w{font-family:Arial,sans-serif;font-size:10px;color:#333;width:100%;}
    .r{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ccc;padding:6px 0}
  </style>
  <div class="w"><div class="r">
    <div><strong>Confidential Medical Report</strong></div>
    <div>Patient: John Doe</div>
  </div></div>`;

const footerTemplate = `
  <style>.w{font-family:Arial,sans-serif;font-size:9px;color:#666;width:100%;}
  .r{display:flex;justify-content:space-between;padding-top:4px}</style>
  <div class="w"><div class="r">
    <div>Generated: <span class="date"></span></div>
    <div>Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>
  </div></div>`;

const html = `<!doctype html><html><head><meta charset="utf-8"/>
<style>
@page{size:A4;margin:0}
body{font-family:Arial,sans-serif;font-size:12px}
.section{break-inside:avoid;margin-bottom:12px}
.table{width:100%;border-collapse:collapse}
.table th,.table td{border:1px solid #ddd;padding:6px;text-align:left}
.table thead{display:table-header-group}
.page-break{break-before:page}
</style></head><body>
  <div class="section"><h1>Patient Summary</h1>
  <div><b>Patient:</b> John Doe</div><div><b>DOB:</b> 1988-04-12</div></div>
  <div class="section"><h2>Test Results</h2>
  <table class="table"><thead><tr><th>Test</th><th>Result</th><th>Units</th><th>Range</th></tr></thead><tbody>
  ${Array.from({length:120}).map((_,i)=>`<tr><td>Test ${i+1}</td><td>${(Math.random()*10).toFixed(2)}</td><td>u</td><td>1-9</td></tr>`).join('')}
  </tbody></table></div>
</body></html>`;

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.emulateMediaType('print');
await page.setContent(html, { waitUntil: 'networkidle0' });
const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate,
  footerTemplate,
  margin: { top: '96px', bottom: '72px', left: '40px', right: '40px' }
});
await browser.close();
import { writeFileSync } from 'node:fs';
writeFileSync('demo-report.pdf', pdf);
```

---

## 15) Next Steps (Optional Enhancements)

- **Watermark**: Add a light watermark in the main HTML using a fixed background image on `body` with low opacity.
- **Section-wise headers**: Render multiple PDFs and merge; or keep one PDF but vary header content via a template variable, then manually insert page breaks.
- **Localization**: Inject `Intl.DateTimeFormat` formatted dates into the content before printing.
- **Batch generation**: Reuse a single browser instance and multiple pages to speed up printing of many reports.

---

## 16) Summary

- Let Puppeteer handle **headers/footers** via `displayHeaderFooter`.
- Reserve space with **margins** so body stays in the **middle**.
- Keep main content template **header/footer-free** and use print CSS to control pagination.
- Test with **long tables** and edge cases to finalize your margin sizes.

You now have a clean, production-ready workflow for medical-report PDFs.

