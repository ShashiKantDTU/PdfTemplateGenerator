# Test Template Creation Guide

## 📋 Overview

This guide explains how to create test templates that work seamlessly with the hierarchical report system. Templates define the structure of test parameters and how they're displayed in forms and reports.

---

## 🏗️ Template Structure

### Basic Schema

```javascript
{
  name: String,              // Test name (e.g., "Complete Blood Count")
  code: String,              // Unique test code (e.g., "CBC")
  category: String,          // Test category (e.g., "Hematology")
  description: String,       // Test description
  fields: [                  // Array of field or group objects
    {
      type: 'field' | 'group',
      name: String,
      // ... type-specific properties
    }
  ]
}
```

---

## 🔤 Field Types

### 1. Single Field (`type: 'field'`)

A single input field for one test parameter.

```javascript
{
  type: 'field',
  name: 'Hemoglobin',
  input_details: {
    type: 'numeric',                    // 'numeric' | 'select' | 'text'
    unit: 'g/dL',                       // Unit of measurement
    reference_range: '12-16',           // Default range
    reference_range_male: '13-17',      // Male-specific range
    reference_range_female: '12-15'     // Female-specific range
  }
}
```

### 2. Group (`type: 'group'`)

A group containing multiple fields or nested groups.

```javascript
{
  type: 'group',
  name: 'Red Blood Cell Count',
  sub_fields: [                        // Nested fields (recursive)
    {
      type: 'field',
      name: 'RBC Count',
      input_details: { /* ... */ }
    },
    {
      type: 'field',
      name: 'PCV',
      input_details: { /* ... */ }
    }
  ]
}
```

---

## 🎨 Input Details

### Input Type: `numeric`

For numerical values (most common for lab tests).

```javascript
input_details: {
  type: 'numeric',
  unit: 'g/dL',                        // Display unit
  reference_range: '12-16',            // Default range (string format)
  reference_range_male: '13-17',       // Male range (optional)
  reference_range_female: '12-15',     // Female range (optional)
  
  // For calculated fields (optional)
  formula: '({RBC} * {MCV}) / 1000',   // Auto-calculation formula
  precision: 2,                         // Decimal places for calculated values
  editable: true                        // Allow manual override of calculated value
}
```

**Reference Range Formats**:
- Single value: `"5.5"`
- Range: `"12-16"`
- Multiple ranges: `"<5 or >10"`
- With units: `"12-16 g/dL"` (unit is separate, not in range)

**Formula Syntax**:
- Use field names in curly braces: `{FieldName}`
- Supported operators: `+`, `-`, `*`, `/`, `()`, `^` (power)
- Example: `"({Hemoglobin} * 100) / {RBC}"`

---

### Input Type: `select`

For dropdown/select options.

```javascript
input_details: {
  type: 'select',
  options: [                           // Array of options
    'Negative',
    'Trace',
    'Positive (+)',
    'Positive (++)',
    'Positive (+++)'
  ],
  default_value: 'Negative'            // Optional default selection
}
```

**Use Cases**:
- Qualitative results (Positive/Negative)
- Graded results (+, ++, +++)
- Microscopic findings (Few, Moderate, Plenty)

---

### Input Type: `text`

For free-text input or rich HTML content.

```javascript
input_details: {
  type: 'text',
  default_value: '<table>...</table>'  // Optional HTML template
}
```

**Use Cases**:
- Widal test tables
- Microscopic examination descriptions
- Interpretation notes
- Complex formatted results

---

## 📝 Complete Template Examples

### Example 1: Simple Flat Test (Blood Glucose)

```javascript
{
  name: 'Blood Glucose (Fasting)',
  code: 'FBS',
  category: 'Biochemistry',
  description: 'Fasting blood sugar test',
  fields: [
    {
      type: 'field',
      name: 'Glucose (F)',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '70-110'
      }
    }
  ]
}
```

---

### Example 2: Test with Groups (Complete Blood Count)

