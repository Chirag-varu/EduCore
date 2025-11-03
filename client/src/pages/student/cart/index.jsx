import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CartPage() {
  const { cart, loading, removeFromCart, clearCart, fetchCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemoveItem = async (courseId, courseTitle) => {
    try {
      setRemoving(prev => ({ ...prev, [courseId]: true }));
      await removeFromCart(courseId);
      toast({
        title: "Item Removed",
        description: `${courseTitle} has been removed from your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    } finally {
      setRemoving(prev => ({ ...prev, [courseId]: false }));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
      });
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <ShoppingBag className="h-24 w-24 mx-auto text-gray-400 mb-6" />
          <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any courses to your cart yet.
          </p>
          <Button onClick={handleContinueShopping} size="lg">
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button 
            variant="outline" 
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cart.items.map((item) => {
                // courseId may be populated as an object (due to Mongoose populate)
                // Normalize to the actual id string for keys and API calls
                const normalizedCourseId =
                  typeof item.courseId === "object" && item.courseId !== null
                    ? item.courseId._id || item.courseId.id || item.courseId.toString?.() || ""
                    : item.courseId;

                return (
                <Card key={normalizedCourseId} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Course Image */}
                      <div className="md:w-48 h-32 md:h-auto">
                        <img
                          src={item.courseImage || "/placeholder-course.jpg"}
                          alt={item.courseTitle}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Course Details */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">
                              {item.courseTitle}
                            </h3>
                            <p className="text-gray-600 mb-2">
                              By {item.instructorName}
                            </p>
                            <div className="flex items-center gap-2 mb-4">
                              <Badge variant="secondary">
                                Added {new Date(item.addedAt).toLocaleDateString()}
                              </Badge>
                            </div>
                          </div>

                          {/* Price and Actions */}
                          <div className="flex flex-col items-end gap-2 ml-4">
                            <div className="text-2xl font-bold">
                              ${item.coursePrice}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveItem(normalizedCourseId, item.courseTitle)}
                              disabled={removing[normalizedCourseId]}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              {removing[normalizedCourseId] ? "Removing..." : "Remove"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );})}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Items ({cart.totalItems})</span>
                  <span>${cart.totalPrice.toFixed(2)}</span>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout} 
                  size="lg" 
                  className="w-full"
                  disabled={cart.items.length === 0}
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>

                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                  onClick={handleContinueShopping}
                >
                  Continue browsing courses
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}