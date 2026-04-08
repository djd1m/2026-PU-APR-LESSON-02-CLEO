# ADR-005: Data Input — CSV Upload (MVP), Open Banking API (v2+)

**Status:** Accepted
**Date:** 2026-04-08
**Decision Makers:** Product Owner

## Context

Cleo uses Plaid for real-time bank connection in the US. In Russia:
- Plaid is unavailable
- Open Banking API is in pilot (5 banks), mandatory adoption postponed to after 2026
- CSV export is universally available from all Russian banks
- Users can export transactions from Tinkoff, Sber, Alfa-Bank mobile apps

## Options Considered

| Option | Pros | Cons |
|--------|------|------|
| **CSV upload** | Universal, no bank partnerships needed, works immediately | Manual process, one-time snapshot |
| Manual entry | Zero integration needed | Tedious, low adoption |
| Screen scraping | Automated | Fragile, legal grey area, banks block it |
| Bank API partnerships | Real-time data | Requires business agreements, long timeline |
| Open Banking API | Standard, regulator-backed | Not mandatory until 2027+, limited adoption |
| Dzen-money integration | 3300+ banks already connected | Dependency on third party |

## Decision

**Phase 1 (MVP):** CSV upload with intelligent parser
- Support CSV formats from top-5 Russian banks (Sber, Tinkoff, Alfa, VTB, Raiffeisen)
- Auto-detect bank format, date format, encoding (UTF-8/Windows-1251)
- Categorize transactions via MCC codes + AI

**Phase 2 (2027+):** Open Banking API integration when mandatory adoption begins

## CSV Parser Requirements

```
Supported formats:
- Sberbank Online export (date;category;amount;description)
- T-Bank export (Дата операции;Категория;Сумма;Описание)
- Alfa-Bank export (date,amount,currency,description,mcc)
- Generic (date, amount, description — auto-detect delimiter)

Encoding: auto-detect UTF-8, Windows-1251, KOI8-R
Date formats: DD.MM.YYYY, YYYY-MM-DD, DD/MM/YYYY
Delimiter: auto-detect (comma, semicolon, tab)
```

## Consequences

- Need sample CSV files for testing each bank format
- AI categorization compensates for missing MCC codes
- Users must manually re-upload for fresh analysis
- Push notification: "Time to update your spending data!" (weekly reminder)
- Open Banking readiness: design data model to accept both CSV and API sources