```javascript
{
  name: 'Complete Blood Count',
  code: 'CBC',
  category: 'Hematology',
  description: 'Complete blood count with differential',
  fields: [
    {
      type: 'field',
      name: 'Hemoglobin',
      input_details: {
        type: 'numeric',
        unit: 'g/dL',
        reference_range_male: '13-17',
        reference_range_female: '12-15'
      }
    },
    {
      type: 'group',
      name: 'Red Blood Cell Count',
      sub_fields: [
        {
          type: 'field',
          name: 'Total RBC Count',
          input_details: {
            type: 'numeric',
            unit: 'mill/cumm',
            reference_range_male: '4.5-5.5',
            reference_range_female: '4.0-5.0'
          }
        },
        {
          type: 'field',
          name: 'PCV',
          input_details: {
            type: 'numeric',
            unit: '%',
            reference_range_male: '40-50',
            reference_range_female: '36-46'
          }
        },
        {
          type: 'field',
          name: 'MCV',
          input_details: {
            type: 'numeric',
            unit: 'fL',
            reference_range: '83-101'
          }
        }
      ]
    },
    {
      type: 'group',
      name: 'White Blood Cell Count',
      sub_fields: [
        {
          type: 'field',
          name: 'Total WBC Count',
          input_details: {
            type: 'numeric',
            unit: '/cumm',
            reference_range: '4000-11000'
          }
        },
        {
          type: 'group',
          name: 'Differential Count',
          sub_fields: [
            {
              type: 'field',
              name: 'Neutrophils',
              input_details: {
                type: 'numeric',
                unit: '%',
                reference_range: '40-75'
              }
            },
            {
              type: 'field',
              name: 'Lymphocytes',
              input_details: {
                type: 'numeric',
                unit: '%',
                reference_range: '20-45'
              }
            },
            {
              type: 'field',
              name: 'Monocytes',
              input_details: {
                type: 'numeric',
                unit: '%',
                reference_range: '2-10'
              }
            },
            {
              type: 'field',
              name: 'Eosinophils',
              input_details: {
                type: 'numeric',
                unit: '%',
                reference_range: '1-6'
              }
            },
            {
              type: 'field',
              name: 'Basophils',
              input_details: {
                type: 'numeric',
                unit: '%',
                reference_range: '0-1'
              }
            }
          ]
        }
      ]
    },
    {
      type: 'field',
      name: 'Platelet Count',
      input_details: {
        type: 'numeric',
        unit: 'lakhs/cumm',
        reference_range: '1.5-4.5'
      }
    }
  ]
}
```

---

### Example 3: Test with Select Fields (Urine Routine)

```javascript
{
  name: 'Urine Routine Examination',
  code: 'URINE',
  category: 'Clinical Pathology',
  description: 'Complete urine analysis',
  fields: [
    {
      type: 'group',
      name: 'Physical Examination',
      sub_fields: [
        {
          type: 'field',
          name: 'Colour',
          input_details: {
            type: 'select',
            options: ['Pale Yellow', 'Yellow', 'Dark Yellow', 'Red', 'Brown'],
            default_value: 'Pale Yellow'
          }
        },
        {
          type: 'field',
          name: 'Appearance',
          input_details: {
            type: 'select',
            options: ['Clear', 'Slightly Turbid', 'Turbid', 'Cloudy'],
            default_value: 'Clear'
          }
        }
      ]
    },
    {
      type: 'group',
      name: 'Chemical Examination',
      sub_fields: [
        {
          type: 'field',
          name: 'Reaction (pH)',
          input_details: {
            type: 'numeric',
            reference_range: '5.0-7.0'
          }
        },
        {
          type: 'field',
          name: 'Specific Gravity',
          input_details: {
            type: 'numeric',
            reference_range: '1.010-1.025'
          }
        },
        {
          type: 'field',
          name: 'Albumin',
          input_details: {
            type: 'select',
            options: ['Nil', 'Trace', '+', '++', '+++', '++++'],
            default_value: 'Nil'
          }
        },
        {
          type: 'field',
          name: 'Sugar',
          input_details: {
            type: 'select',
            options: ['Nil', 'Trace', '+', '++', '+++', '++++'],
            default_value: 'Nil'
          }
        }
      ]
    },
    {
      type: 'group',
      name: 'Microscopic Examination',
      sub_fields: [
        {
          type: 'field',
          name: 'Pus Cells',
          input_details: {
            type: 'select',
            options: ['0-2', '2-4', '4-6', '6-8', 'Plenty'],
            default_value: '0-2'
          }
        },
        {
          type: 'field',
          name: 'Epithelial Cells',
          input_details: {
            type: 'select',
            options: ['Few', 'Moderate', 'Plenty'],
            default_value: 'Few'
          }
        },
        {
          type: 'field',
          name: 'RBC',
          input_details: {
            type: 'select',
            options: ['Nil', '0-2', '2-4', '4-6', 'Plenty'],
            default_value: 'Nil'
          }
        },
        {
          type: 'field',
          name: 'Crystals',
          input_details: {
            type: 'select',
            options: ['Nil', 'Few Calcium Oxalate', 'Few Uric Acid', 'Triple Phosphate'],
            default_value: 'Nil'
          }
        },
        {
          type: 'field',
          name: 'Casts',
          input_details: {
            type: 'select',
            options: ['Nil', 'Hyaline', 'Granular', 'Cellular'],
            default_value: 'Nil'
          }
        }
      ]
    }
  ]
}
```

