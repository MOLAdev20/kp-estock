import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./pages/Product.tsx";
import AddProduct from "./pages/AddProduct.tsx";
import EditProduct from "./pages/EditProduct.tsx";
import LoginPage from "./pages/Login.tsx";
import TransactionPage from "./pages/Transaction.tsx";
import TransactionCreatePage from "./pages/TransactionCreate.tsx";
import TransactionSummaryPage from "./pages/TransactionSummary.tsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.tsx";
import AuthRedirectListener from "./components/routes/AuthRedirectListener.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <AuthRedirectListener />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <ProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-product/:id"
          element={
            <ProtectedRoute>
              <EditProduct />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction"
          element={
            <ProtectedRoute>
              <TransactionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction/create"
          element={
            <ProtectedRoute>
              <TransactionCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transaction/:id"
          element={
            <ProtectedRoute>
              <TransactionSummaryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
