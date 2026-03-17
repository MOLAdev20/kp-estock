import { BrowserRouter, Route, Routes } from "react-router-dom";
import Product from "./pages/Product.tsx";
import AddProduct from "./pages/AddProduct.tsx";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Product />} />
        <Route path="/add-product" element={<AddProduct />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
