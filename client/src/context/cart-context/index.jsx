import { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth-context";
import { 
  getCartService, 
  getCartCountService, 
  addToCartService, 
  removeFromCartService, 
  clearCartService, 
  checkItemInCartService 
} from "@/services";

export const CartContext = createContext(null);

export default function CartProvider({ children }) {
  const [cart, setCart] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { auth } = useContext(AuthContext);

  // Fetch cart data
  const fetchCart = async () => {
    if (!auth?.user?._id) return;
    
    try {
      setLoading(true);
      const response = await getCartService();
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.totalItems || 0);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cart count only
  const fetchCartCount = async () => {
    if (!auth?.user?._id) return;
    
    try {
      const response = await getCartCountService();
      if (response.success) {
        setCartCount(response.data.count);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  // Add item to cart
  const addToCart = async (courseId) => {
    if (!auth?.user?._id) {
      throw new Error("Please login to add items to cart");
    }
    
    try {
      setLoading(true);
      const response = await addToCartService(courseId);
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.totalItems || 0);
        return response;
      }
      throw new Error(response.message || "Failed to add to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (courseId) => {
    if (!auth?.user?._id) return;
    
    try {
      setLoading(true);
      const response = await removeFromCartService(courseId);
      if (response.success) {
        setCart(response.data);
        setCartCount(response.data.totalItems || 0);
        return response;
      }
      throw new Error(response.message || "Failed to remove from cart");
    } catch (error) {
      console.error("Error removing from cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!auth?.user?._id) return;
    
    try {
      setLoading(true);
      const response = await clearCartService();
      if (response.success) {
        setCart(response.data);
        setCartCount(0);
        return response;
      }
      throw new Error(response.message || "Failed to clear cart");
    } catch (error) {
      console.error("Error clearing cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Check if item is in cart
  const isItemInCart = async (courseId) => {
    if (!auth?.user?._id) return false;
    
    try {
      const response = await checkItemInCartService(courseId);
      return response.success ? response.data.inCart : false;
    } catch (error) {
      console.error("Error checking item in cart:", error);
      return false;
    }
  };

  // Get cart total price
  const getCartTotal = () => {
    return cart?.totalPrice || 0;
  };

  // Get cart items count
  const getCartItemsCount = () => {
    return cart?.totalItems || 0;
  };

  // Initialize cart when user logs in
  useEffect(() => {
    if (auth?.user?._id) {
      fetchCart();
    } else {
      // Clear cart state when user logs out
      setCart(null);
      setCartCount(0);
    }
  }, [auth?.user?._id]);

  const value = {
    cart,
    cartCount,
    loading,
    fetchCart,
    fetchCartCount,
    addToCart,
    removeFromCart,
    clearCart,
    isItemInCart,
    getCartTotal,
    getCartItemsCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};