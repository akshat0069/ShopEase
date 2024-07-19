import React, { useContext } from "react";
import { ShopContext } from "../../context/shopcontext";
import { CartItem } from "./cart-item";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import { useGetProducts } from "../../hooks/useGetProducts";
import { IProduct } from "../../models/interfaces";

export const CheckoutPage = () => {
  const shopContext = useContext(ShopContext);
  const { products } = useGetProducts();
  const navigate = useNavigate();

  // Ensure shopContext is not null before accessing its properties
  if (!shopContext) {
    return <div>Loading...</div>;
  }

  const { getCartItemCount, getTotalCartAmount, checkout } = shopContext;
  const totalAmount = getTotalCartAmount();

  return (
    <div className="cart">
      <div>
        <h1>Your Cart Items</h1>
      </div>
      <div className="cart">
        {products.map((product: IProduct) => {
          if (getCartItemCount(product._id) !== 0) {
            return <CartItem key={product._id} data={product} />;
          }
          return null; // To avoid returning undefined
        })}
      </div>

      {totalAmount > 0 ? (
        <div className="checkout">
          <p>Subtotal: ${totalAmount}</p>
          <button onClick={() => navigate("/")}>Continue Shopping</button>
          <button onClick={() => checkout()}>Checkout</button>
        </div>
      ) : (
        <h1>Your Shopping Cart is Empty</h1>
      )}
    </div>
  );
};
