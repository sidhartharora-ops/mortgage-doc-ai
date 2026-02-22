# Supported Document Types

## T4 — Statement of Remuneration Paid
Key fields:
- `box14_employment_income` — Total employment income
- `box22_income_tax_deducted` — Income tax deducted
- `box26_cpp_contributions` — CPP/QPP contributions
- `box18_ei_premiums` — EI premiums
- `employer_name` — Name of employer
- `tax_year` — Tax year
- `employee_name` — Employee full name
- `sin_last3` — Last 3 digits of SIN

## NOA — Notice of Assessment
Key fields:
- `total_income` — Line 15000 total income
- `net_income` — Line 23600 net income
- `taxable_income` — Line 26000 taxable income
- `total_tax_payable` — Total federal + provincial tax
- `tax_year` — Assessment year
- `taxpayer_name` — Taxpayer full name

## Paystub
Key fields:
- `gross_pay` — Gross pay for period
- `net_pay` — Net pay for period
- `pay_period` — Pay period dates
- `employer_name` — Employer name
- `employee_name` — Employee name
- `ytd_gross` — Year-to-date gross
- `federal_tax` — Federal tax deducted
- `cpp_deduction` — CPP deduction
- `ei_deduction` — EI deduction

## Bank Statement
Key fields:
- `account_holder` — Account holder name
- `account_number_last4` — Last 4 of account number
- `statement_period` — Statement date range
- `opening_balance` — Opening balance
- `closing_balance` — Closing balance
- `total_deposits` — Total deposits
- `total_withdrawals` — Total withdrawals
- `institution_name` — Financial institution

## Employment Letter
Key fields:
- `employee_name` — Employee full name
- `employer_name` — Name of employer
- `job_title` — Job title / position
- `department` — Department name
- `employment_type` — Employment classification (e.g., Full-Time, Permanent)
- `start_date` — Employment start date
- `annual_salary` — Annual base salary
- `annual_bonus` — Annual bonus (if applicable)
- `total_compensation` — Total annual compensation
- `work_location` — Work location / city
