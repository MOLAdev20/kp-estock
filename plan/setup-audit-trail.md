# PRD / Planning Document: Setup Stock Audit Trail

**Responsibility:** Front-end (`client/`) and Back-end (`api/`)

## 1. Objectives

- To ensure that every product with adjusted stock, either deducted or added, has a stock change history.
- The adjusted product must store which product was changed, which user made the change, which supplier provided the stock if the stock increases, and notes on why the stock changed.
- Owners or managers can view the stock change history of each product by selecting which product they want to audit.

## 2. Core Instructions

### 2.1 Backend and Frontend Development

- Implement the full-stack system covering both backend services (`api/`) and frontend user interface (`client/`).

### 2.2 Frontend Requirements (`client/`)

#### Navigation & Routing

- On the Stock Management page, each product row must be clickable and navigate to that specific product stock management page.

#### Operations & Stock Adjustments

- The Product Stock page serves as the workspace to perform operations for adding and reducing product stock.
- Input fields must align with the `StockAuditTrail` Prisma migration schema.
- Stock increase and decrease operations must be executed using a modal mechanism.

#### Supplier Selection

- Display a supplier dropdown fetched from master supplier data.
- Add search within the dropdown flow to filter suppliers by company or store name.

#### History Table & Filtering

- Display a card containing the stock change history table populated from the `StockAuditTrail` table.
- Data inside the table must be filterable by monthly or yearly period, supplier, and adjustment type.

## 3. Notes for Implementation

- Execute the requirements according to the provided scope and project context.
- The document is intentionally high-level for implementation by a junior full-stack programmer or budget AI coding model.
