import { ReactNode, createContext, useEffect, useState } from "react";
import { useGetProducts } from "../hooks/useGetProducts";
import { IProduct } from "../models/interfaces";
import axios, { AxiosError, AxiosResponse } from "axios";
import { ProductErrors } from "../models/errors";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useGetToken } from "../hooks/useGetTokens";

export interface IShopContext {
  getCartItemCount: (itemId: string) => number;
  addToCart: (itemId: string) => void;
  updateCartItemCount: (newAmount: number, itemId: string) => void;
  getTotalCartAmount: () => number;
  removeFromCart: (itemId: string) => void;
  checkout: () => void;
  availableMoney: number;
  fetchAvailableMoney: () => void;
  purchasedItems: IProduct[];
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

export const ShopContext = createContext<IShopContext | null>(null);

export const ShopContextProvider = (props) => {
  const [cookies, setCookies] = useCookies(["access_token"]);
  const [cartItems, setCartItems] = useState<{ [key: string]: number }>({});
  const [availableMoney, setAvailableMoney] = useState<number>(0);
  const [purchasedItems, setPurchaseItems] = useState<IProduct[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    cookies.access_token !== null
  );

  const { products, fetchProducts } = useGetProducts();
  const { headers } = useGetToken();
  const navigate = useNavigate();

  const fetchAvailableMoney = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.error("No user ID found in localStorage");
      return;
    }
 
    try {
      const res = await axios.get(
        `http://localhost:3001/user/available-money/${userID}`,
        { headers }
      );
      setAvailableMoney(res.data.availableMoney);
    } catch (error) {
      console.error("Error fetching available money:", error);
    }
  };
 
  const fetchPurchasedItems = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.error("No user ID found in localStorage");
      return;
    }

    try {
      const res = await axios.get(
        `http://localhost:3001/product/purchased-items/${userID}`,
        { headers }
      );
      setPurchaseItems(res.data.purchasedItems);
    } catch (error) {
      console.error("Error fetching purchased items:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableMoney();
      fetchPurchasedItems();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.clear();
      setCookies("access_token", null);
    }
  }, [isAuthenticated]);

  const getCartItemCount = (itemId: string): number => {
    return cartItems[itemId] || 0;
  };

  const getTotalCartAmount = () => {
    if (products.length === 0) return 0;

    let totalAmount = 0;
    for (const item in cartItems) {
      const itemInfo = products.find((product) => product._id === item);
      if (itemInfo) {
        totalAmount += cartItems[item] * itemInfo.price;
      }
    }
    return Number(totalAmount.toFixed(2));
  };

  const addToCart = (itemId: string) => {
    setCartItems((prev) => ({ ...prev, [itemId]: (prev[itemId] || 0) + 1 }));
  };

  const removeFromCart = (itemId: string) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId]--;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const updateCartItemCount = (newAmount: number, itemId: string) => {
    setCartItems((prev) => ({ ...prev, [itemId]: newAmount }));
  };

  const checkout = async () => {
    const userID = localStorage.getItem("userID");
    if (!userID) {
      console.error("No user ID found in localStorage");
      return;
    }

    const body = { customerID: userID, cartItems };
    try {
      const res = await axios.post(
        "http://localhost:3001/product/checkout",
        body,
        { headers }
      );
      setPurchaseItems(res.data.purchasedItems);
      fetchAvailableMoney();
      fetchPurchasedItems();
      navigate("/");
    } catch (err) {
      let errorMessage = "Something went wrong";
      if (err.response) {
        switch (err.response.data.type) {
          case ProductErrors.NO_PRODUCT_FOUND:
            errorMessage = "No product found";
            break;
          case ProductErrors.NO_AVAILABLE_MONEY:
            errorMessage = "Not enough money";
            break;
          case ProductErrors.NOT_ENOUGH_STOCK:
            errorMessage = "Not enough stock";
            break;
        }
      }
      alert("ERROR: " + errorMessage);
    }
  };

  const contextValue: IShopContext = {
    getCartItemCount,
    addToCart,
    updateCartItemCount,
    removeFromCart,
    getTotalCartAmount,
    checkout,
    availableMoney,
    fetchAvailableMoney,
    purchasedItems,
    isAuthenticated,
    setIsAuthenticated,
  };

  return (
    <ShopContext.Provider value={contextValue}>
      {props.children}
    </ShopContext.Provider>
  );
};
 