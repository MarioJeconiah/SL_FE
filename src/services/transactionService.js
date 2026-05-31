import api from "./api";

export const getTransactions = async (status, customer, date, page = 0, size = 10) => {
  const response = await api.get("/transactions", {
    params: {
      status,
      customer,
      date,
      page,
      size,
    },
  });
  return response.data;
};

export const getTransactionById = async (id) => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await api.post("/transactions", data);
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await api.put(`/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await api.delete(`/transactions/${id}`);
};

export const cancelTransaction = async (id) => {
  await api.patch(`/transactions/${id}/cancel`);
};