---

### Example 4: Test with HTML/Text Field (Widal Test)

```javascript
{
  name: 'Widal Test',
  code: 'WIDAL',
  category: 'Serology',
  description: 'Typhoid antibody detection',
  fields: [
    {
      type: 'field',
      name: 'Test Results',
      input_details: {
        type: 'text',
        default_value: `
          <table border="1" style="width:100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th>Antigen</th>
                <th>1:20</th>
                <th>1:40</th>
                <th>1:80</th>
                <th>1:160</th>
                <th>1:320</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Salmonella typhi O</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>Salmonella typhi H</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>Salmonella paratyphi AH</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
              <tr>
                <td>Salmonella paratyphi BH</td>
                <td></td><td></td><td></td><td></td><td></td>
              </tr>
            </tbody>
          </table>
        `
      }
    },
    {
      type: 'field',
      name: 'Interpretation',
      input_details: {
        type: 'text'
      }
    }
  ]
}
```

---

### Example 5: Test with Calculated Fields (Lipid Profile)

```javascript
{
  name: 'Lipid Profile',
  code: 'LIPID',
  category: 'Biochemistry',
  description: 'Complete lipid panel with calculated ratios',
  fields: [
    {
      type: 'field',
      name: 'Total Cholesterol',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '<200'
      }
    },
    {
      type: 'field',
      name: 'HDL Cholesterol',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range_male: '>40',
        reference_range_female: '>50'
      }
    },
    {
      type: 'field',
      name: 'LDL Cholesterol',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '<100'
      }
    },
    {
      type: 'field',
      name: 'Triglycerides',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '<150'
      }
    },
    {
      type: 'field',
      name: 'VLDL Cholesterol',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '<30',
        formula: '{Triglycerides} / 5',
        precision: 2,
        editable: true
      }
    },
    {
      type: 'field',
      name: 'TC/HDL Ratio',
      input_details: {
        type: 'numeric',
        reference_range: '<4.5',
        formula: '{Total Cholesterol} / {HDL Cholesterol}',
        precision: 2,
        editable: false
      }
    },
    {
      type: 'field',
      name: 'LDL/HDL Ratio',
      input_details: {
        type: 'numeric',
        reference_range: '<3.0',
        formula: '{LDL Cholesterol} / {HDL Cholesterol}',
        precision: 2,
        editable: false
      }
    }
  ]
}
```

---

## 🎯 Best Practices

### 1. Naming Conventions

✅ **DO**:
- Use clear, descriptive names: `"Hemoglobin"`, `"Total WBC Count"`
- Use standard medical terminology
- Be consistent with capitalization
- Use full forms for clarity

❌ **DON'T**:
- Use abbreviations in names: `"Hb"` (use in code instead)
- Use special characters: `"WBC's"`, `"RBC(Total)"`
- Mix naming styles

### 2. Group Organization

✅ **DO**:
- Group related parameters logically
- Use nested groups for complex tests
- Keep group names descriptive
- Limit nesting to 3-4 levels maximum

**Example**:
```javascript
{
  type: 'group',
  name: 'Complete Blood Count',      // Main category
  sub_fields: [
    {
      type: 'group',
      name: 'Red Blood Cell Count',  // Sub-category
      sub_fields: [
        // Individual fields
      ]
    }
  ]
}
```

### 3. Reference Ranges

✅ **DO**:
- Always provide reference ranges
- Use gender-specific ranges when applicable
- Keep ranges as strings for flexibility
- Include age-specific ranges if needed (in description)

