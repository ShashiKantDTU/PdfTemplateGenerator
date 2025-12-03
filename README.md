# PDF Template Designer

A dedicated backend environment for designing and testing PDF templates with live-reloading preview.

## 🚀 Features

- **Live Preview Server**: Automatically refreshes when you make changes to templates or data
- **PDF Generation**: Generate high-quality PDFs from your templates
- **Handlebars Templating**: Powerful templating engine for dynamic content
- **Isolated Environment**: Keep template design separate from your main project

## 📦 Installation

All dependencies are already installed. If you need to reinstall:

```bash
npm install
```

## 🛠️ Usage

### Design and Preview Templates

Start the live development server:

```bash
npm run dev
```

- Open your browser to `http://localhost:3000`
- Edit `report-template.html` or `sample-data.json`
- The browser automatically refreshes when you save changes

### Generate Final PDF

Once you're happy with your design:

```bash
npm run generate
```

This creates `final-report.pdf` in the project folder.

## 📁 Project Structure

```
/PdfTemplateGenerator
├── node_modules/           # Dependencies
├── package.json           # Project configuration
├── dev-server.js          # Live-preview server
├── generate-pdf.js        # PDF generation script
├── report-template.html   # Your HTML/CSS template
├── sample-data.json       # Sample data for live preview
└── final-report.pdf       # Generated PDF (created after running npm run generate)
```

## ✨ Customization

### Modify Template
Edit `report-template.html` to change the design, layout, and styling.

### Update Sample Data
Edit `sample-data.json` to test with different data during development.

### PDF Settings
Modify `generate-pdf.js` to adjust:
- Page format (A4, Letter, etc.)
- Margins
- Print background settings
- Output filename

## 🎯 Workflow

1. **Design Phase**: Run `npm run dev` and design your template with live reload
2. **Test Phase**: Update `sample-data.json` with different test cases
3. **Generate Phase**: Run `npm run generate` to create the final PDF
4. **Integration Phase**: Copy your template and generation logic to your main project

## 📝 Notes

- The live reload server watches all files in the current directory
- Changes to any file will trigger a browser refresh
- Generated PDFs include print backgrounds and maintain A4 format
- Puppeteer headless browser ensures consistent PDF rendering

## 🔧 Technologies Used

- **Express**: Web server framework
- **Handlebars**: Templating engine
- **Puppeteer**: Headless Chrome for PDF generation
- **Nodemon**: Development server with auto-restart
- **LiveReload**: Browser auto-refresh on file changes


---

# 📋 Complete Analysis: Medical Laboratory Report System

## 🎯 What You're Building

You're building a **Medical Laboratory Report PDF Generation System** for diagnostic labs. This system:
1. Takes patient test data (JSON)
2. Applies it to HTML templates using Handlebars.js
3. Generates professional PDF reports using Puppeteer

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        PDF OUTPUT                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ HEADER (report-header.html)                               │  │
│  │   • Lab Background/Letterhead (92.5mm space)              │  │
│  │   • Patient Info: Name, Age, Gender                       │  │
│  │   • Report Info: Report ID, Date, Registration Date       │  │
│  │   • QR Code (optional)                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ BODY (report1.html)                                       │  │
│  │   • Test Results in Tables                                │  │
│  │   • Each test section with:                               │  │
│  │     - Category Header (e.g., "HEMATOLOGY")                │  │
│  │     - Test Name (e.g., "Complete Blood Count")            │  │
│  │     - Results Table (Test | Result | Flag | Range | Unit) │  │
│  │     - Interpretation (if any)                             │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ FOOTER (report-footer.html)                               │  │
│  │   • Doctor Signatures (up to 5 doctors)                   │  │
│  │   • Doctor Names & Qualifications                         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  JSON Data       │────▶│  Handlebars      │────▶│  Puppeteer       │
│  (report1-data)  │     │  Templates       │     │  PDF Generator   │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
        ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
        │report1.html │ │header.html  │ │footer.html  │
        │(main body)  │ │(patient info)│ │(signatures) │
        └─────────────┘ └─────────────┘ └─────────────┘
