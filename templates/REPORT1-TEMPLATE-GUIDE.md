# Medical Laboratory Report Template (report1.html)

## 📋 Overview

The `report1.html` template is a professional medical laboratory report template designed to display hierarchical test results with proper formatting, abnormal value indicators, and medical report standards.

---

## 🎨 Features

### Visual Design
- **Clean Professional Layout**: A4 size optimized for PDF generation
- **Color Scheme**: Medical blue (#2c5aa0) theme with clear visual hierarchy
- **Background**: Subtle watermark using lab background image
- **Typography**: Arial/Helvetica for medical readability
- **Responsive Tables**: Properly formatted test result tables

### Functional Features
- ✅ **Hierarchical Test Structure**: Supports nested groups and sub-fields
- ✅ **Abnormal Value Highlighting**: Red text with ↑/↓ indicators
- ✅ **HTML Content Support**: Rich content like Widal test tables
- ✅ **Multiple Tests**: Displays multiple tests in one report
- ✅ **Patient Information**: Complete patient demographics
- ✅ **Report Metadata**: Report numbers, dates, status badges
- ✅ **Professional Footer**: Signatures and disclaimers

---

## 📂 File Structure

```
templates/
  ├── report1.html                    # Main template file
  └── backgrounds/
      └── report-background.jpeg      # Watermark background

data/
  └── report1-data.json               # Sample data file
```

---

## 🔧 How It Works

### 1. Template System
- Uses **Handlebars.js** for templating
- Variables: `{{variable}}` 
- HTML content: `{{{htmlContent}}}`
- Conditionals: `{{#if condition}}...{{/if}}`
- Loops: `{{#each array}}...{{/each}}`
- Custom helpers: `eq`, `contains`

### 2. Data Structure

The template expects data in this format:

```json
{
  "laboratory": {
    "name": "Lab Name",
    "address": "Address",
    "phone": "Phone",
    "email": "Email",
    "registrationNumber": "REG123",
    "timing": "8:00 AM - 8:00 PM"
  },
  "report": {
    "reportNumber": "RPT001",
    "billNumber": "BILL001",
    "status": "approved",
    "isUrgent": false
  },
  "dates": {
    "reportDate": "01 Jan 2025",
    "collectionDate": "31 Dec 2024",
    "reportedDate": "01 Jan 2025"
  },
  "patient": {
    "fullName": "Mr John Doe",
    "ageDisplay": "35 years",
    "genderDisplay": "Male",
    "phone": "1234567890",
    "referringDoctor": "Dr. Smith"
  },
  "tests": [
    {
      "testCode": "CBC",
      "testName": "Complete Blood Count",
      "category": "Hematology",
      "status": "approved",
      "fields": [
        {
          "type": "field",
          "name": "Hemoglobin",
          "value": "14.5",
          "unit": "g/dL",
          "referenceRange": "13-17",
          "isAbnormal": false,
          "abnormalType": "normal"
        },
        {
          "type": "group",
          "name": "WBC Count",
          "sub_fields": [...]
        }
      ]
    }
  ]
}
```

---

## 📊 Template Sections

### 1. Header Section
```html
<div class="report-header">
  <h1 class="lab-name">{{laboratory.name}}</h1>
  <p class="lab-details">...</p>
</div>
```

**Features:**
- Lab name in bold blue
- Address, phone, email, registration number
- Professional medical header styling

---

### 2. Patient & Report Information
```html
<div class="info-section">
  <div class="info-box"><!-- Patient Info --></div>
  <div class="info-box"><!-- Report Info --></div>
</div>
```

**Features:**
- Two-column layout
- Patient demographics (name, age, gender, contact)
- Report metadata (number, dates, status)
- Status badges (approved/pending/urgent)

---

### 3. Test Results Section
```html
{{#each tests}}
<div class="test-section">
  <div class="test-header">{{testName}}</div>
  <table class="results-table">
    <!-- Results here -->
  </table>
</div>
{{/each}}
```

**Features:**
- Gradient blue header for each test
- 4-column table: Investigation | Result | Unit | Reference Range
- Hierarchical rendering (supports 3+ levels of nesting)
- Group rows with background color
- Indentation for nested fields

---

### 4. Field Rendering Logic

#### Simple Field (Numeric/Text)
```html
{{#if (eq this.type 'field')}}
  <tr>
    <td>{{name}}</td>
    <td class="center {{#if isAbnormal}}abnormal abnormal-{{abnormalType}}{{/if}}">
      {{value}}
    </td>
    <td class="center">{{unit}}</td>
    <td class="center">{{referenceRange}}</td>
  </tr>
{{/if}}
```

**Result:**
| Investigation | Result | Unit | Reference Range |
|--------------|--------|------|-----------------|
| Hemoglobin   | 14.5   | g/dL | 13-17          |

#### HTML Field (Rich Content)
```html
{{#if (contains displayValue '<table')}}
  <tr>
    <td colspan="4">
      <div class="html-content">
        {{{displayValue}}}
      </div>
    </td>
  </tr>
{{/if}}
```

**Used for:** Widal test tables, microscopic descriptions, interpretations

#### Group Field (Nested)
```html
{{#if (eq this.type 'group')}}
  <tr class="group-row">
    <td colspan="4">{{name}}</td>
  </tr>
  {{#each sub_fields}}
    <!-- Recursive rendering -->
  {{/each}}
{{/if}}
```

**Result:**
| Investigation | Result | Unit | Reference Range |
|--------------|--------|------|-----------------|
| **WBC Count** | | | |
| &nbsp;&nbsp;Total WBC | 7000 | /cumm | 4000-10000 |
| &nbsp;&nbsp;Neutrophils | 60 | % | 40-75 |

---

### 5. Abnormal Value Styling

#### CSS Classes
```css
.abnormal {
  color: #d32f2f !important;
  font-weight: bold;
}

.abnormal-high::after {
  content: " ↑";
}

.abnormal-low::after {
  content: " ↓";
}
```

#### Usage in Data
```json
{
  "name": "RDW-CV",
  "value": "15",
  "isAbnormal": true,
  "abnormalType": "high"
}
```

**Result:** `15 ↑` (in red, bold)

---

### 6. Footer Section
```html
<div class="report-footer">
  <div class="signatures">
    <div class="signature-box">Lab Technician</div>
    <div class="signature-box">Pathologist</div>
  </div>
  <div class="disclaimer">...</div>
</div>
```

**Features:**
- Signature lines for Lab Technician and Pathologist
- Medical disclaimers and notes
- Professional footer styling

---

## 🎯 Customization Guide

### Change Color Theme
```css
/* Replace #2c5aa0 with your brand color */
.lab-name { color: #2c5aa0; }
.test-header { background: linear-gradient(to right, #2c5aa0, #4a7fc2); }
```

### Modify Table Columns
```html
<!-- Current: 40% | 20% | 15% | 25% -->
<th style="width: 40%;">Investigation</th>
<th style="width: 20%;">Result</th>
<th style="width: 15%;">Unit</th>
<th style="width: 25%;">Reference Range</th>
```

### Add/Remove Fields
Edit the info boxes:
```html
<div class="info-row">
  <span class="info-label">New Field:</span>
  <span class="info-value">{{data.newField}}</span>
</div>
```

### Change Indentation Levels
```css
.indent-1 { padding-left: 25px !important; }
.indent-2 { padding-left: 45px !important; }
.indent-3 { padding-left: 65px !important; }
```

---

## 🚀 Usage

### 1. Preview in Browser
```bash
npm run dev
```
Then open: `http://localhost:3000/report1`

### 2. Generate PDF
```bash
node generate-pdf.js report1
```
Output: `output/report1.pdf`

### 3. Use with Your Data

**Step 1:** Create your data file
```bash
# Copy template
cp data/report1-data.json data/my-report-data.json
```

**Step 2:** Edit your data
```json
{
  "laboratory": { /* your lab info */ },
  "patient": { /* patient info */ },
  "tests": [ /* test results */ ]
}
```

**Step 3:** Generate PDF
```bash
node generate-pdf.js my-report
```

---

## 📝 Data Field Reference

### Laboratory Object
| Field | Type | Required | Example |
|-------|------|----------|---------|
| name | String | Yes | "City Diagnostics" |
| address | String | Yes | "123 Main St, City" |
| phone | String | Yes | "+91-1234567890" |
| email | String | Yes | "lab@example.com" |
| registrationNumber | String | No | "LAB/REG/2024/001" |
| timing | String | No | "8:00 AM - 8:00 PM" |

### Patient Object
| Field | Type | Required | Example |
|-------|------|----------|---------|
| fullName | String | Yes | "Mr John Doe" |
| ageDisplay | String | Yes | "35 years" |
| genderDisplay | String | Yes | "Male" |
| phone | String | Yes | "1234567890" |
| referringDoctor | String | No | "Dr. Smith" |

### Test Object
| Field | Type | Required | Example |
|-------|------|----------|---------|
| testCode | String | Yes | "CBC" |
| testName | String | Yes | "Complete Blood Count" |
| category | String | Yes | "Hematology" |
| status | String | Yes | "approved" |
| fields | Array | Yes | [field/group objects] |

### Field Object (type: 'field')
| Field | Type | Required | Example |
|-------|------|----------|---------|
| type | String | Yes | "field" |
| name | String | Yes | "Hemoglobin" |
| value | String | Yes | "14.5" |
| unit | String | No | "g/dL" |
| referenceRange | String | No | "13-17" |
| isAbnormal | Boolean | No | false |
| abnormalType | String | No | "normal"/"high"/"low" |
| displayValue | String | No | HTML content |

### Group Object (type: 'group')
| Field | Type | Required | Example |
|-------|------|----------|---------|
| type | String | Yes | "group" |
| name | String | Yes | "WBC Count" |
| sub_fields | Array | Yes | [field/group objects] |

---

## 🔍 Advanced Features

### 1. Nested Groups (3+ Levels)
```json
{
  "type": "group",
  "name": "Complete Hemogram",
  "sub_fields": [
    {
      "type": "group",
      "name": "WBC Parameters",
      "sub_fields": [
        {
          "type": "group",
          "name": "Differential Count",
          "sub_fields": [
            { "type": "field", "name": "Neutrophils", ... }
          ]
        }
      ]
    }
  ]
}
```

### 2. HTML Rich Content
```json
{
  "type": "field",
  "name": "Widal Test",
  "displayValue": "<table>...</table><p>Interpretation...</p>"
}
```

### 3. Status Badges
```json
{
  "report": {
    "status": "approved",  // approved/pending
    "isUrgent": true       // shows URGENT badge
  }
}
```

---

## 🐛 Troubleshooting

### Issue: Handlebars helpers not working
**Solution:** Make sure helpers are registered in both `dev-server.js` and `generate-pdf.js`

### Issue: Background image not showing
**Solution:** Check path: `/templates/backgrounds/report-background.jpeg`

### Issue: Nested groups not rendering
**Solution:** Ensure recursive rendering with proper `{{#each}}` blocks

### Issue: Abnormal values not highlighted
**Solution:** Set `isAbnormal: true` and `abnormalType: "high"/"low"`

---

## 📚 Related Files

- **Template:** `templates/report1.html`
- **Data:** `data/report1-data.json`
- **Dev Server:** `dev-server.js`
- **PDF Generator:** `generate-pdf.js`
- **Test Guide:** `TEST_TEMPLATE_CREATION_GUIDE.md`

---

## ✅ Checklist for New Reports

- [ ] Update laboratory information
- [ ] Set patient details
- [ ] Add report metadata (numbers, dates)
- [ ] Include all test results
- [ ] Mark abnormal values correctly
- [ ] Add interpretations if needed
- [ ] Test in browser preview
- [ ] Generate final PDF
- [ ] Verify all sections render correctly

---

## 🎨 Design Principles

1. **Medical Standards**: Follows standard pathology report layout
2. **Readability**: Clear fonts, proper spacing, logical hierarchy
3. **Print-Friendly**: Optimized for A4 PDF generation
4. **Professional**: Clean design suitable for official medical reports
5. **Flexible**: Supports various test types and structures
6. **Accessible**: Clear indicators for abnormal values

---

**Created:** November 2025
**Version:** 1.0
**Template Type:** Medical Laboratory Report
