import api from "../api/axios";

type TransactionItemPayload = {
  product_id?: number;
  product_uuid?: string;
  unit_price: number;
  qty: number;
  total: number;
};

type CreateTransactionPayload = {
  transaction: {
    transaction_code?: string;
    discount_type?: "percent" | "nominal";
    discount_amount?: number;
    payment_method?: string;
  };
  items: TransactionItemPayload[];
};

type CreateTransactionResponse = {
  success: boolean;
  message: string;
  data: {
    transaction: {
      id: number;
      transaction_code: string;
      total_price: number | string;
      discount_type: "percent" | "nominal";
      discount_amount: number | string;
      grand_total: number | string;
      payment_method: string;
      created_at: string;
      user: {
        id: number;
        username: string;
        role: string;
      };
      transaction_items: Array<{
        id: number;
        product_id: number;
        unit_price: number | string;
        qty: number;
        total: number | string;
        product: {
          id: number;
          uuid: string;
          product_sku: string;
          product_title: string;
          unit: string;
        };
      }>;
    };
  };
};

export type TransactionListItem = {
  id: number;
  transaction_code: string;
  total_price: number | string;
  grand_total: number | string;
  payment_method: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
  transaction_items: Array<{
    id: number;
    qty: number;
    total: number | string;
  }>;
};

export type TransactionDetail = {
  id: number;
  transaction_code: string;
  total_price: number | string;
  discount_type: "percent" | "nominal";
  discount_amount: number | string;
  grand_total: number | string;
  payment_method: string;
  created_at: string;
  user: {
    id: number;
    username: string;
    role: string;
  };
  transaction_items: Array<{
    id: number;
    product_id: number;
    unit_price: number | string;
    qty: number;
    total: number | string;
    product: {
      id: number;
      uuid: string;
      product_sku: string;
      product_title: string;
      unit: string;
      selling_price: number | string;
    };
  }>;
};

const transactionServices = {
  createTransaction: async (
    payload: CreateTransactionPayload,
  ): Promise<CreateTransactionResponse> => {
    const response = await api.post("/transaction", payload);
    return response.data;
  },

  getTransactions: async (): Promise<TransactionListItem[]> => {
    const response = await api.get("/transaction");
    return response.data.data;
  },

  getTransactionById: async (id: string): Promise<TransactionDetail> => {
    const response = await api.get("/transaction/" + id);
    return response.data.data;
  },
};

export default transactionServices;
