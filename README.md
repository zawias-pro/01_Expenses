# Private Expense Analyzer

A TypeScript Node.js script that analyzes CSV transaction files and generates monthly expense summaries.

## Prerequisites

- Node.js (version 16 or higher) - [Download from nodejs.org](https://nodejs.org/)
- Yarn package manager (optional, npm comes with Node.js)

## Installation

1. Install Node.js from [nodejs.org](https://nodejs.org/)

2. Install dependencies:
   ```bash
   npm install
   ```
   or if you prefer yarn:
   ```bash
   yarn install
   ```

## Usage

Run the script with a CSV file path:

```bash
npm run dev examples/1.csv
```

Or build and run:

```bash
npm run build
npm start examples/1.csv
```

## Input CSV Format

The script expects CSV files with pipe (`|`) separated values in the following format:

```
index|date|description|account|category|amount|empty1|empty2
```

Example:
```
1|2025-12-12|"JAN ADAM KOWALSKI, CZYNSZ NAJMU..."|"MojBank 1234 ... 5678";"Czynsz i wynajem";-5 000,00 PLN;;
2|2025-11-18|"ALA MAKOTA, PLATNOSC..."|"MojBank 1234 ... 5678";"Bez kategorii";-450,00 PLN;;
```

### Amount Format

- Polish number format: `1 234,56 PLN` or `-1 234,56 PLN`
- Spaces as thousand separators
- Comma as decimal separator
- Negative amounts start with `-`
- Currency suffix: `PLN`

## Output Format

The script outputs a CSV summary with the following structure:

```
Month; Total expenses; Total income; Balance
1; 1000; 5000; 4000
2; 500; 3000; 2500
3; 2500; 400; -1900
```

- **Month**: Month number (1-12)
- **Total expenses**: Sum of all negative amounts (absolute values)
- **Total income**: Sum of all positive amounts
- **Balance**: Income minus expenses

## Development

To run in development mode with auto-restart:

```bash
npm run dev examples/1.csv
```

## Example

Given the sample CSV file `examples/1.csv`, running:

```bash
npm run dev examples/1.csv
```

Will output something like:

```
Month; Total expenses; Total income; Balance
9; 350,00; 2241,61; 1891,61
10; 1500,00; 0,00; -1500,00
11; 450,00; 0,00; -450,00
12; 5000,00; 0,00; -5000,00
```
