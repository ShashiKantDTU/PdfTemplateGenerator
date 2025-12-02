# Bill Template Documentation

## Required Variables

### Laboratory Information
```javascript
{
  "billNumber": "251101002",
  "LaboratoryName": "City Health Labs",
  "LaboratoryAddress": "E-2/37, Main Road 4th Pusta Sonia vihar Delhi-110094"
}
```

### Patient Snapshot
```javascript
{
  "patientSnapshot": {
    "fullName": "Mr Sunny Poddar",
    "phone": "9354739451",
    "age": 22,
    "ageType": "years",
    "gender": "male",
    "address": "",  // Optional
    "referringDoctor": "Dr. Ramesh Kumar"
  }
}
```

### Items Array
```javascript
{
  "items": [
    {
      "name": "Complete Blood Count (CBC)",
      "category": "Hematology",
      "code": "CBC",
      "originalPrice": 300,
      "netPrice": 300
    }
  ]
}
```

### Financials Object
```javascript
{
  "financials": {
    "subtotal": 300,
    "totalDiscount": 0,        // Optional
    "urgentCharges": 0,        // Optional
    "otherChargesTotal": 0,    // Optional
    "totalPayable": 300
  }
}
```

### Payments Object
```javascript
{
  "payments": {
    "paymentStatus": "PAID",   // "PAID" or "PENDING"
    "dueAmount": 0             // Optional - shows if > 0
  }
}
```

## Minimal Example

```javascript
{
  "billNumber": "251101002",
  "LaboratoryName": "City Health Labs",
  "LaboratoryAddress": "E-2/37, Main Road, Delhi-110094",
  "patientSnapshot": {
    "fullName": "Mr Sunny Poddar",
    "phone": "9354739451",
    "age": 22,
    "ageType": "years",
    "gender": "male",
    "referringDoctor": "Dr. Ramesh Kumar"
  },
  "items": [
    {
      "name": "Complete Blood Count (CBC)",
      "category": "Hematology",
      "code": "CBC",
      "originalPrice": 300,
      "netPrice": 300
    }
  ],
  "financials": {
    "subtotal": 300,
    "totalPayable": 300
  },
  "payments": {
    "paymentStatus": "PAID",
    "dueAmount": 0
  }
}
```

## Currency Format
All amounts use Indian Rupees (₹)

## Date Format
Dates are auto-generated in DD.MM.YYYY format