```

---

## 📁 JSON Data Structure Explained

### 1. **Laboratory Information**
```json
"laboratory": {
    "name": "My Lab",
    "phone": "9354739451",
    "ownerName": "Sunny Poddar"
}
```
This defines who is generating the report.

### 2. **Doctor/Pathologist Signatures**
```json
"doctors": [
    {
        "name": "Doc 1",
        "qualification": "MBBS",
        "signatureUrl": "https://...signature.png",
        "departments": ["All Departments"]
    }
]
```
Each doctor has a signature image that appears in the footer.

### 3. **Patient Information**
```json
"patient": {
    "designation": "Mr",
    "fullName": "Mr Sunny Poddar",
    "age": 22,
    "ageDisplay": "22 years",
    "gender": "male",
    "referringDoctor": "Dr. Ramesh Kumar"
}
```

### 4. **Tests Array - The Core**
This is where the magic happens. Each test in the array follows this structure:

```json
{
    "testCode": "CBC",
    "testName": "Complete Blood Count (CBC)",
    "category": "Hematology",      // Department name
    "status": "approved",
    "fields": [...]                // The actual test results
}
```

---

## 🔬 Test Field Types

### Type 1: **Simple Field** (Direct Value)
```json
{
    "type": "field",
    "name": "Haemoglobin",
    "value": "15",
    "unit": "g/dL",
    "referenceRange": "13 - 17",
    "isAbnormal": false,
    "abnormalType": "normal"
}
```
**Renders as:**
| Test Description | Result | Flag | Ref. Range | Unit |
|-----------------|--------|------|------------|------|
| Haemoglobin | 15 | | 13 - 17 | g/dL |

---

### Type 2: **Group Field** (Nested Results)
Used for related tests that should be grouped together:
```json
{
    "type": "group",
    "name": "Differential Leucocyte Count",
    "sub_fields": [
        {"type": "field", "name": "Neutrophils", "value": "50", ...},
        {"type": "field", "name": "Lymphocytes", "value": "35", ...}
    ]
}
```
**Renders as:**
| Test Description | Result | Flag | Ref. Range | Unit |
|-----------------|--------|------|------------|------|
| **Differential Leucocyte Count** | | | | |
| &nbsp;&nbsp;Neutrophils | 50 | | 40 - 80 | % |
| &nbsp;&nbsp;Lymphocytes | 35 | | 20 - 40 | % |

---

### Type 3: **HTML Rich Content** (Complex Tests)
For tests like **Widal Test** that need special formatting:
```json
{
    "type": "field",
    "name": "Test Results",
    "value": "<table>...</table><p>Interpretation...</p>",
    "displayValue": "<table>...</table>..."
}
```
**Renders as:** A custom HTML table with plus/minus indicators

---

## 🚨 Abnormal Value Handling

The system automatically flags abnormal values:

```json
{
    "name": "Platelet Count",
    "value": "90000",
    "referenceRange": "150000 - 410000",
    "isAbnormal": true,
    "abnormalType": "low"    // Can be: "low", "high", or "normal"
}
```

**Visual Output:**
- **High values (H)**: Red text, bold, shows "H" in Flag column
- **Low values (L)**: Blue text, bold, shows "L" in Flag column
- **Normal values**: Black text, no flag

---

## 🎨 How the Report Looks

### Visual Structure of Final PDF:

```
┌─────────────────────────────────────────────────────────────┐
│                   [LAB LETTERHEAD/BACKGROUND]               │
│                   (92.5mm reserved space)                   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Name: Mr Sunny Poddar     │ Report ID: 251202002-1      │ │
│ │ Age/Gender: 22 years/Male │ Report Date: 02 Dec 2025    │ │
│ │ Referred By: Dr. Ramesh   │ Reg Date: 02 Dec 2025       │ │
│ │ Patient ID: 251202002     │                       [QR]  │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│                      HEMATOLOGY                             │
│              COMPLETE BLOOD COUNT (CBC)                     │
│ ┌─────────────┬────────┬──────┬──────────────┬───────────┐ │
│ │Test         │Result  │Flag  │Ref. Range    │Unit       │ │
│ ├─────────────┼────────┼──────┼──────────────┼───────────┤ │
│ │Haemoglobin  │15      │      │13 - 17       │g/dL       │ │
│ │TLC          │8000    │      │4000 - 10000  │/cumm      │ │
│ │Diff. Count  │        │      │              │           │ │
│ │  Neutrophils│50      │      │40 - 80       │%          │ │
│ │  Basophils  │5 (RED) │H     │0 - 1         │%          │ │
│ │Platelets    │        │      │              │           │ │
│ │  Count      │90000   │L     │150000-410000 │/cumm      │ │
│ │             │(BLUE)  │      │              │           │ │
│ └─────────────┴────────┴──────┴──────────────┴───────────┘ │
├─────────────────────────────────────────────────────────────┤
│                       SEROLOGY                              │
│               WIDAL TEST (TUBE METHOD)                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │        │1:20 │1:40 │1:80 │1:160│1:320│                  │ │
│ │TYPHI O │  +  │  +  │  +  │  +  │  -  │                  │ │
│ │TYPHI H │  +  │  +  │  +  │  -  │  -  │                  │ │
│ │Result: Positive | INTERPRETATION: WEAKLY POSITIVE       │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ [Sign1]      [Sign2]      [Sign3]                          │
│ Doc 1        Doc 2        Doc 3                            │
│ MBBS         BDMS         MD Pathology                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Generation Logic (generate-pdf.js)

