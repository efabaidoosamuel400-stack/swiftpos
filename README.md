# SwiftPOS – Point of Sale Management System

**Course:** BTCT 208 Web Development Frameworks  
**Institution:** Kumasi Technical Institute  
**Level:** 200  

A modern, responsive Point of Sale system built with **Angular 19 (standalone components)** and **Bootstrap 5**.

## Features

### Sale Entry View (`/sales`)
- Beautiful product grid with images, prices and live stock badges
- Low-stock visual warning (pulsing red badge when ≤ 8 units)
- Search / filter products
- Cart-style interface: add multiple items, adjust quantities, clear cart
- Complete sale → automatically deducts stock and records transaction
- Live recent transactions panel

### Admin / Reports View (`/admin`)
- Full product CRUD (Add / Edit / Delete) via Bootstrap modal + Reactive Forms
- Inventory table with cost price, selling price, stock indicators
- All recorded sales list
- **Profit Report** with date-range picker
  - Total Revenue, Total Cost, Net Profit, Sales Count
  - Interactive Chart.js bar chart of daily profit
- Business logic correctly lives in services (as required)

### Extra Polish (to stand out)
- Dark / Light mode toggle (persisted in localStorage)
- Glassmorphic navbar
- Soft shadows, rounded cards, smooth hover animations
- Modern Inter font + Bootstrap Icons
- Fully responsive

## Tech Stack
- Angular 19 (standalone components)
- Angular Router
- Reactive Forms + Template-driven where appropriate
- Bootstrap 5.3 (via CDN for reliability)
- Chart.js for reporting
- In-memory services (no backend required)

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start development server
ng serve
# or
npx ng serve

# 3. Open browser
http://localhost:4200
```

## Project Structure

```
src/app/
├── models/
│   ├── product.model.ts
│   └── sale.model.ts
├── services/
│   ├── product.service.ts   ← All product data & stock logic
│   └── sales.service.ts     ← Sales recording & profit calculation
├── components/
│   ├── sales-entry/         ← Sale Entry view
│   └── admin/               ← Admin + Reports view
├── app.component.*          ← Layout + navbar + theme toggle
├── app.routes.ts
└── app.config.ts
```

## Architecture Notes (for defense)

- **Services own the data**: Components never mutate arrays directly.
- `SalesService.recordSale()` checks stock via `ProductService.decreaseStock()`.
- Profit calculation is a pure method on `SalesService.getProfitReport()`.
- Date-range filtering and aggregation happen in the service.
- Forms use Reactive Forms for the product modal (validation included).
- Routing is simple: `/sales` and `/admin` with a redirect.

## Submission Checklist
- [x] Sale Entry works + stock updates
- [x] Product CRUD
- [x] Transaction list
- [x] Profit report with date range
- [x] Chart visualization
- [x] Responsive Bootstrap UI
- [x] Clean service-based architecture
- [x] Dark mode + modern styling

---

**Built for the 1-week assignment – ready to impress.**
