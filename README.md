# Restaurant Sales Dashboard

A personal React + TypeScript dashboard project, built with AI assistance, for exploring generated restaurant sales data. The sample data lives in `src/data.ts`; it does not contain real sales or personal details.

## Features

- Filter sales by the last 7, 30, or 90 days
- Filter menu items by category
- View revenue, orders, average order value, and best seller KPI cards
- Explore revenue by day and by hour with SVG charts
- Search the menu table and sort by item, category, price, units sold, or revenue

## Run locally

```bash
npm install
npm run dev
```

Build for production with:

```bash
npm run build
```

## Ideas to extend

- Add a CSV upload to replace the sample data
- Compare the selected period with the previous period
- Add tests with Vitest