### Step-by-Step Process:

1. **Load Data & Template**
   ```javascript
   const data = JSON.parse(fs.readFileSync('./data/report1-data.json'));
   const templateHtml = fs.readFileSync('./templates/report1.html');
   ```

2. **Compile with Handlebars**
   ```javascript
   const template = handlebars.compile(templateHtml);
   const finalHtml = template(data);
   ```

3. **Launch Puppeteer Browser**
   ```javascript
   const browser = await puppeteer.launch();
   const page = await browser.newPage();
   await page.setContent(finalHtml);
   ```

4. **Generate PDF with Header/Footer**
   ```javascript
   await page.pdf({
       path: 'output/report1.pdf',
       format: 'A4',
       headerTemplate: headerTemplate,    // Patient info box
       footerTemplate: footerTemplate,    // Doctor signatures
       margin: {
           top: '92.5mm',     // Space for letterhead
           bottom: '140px'    // Space for footer
       }
   });
   ```

---

## 🧩 Template Logic (Handlebars)

### Key Helpers Used:

| Helper | Purpose | Example |
|--------|---------|---------|
| `{{#each tests}}` | Loop through all tests | Iterate test array |
| `{{#if condition}}` | Conditional rendering | Show if value exists |
| `{{eq a b}}` | Equality check | `{{#if (eq type 'field')}}` |
| `{{contains str substr}}` | String contains | `{{#if (contains value '<table')}}` |
| `{{{htmlContent}}}` | Raw HTML output | Render Widal tables |

### Rendering Flow in Template:

```
For each test:
├── Show Category Header (e.g., "HEMATOLOGY")
├── Show Test Name (e.g., "COMPLETE BLOOD COUNT")
├── Check inputType:
│   ├── If 'text' or 'select': Render raw content
│   └── If 'numeric' (default):
│       ├── First render any HTML content outside table
│       └── Then render numeric fields in table:
│           For each field:
│           ├── If type='field': Render as table row
│           └── If type='group': Render group header + sub_fields
└── Show Interpretation (if any)
```

---

## 🎯 Key Features Summary

| Feature | Implementation |
|---------|---------------|
| **Multi-test reports** | `{{#each tests}}` loops through all tests |
| **Hierarchical data** | Groups with `sub_fields` arrays (3+ levels) |
| **Abnormal highlighting** | CSS classes `.abnormal-high`, `.abnormal-low` |
| **Rich HTML content** | Widal tables rendered with `{{{displayValue}}}` |
| **Doctor signatures** | Base64 encoded images in footer |
| **Professional layout** | A4 format with proper margins |
| **Page breaks** | CSS `page-break-inside: avoid` for sections |

---

## 📝 Report Types Supported

Based on `inputType`:

1. **Numeric Tests** (Default) - CBC, Liver Function, etc.
   - Shows standard 5-column table

2. **Text Tests** - Histopathology reports
   - Shows free-form text/HTML content

3. **Select Tests** - Widal, Dengue markers
   - Shows custom HTML tables with +/- results

---

## 🔄 Workflow for Creating a Report

```
1. Collect Patient Data
         ↓
2. Run Lab Tests
         ↓
3. Enter Results in System (creates JSON)
         ↓
4. Run: node generate-pdf.js report1
         ↓
5. System:
   a. Reads report1-data.json
   b. Applies to report1.html template
   c. Compiles header/footer templates
   d. Puppeteer renders to PDF
         ↓
6. Output: output/report1.pdf
```