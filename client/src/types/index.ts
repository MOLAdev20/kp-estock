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
    refreshToken: string;
  };
};

export type StockStatus = "safe" | "low" | "critical";

export type StockManagementProduct = {
  uuid: string;
  productTitle: string;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  stockStatus: StockStatus;
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
