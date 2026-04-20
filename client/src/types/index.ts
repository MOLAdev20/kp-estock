import type { UseFormRegisterReturn, FieldError } from "react-hook-form";

export type Product = {
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