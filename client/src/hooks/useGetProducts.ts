import axios from "axios";
import { useEffect, useState } from "react";
import { useGetToken } from "./useGetTokens";
import { IProduct } from "../models/interfaces";

export const useGetProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const {headers}=useGetToken();
  const fetchProducts = async () => {
    try {
      const fetchProducts = await axios.get("http://localhost:3001/product",{headers});
      setProducts(fetchProducts.data.products);
    } catch (err) {
      alert("ERROR: something went wrong");
    }
  }; 

  useEffect(() => {
    fetchProducts();
  }, []); 

  return { products,fetchProducts};
};
