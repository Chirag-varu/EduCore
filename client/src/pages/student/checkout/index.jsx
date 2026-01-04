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

    // Currently, we only support single course checkout
    // For multiple courses, we need to process them one by one
    if (cart.items.length > 1) {
      toast({
        title: "Multiple Courses",
        description: "Please purchase courses one at a time. Remove extra courses from cart.",
        variant: "destructive"
      });
      return;
    }

    const courseItem = cart.items[0];
    
    // Extract courseId as string - handle various MongoDB ObjectId formats
    const extractId = (id) => {
      if (!id) return '';
      if (typeof id === 'string') return id;
      if (id.$oid) return id.$oid; // MongoDB Extended JSON format
      if (id._id) return extractId(id._id);
      if (typeof id.toString === 'function') return id.toString();
      return String(id);
    };
    
    const courseIdString = extractId(courseItem.courseId);
    const instructorIdString = extractId(courseItem.instructorId);

    console.log("Cart item:", courseItem);
    console.log("Extracted courseId:", courseIdString);

    try {
      setProcessing(true);
      const idKey = `checkout:${auth.user._id}:${courseIdString}:${Date.now()}`;

      // Create order for single course
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
        instructorId: instructorIdString,
        instructorName: courseItem.instructorName,
        courseImage: courseItem.courseImage,
        courseTitle: courseItem.courseTitle || courseItem.title,
        courseId: courseIdString,
        coursePricing: courseItem.coursePrice || courseItem.price,
      };

      console.log("Payment payload:", paymentPayload);

  const response = await createPaymentService(paymentPayload, idKey);

      if (response.success) {
        sessionStorage.setItem(
          "currentOrderId",
          String(response.data.orderId)
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