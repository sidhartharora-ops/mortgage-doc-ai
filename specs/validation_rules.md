# Validation Rules

## Rule Types

### Required Fields
Ensures specified fields are present in extraction output.
```yaml
type: required
fields: [field1, field2]
```

### Comparison
Compares two numeric fields.
```yaml
type: comparison
left: field_a
right: field_b
operator: gte  # field_a >= field_b
```

### Range
Validates a field falls within expected bounds.
```yaml
type: range
field: field_name
min: 0
max: 5000000
```

## Rules by Document Type

### T4
- Box 14 (income) must be >= Box 22 (tax deducted)
- Income must be in range [0, 5,000,000]
- Required: box14, box22, tax_year, employee_name

### NOA
- Total income >= Net income >= Taxable income
- Total income >= Total tax payable
- Required: total_income, net_income, taxable_income, tax_year

### Paystub
- Gross pay >= Net pay
- Gross pay in range [0, 500,000]
- Required: gross_pay, net_pay, employer_name, employee_name

### Bank Statement
- Closing balance in range [-100,000, 50,000,000]
- Required: account_holder, statement_period, closing_balance

### Employment Letter
- Annual salary must be in range [0, 5,000,000]
- Required: employee_name, employer_name, job_title, start_date, annual_salary