**Formats**:
```javascript
reference_range: '70-110'              // Range
reference_range: '<5'                  // Upper limit
reference_range: '>40'                 // Lower limit
reference_range: '<5 or >10'           // Multiple conditions
reference_range_male: '13-17'          // Gender-specific
reference_range_female: '12-15'
```

### 4. Units

✅ **DO**:
- Always specify units for numeric fields
- Use standard medical units
- Be consistent across similar tests

**Common Units**:
- Blood: `g/dL`, `mg/dL`, `mmol/L`
- Counts: `/cumm`, `mill/cumm`, `lakhs/cumm`
- Percentages: `%`
- Volume: `mL`, `L`
- Time: `seconds`, `minutes`

### 5. Select Options

✅ **DO**:
- Order options logically (severity, frequency, etc.)
- Include common variations
- Set sensible defaults (usually "Normal" or "Nil")

**Example Order** (by severity):
```javascript
options: ['Nil', 'Trace', '+', '++', '+++', '++++']
```

**Example Order** (by frequency):
```javascript
options: ['Few', 'Moderate', 'Plenty']
```

---

## 🔧 Advanced Features

### Calculated Fields

For fields that are computed from other fields:

```javascript
{
  type: 'field',
  name: 'Mean Cell Hemoglobin',
  input_details: {
    type: 'numeric',
    unit: 'pg',
    reference_range: '27-32',
    formula: '({Hemoglobin} * 10) / {Total RBC Count}',
    precision: 2,
    editable: true                   // Allow manual override if needed
  }
}
```

**Formula Rules**:
1. Field names must match exactly (case-sensitive)
2. Use curly braces: `{FieldName}`
3. Support for: `+`, `-`, `*`, `/`, `()`, `^`
4. Fields used in formula must exist in same template
5. Avoid circular references

### Deep Nesting

For complex tests with multiple hierarchy levels:

```javascript
{
  type: 'group',
  name: 'Complete Hemogram',
  sub_fields: [
    {
      type: 'group',
      name: 'Red Blood Cell Parameters',
      sub_fields: [
        {
          type: 'group',
          name: 'RBC Indices',
          sub_fields: [
            { type: 'field', name: 'MCV', input_details: {...} },
            { type: 'field', name: 'MCH', input_details: {...} },
            { type: 'field', name: 'MCHC', input_details: {...} }
          ]
        }
      ]
    }
  ]
}
```

**Nesting Limits**:
- Maximum recommended: 4 levels
- Each level should have clear purpose
- Don't nest for the sake of nesting

---

## 📋 Template Validation Checklist

Before creating/updating a template, verify:

- [ ] **Structure**
  - [ ] Valid `name`, `code`, `category`
  - [ ] `fields` array exists and not empty
  - [ ] Each field has `type: 'field'` or `type: 'group'`

- [ ] **Fields**
  - [ ] All `type: 'field'` have `input_details`
  - [ ] All `type: 'group'` have `sub_fields` array
  - [ ] No empty groups (at least 1 sub_field)

- [ ] **Input Details**
  - [ ] Valid `type: 'numeric'|'select'|'text'`
  - [ ] Numeric fields have `unit` and `reference_range`
  - [ ] Select fields have `options` array
  - [ ] Formula fields reference existing fields

- [ ] **Naming**
  - [ ] No duplicate field names at same level
  - [ ] Clear, descriptive names
  - [ ] Proper capitalization

- [ ] **Medical Accuracy**
  - [ ] Reference ranges are medically accurate
  - [ ] Units are correct
  - [ ] Gender-specific ranges where applicable

---

## 🚀 Creating Templates

### Method 1: MongoDB Shell

```javascript
db.tests.insertOne({
  name: 'Complete Blood Count',
  code: 'CBC',
  category: 'Hematology',
  description: 'Complete blood count with differential',
  fields: [
    // ... field definitions
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});
```

### Method 2: API Endpoint

```javascript
POST /api/tests
Content-Type: application/json

{
  "name": "Complete Blood Count",
  "code": "CBC",
  "category": "Hematology",
  "description": "Complete blood count with differential",
  "fields": [
    // ... field definitions
  ]
}
```

### Method 3: Seed Script

Create `seedTestTemplate.js`:

```javascript
const mongoose = require('mongoose');
const Test = require('./models/Test');

const template = {
  name: 'Complete Blood Count',
  code: 'CBC',
  category: 'Hematology',
  fields: [
    // ... field definitions
  ]
};

const seedTemplate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Test.create(template);
    console.log('Template created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

seedTemplate();
```

