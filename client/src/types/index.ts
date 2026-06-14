import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

export type Product = {
  id?: number;
  uuid: string;
  product_sku: string;
  product_title: string;
  category: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  stock: number;
  minimum_stock: number;
  rack: string;
  description: string;
  thumbnail?: string | null;
  image_url?: string | null;
  image?: string | null;
};

export type InputFieldProps = {
  label: string;
  id: string;
  type: string;
  register: UseFormRegisterReturn;
  error?: FieldError;
  unit?: string;
  currencyPrefix?: string;
};

export type SelectOptionProps = {
  label: string;
  id: string;
  register: UseFormRegisterReturn;
  options: {value: string, label: string}[];
  error?: FieldError;
}

export type AuthUser = {
  id: string | number;
  username: string;
  role: string;
};

export type LoginPayload = {
  username: string;
  password: string;
};

export type LoginResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type RefreshSessionResponse = {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
  };
};

export type StockStatus = "safe" | "low" | "critical";

export type StockManagementProduct = {
  id: number;
  uuid: string;
  productSku: string;
  productTitle: string;
  category: string;
  unit: string;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  stockStatus: StockStatus;
};

export type StockAdjustmentType = "increase" | "decrease";

export type StockAuditTrail = {
  id: number;
  action: string;
  initialStock: number;
  adjustment: number;
  finalStock: number;
  notes: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
  } | null;
  supplier: {
    id: number;
    suppliers_code: string;
    name: string;
  } | null;
};

export type StockAuditTrailFilters = {
  periodType: "monthly" | "yearly";
  month?: number;
  year: number;
  supplierId?: number | "";
  adjustmentType?: "all" | StockAdjustmentType;
};

export type StockAdjustmentPayload = {
  adjustmentType: StockAdjustmentType;
  action: string;
  adjustment: number;
  supplierId?: number | null;
  notes: string;
};

export type StockAdjustmentResult = {
  product: StockManagementProduct;
  trail: StockAuditTrail;
};

export type DashboardSummary = {
  totalProducts: number;
  todayRevenue: number;
  monthlyRevenue: number;
  lowStockProducts: number;
};

export type DashboardTopSellingProduct = {
  productId: number;
  productUuid: string;
  productTitle: string;
  totalQty: number;
  totalRevenue: number;
};

export type DashboardMonthlyRevenue = {
  month: number;
  monthLabel: string;
  totalRevenue: number;
  totalTransactions: number;
};

export type DashboardAnnualInsight = {
  year: number;
  totalRevenue: number;
  monthlyRevenueSeries: DashboardMonthlyRevenue[];
};

export type DashboardOverview = {
  summary: DashboardSummary;
  topSellingProducts: DashboardTopSellingProduct[];
  annual: DashboardAnnualInsight;
};

export type ManagedUser = {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
};

export type Supplier = {
  id: number;
  suppliers_code: string;
  name: string;
  pic: string | null;
  phone: string;
  email: string | null;
  address: string;
  moq: number;
  bankName: string | null;
  bankAccount: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SupplierPayload = {
  suppliers_code: string;
  name: string;
  pic: string;
  phone: string;
  email: string;
  address: string;
  moq: number;
  bankName: string;
  bankAccount: string;
};

export type OpnameRackProduct = {
  id: number;
  uuid: string;
  productSku: string;
  productTitle: string;
  category: string;
  unit: string;
  rack: string;
  systemStock: number;
};

export type StockOpnameItem = {
  id: number;
  productId: number;
  productSku: string | null;
  productTitle: string | null;
  unit: string | null;
  systemStock: number;
  physicalStock: number;
  variance: number;
};

export type StockOpname = {
  id: number;
  opnameCode: string;
  notes: string | null;
  createdAt: string;
  user: {
    id: number;
    username: string;
  } | null;
  totalItems?: number;
  items?: StockOpnameItem[];
};

export type CreateStockOpnamePayload = {
  rack: string;
  items: {
    product_id: number;
    physical_stock: number;
  }[];
};
