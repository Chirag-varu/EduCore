import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, CreditCard, Shield, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createPaymentService } from "@/services";

export default function CheckoutPage() {
  const { cart, loading, fetchCart, clearCart } = useCart();
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (!loading && (!cart || cart.items.length === 0)) {
      navigate('/cart');
    }
  }, [cart, loading, navigate]);

  const handleBackToCart = () => {
    navigate('/cart');
  };

  const handlePayPalPayment = async () => {
    if (!auth?.user?._id || !cart?.items?.length) return;

    try {
      setProcessing(true);

      // Create a combined order for all cart items
      const paymentPayload = {
        userId: auth.user._id,
        userName: auth.user.userName,
        userEmail: auth.user.userEmail,
        orderStatus: "pending",
        paymentMethod: "paypal",
        paymentStatus: "initiated",
        orderDate: new Date(),
        paymentId: "",
        payerId: "",
        // For multiple items, we'll use the first instructor as primary
        // In a real scenario, you might want to split orders by instructor
        instructorId: cart.items[0].instructorId,
        instructorName: cart.items[0].instructorName,
        courseImage: cart.items[0].courseImage,
        courseTitle: `${cart.items.length} Course${cart.items.length > 1 ? 's' : ''}`,
        courseId: cart.items.map(item => item.courseId).join(','), // Multiple course IDs
        coursePricing: cart.totalPrice,
        cartItems: cart.items, // Send all cart items
        isCartCheckout: true // Flag to indicate this is a cart checkout
      };

      const response = await createPaymentService(paymentPayload);

      if (response.success) {
        sessionStorage.setItem(
          "currentOrderId",
          JSON.stringify(response.data.orderId)
        );
        sessionStorage.setItem(
          "cartCheckout",
          JSON.stringify(cart.items)
        );
        
        // Redirect to PayPal
        window.location.href = response.data.approveUrl;
      } else {
        throw new Error(response.message || "Payment initialization failed");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBackToCart}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Button>
          <h1 className="text-3xl font-bold">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item.courseId} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.courseImage || "/placeholder-course.jpg"}
                      alt={item.courseTitle}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.courseTitle}</h4>
                      <p className="text-gray-600 text-xs">By {item.instructorName}</p>
                      <p className="font-bold text-lg">${item.coursePrice}</p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cart.totalItems} items)</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Platform fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span>${cart.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Options */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Security badges */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-gray-600">Your payment information is encrypted and secure</p>
                  </div>
                </div>

                {/* PayPal Payment */}
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard className="h-5 w-5" />
                      <span className="font-semibold">PayPal</span>
                      <Badge variant="secondary">Recommended</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Pay securely with your PayPal account or credit card.
                    </p>
                    <Button 
                      onClick={handlePayPalPayment}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={processing}
                    >
                      {processing ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Processing...
                        </div>
                      ) : (
                        "Complete Order with PayPal"
                      )}
                    </Button>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Lifetime access to all courses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>30-day money-back guarantee</span>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t">
                  By completing your purchase, you agree to our Terms of Service and 
                  acknowledge that you have read our Privacy Policy.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}