Run: `node seedTestTemplate.js`

---

## 🎨 Frontend Rendering

The hierarchical structure renders automatically:

### In Form (DynamicForm.jsx)
```javascript
// Field renders as input
<input type="number" name="Hemoglobin" />

// Group renders as section
<div className="group">
  <h3>Red Blood Cell Count</h3>
  <div className="sub-fields">
    {/* Recursive rendering of sub_fields */}
  </div>
</div>
```

### In Report Display
```javascript
// Field shows value with unit
Hemoglobin: 14.5 g/dL (13-17)

// Group shows as collapsible section
Red Blood Cell Count
  ├─ Total RBC Count: 4.8 mill/cumm
  ├─ PCV: 42%
  └─ MCV: 88 fL
```

### In PDF
```javascript
// Group header (bold, larger)
Red Blood Cell Count

  // Indented fields
  Total RBC Count          4.8 mill/cumm        (4.5-5.5)
  PCV                      42%                  (40-50)
  MCV                      88 fL                (83-101)
```

---

## 🔍 Common Patterns

### Pattern 1: Simple Blood Test
```javascript
{
  name: 'Blood Urea',
  code: 'UREA',
  category: 'Biochemistry',
  fields: [
    {
      type: 'field',
      name: 'Blood Urea',
      input_details: {
        type: 'numeric',
        unit: 'mg/dL',
        reference_range: '15-40'
      }
    }
  ]
}
```

### Pattern 2: Multi-Parameter Test
```javascript
{
  name: 'Liver Function Test',
  code: 'LFT',
  category: 'Biochemistry',
  fields: [
    { type: 'field', name: 'Bilirubin Total', input_details: {...} },
    { type: 'field', name: 'Bilirubin Direct', input_details: {...} },
    { type: 'field', name: 'SGOT', input_details: {...} },
    { type: 'field', name: 'SGPT', input_details: {...} },
    // ... more fields
  ]
}
```

### Pattern 3: Grouped Test
```javascript
{
  name: 'Kidney Function Test',
  code: 'KFT',
  category: 'Biochemistry',
  fields: [
    {
      type: 'group',
      name: 'Renal Parameters',
      sub_fields: [
        { type: 'field', name: 'Blood Urea', input_details: {...} },
        { type: 'field', name: 'Serum Creatinine', input_details: {...} }
      ]
    },
    {
      type: 'group',
      name: 'Electrolytes',
      sub_fields: [
        { type: 'field', name: 'Sodium', input_details: {...} },
        { type: 'field', name: 'Potassium', input_details: {...} }
      ]
    }
  ]
}
```

---

## 📚 Reference

### Complete Field Schema
```typescript
interface Field {
  type: 'field';
  name: string;
  input_details: {
    type: 'numeric' | 'select' | 'text';
    unit?: string;                      // For numeric
    reference_range?: string;           // Default range
    reference_range_male?: string;      // Male-specific
    reference_range_female?: string;    // Female-specific
    options?: string[];                 // For select
    default_value?: string;             // Default value
    formula?: string;                   // For calculated fields
    precision?: number;                 // Decimal places
    editable?: boolean;                 // Allow manual override
  };
}

interface Group {
  type: 'group';
  name: string;
  sub_fields: Array<Field | Group>;   // Recursive
}

interface TestTemplate {
  name: string;
  code: string;
  category: string;
  description?: string;
  fields: Array<Field | Group>;
}
```

---

## ✅ Summary

**Key Points**:
1. Templates use hierarchical structure with `type: 'field'` or `type: 'group'`
2. Fields have `input_details`, groups have `sub_fields`
3. Three input types: `numeric`, `select`, `text`
4. Always provide reference ranges and units for numeric fields
5. Use groups to organize related parameters
6. Formula fields auto-calculate from other fields
7. Gender-specific ranges supported
8. Structure flows seamlessly to forms, reports, and PDFs

**Resources**:
- Test.js model: `Lab_medical_reports_Backend/models/Test.js`
- Example templates: `public/cbc.json`, `public/urine_routine.json`
- DynamicForm component: `Lab_medical_reports_Frontend/src/components/forms/DynamicForm.jsx`

**Need Help?**
- Check existing templates in database
- Review `Test.js` model validation
- Test with TestBuilder.jsx page
- Verify rendering in test result entry form
