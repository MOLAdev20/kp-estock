import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProductPage from "./pages/Product.tsx";
import AddProduct from "./pages/AddProduct.tsx";
import EditProduct from "./pages/EditProduct.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProductPage />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/edit-product" element={<EditProduct />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
