import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";

export default function CartIcon({ showText = false, className = "" }) {
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleCartClick = () => {
    navigate('/cart');
  };

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleCartClick}
      className={`relative hover:bg-gray-100 ${className}`}
    >
      <ShoppingCart className="h-5 w-5" />
      {showText && <span className="ml-2">Cart</span>}
      {cartCount > 0 && (
        <Badge 
          variant="destructive" 
          className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
        >
          {cartCount > 99 ? '99+' : cartCount}
        </Badge>
      )}
    </Button>
  );
}