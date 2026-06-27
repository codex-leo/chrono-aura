import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import { useEffect, useState } from "react";
import axios from "axios";
import Login from "./pages/Login";

const App = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/product/sample/products")
      .then((res) => {
        setProducts(res.data.sampleProduct);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home products={products} />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
};

export default App;
