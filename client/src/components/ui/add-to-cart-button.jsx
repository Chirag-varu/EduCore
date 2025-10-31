import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Check, Minus } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { useToast } from "@/hooks/use-toast";
import { checkCoursePurchaseInfoService } from "@/services";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";

export default function AddToCartButton({ 
  course, 
  variant = "default", 
  size = "default",
  className = "",
  disabled = false
}) {
  const [inCart, setInCart] = useState(false);
  const [isOwned, setIsOwned] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart, removeFromCart, isItemInCart } = useCart();
  const { toast } = useToast();
  const { auth } = useContext(AuthContext);

  // Check if course is owned or in cart
  useEffect(() => {
    const checkStatus = async () => {
      if (!auth?.user?._id || !course?._id) return;

      try {
        // Check if user owns the course
        const purchaseResponse = await checkCoursePurchaseInfoService(
          course._id,
          auth.user._id
        );
        
        if (purchaseResponse?.success && purchaseResponse?.data) {
          setIsOwned(true);
          return;
        }

        // Check if course is in cart
        const cartStatus = await isItemInCart(course._id);
        setInCart(cartStatus);
      } catch (error) {
        console.error("Error checking course status:", error);
      }
    };

    checkStatus();
  }, [course?._id, auth?.user?._id, isItemInCart]);

  const handleAddToCart = async () => {
    if (!auth?.user) {
      toast({
        title: "Authentication Required",
        description: "Please login to add items to cart",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      await addToCart(course._id);
      setInCart(true);
      toast({
        title: "Added to Cart",
        description: `${course.title} has been added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add to cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async () => {
    try {
      setLoading(true);
      await removeFromCart(course._id);
      setInCart(false);
      toast({
        title: "Removed from Cart",
        description: `${course.title} has been removed from your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove from cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user owns the course
  if (isOwned) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={className}
        disabled
      >
        <Check className="h-4 w-4 mr-2" />
        Owned
      </Button>
    );
  }

  // Show remove button if in cart
  if (inCart) {
    return (
      <Button 
        variant="outline" 
        size={size}
        className={`${className} border-red-500 text-red-500 hover:bg-red-50`}
        onClick={handleRemoveFromCart}
        disabled={loading || disabled}
      >
        <Minus className="h-4 w-4 mr-2" />
        {loading ? "Removing..." : "Remove from Cart"}
      </Button>
    );
  }

  // Show add to cart button
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleAddToCart}
      disabled={loading || disabled}
    >
      <ShoppingCart className="h-4 w-4 mr-2" />
      {loading ? "Adding..." : "Add to Cart"}
    </Button>
  );
}