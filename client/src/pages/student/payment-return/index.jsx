import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { captureAndFinalizePaymentService, clearCartService } from "@/services";
import { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CartContext } from "@/context/cart-context";

function PaypalPaymentReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const paymentId = params.get("paymentId");
  const payerId = params.get("PayerID");
  const { fetchCart } = useContext(CartContext) || {};
  
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (paymentId && payerId) {
      async function capturePayment() {
        let orderId = sessionStorage.getItem("currentOrderId");
        
        // Handle if orderId was JSON stringified
        if (orderId) {
          try {
            const parsed = JSON.parse(orderId);
            // If it's an object with _id, extract it; otherwise use parsed value or original
            orderId = typeof parsed === 'object' && parsed !== null 
              ? (parsed._id || parsed.orderId || parsed) 
              : parsed;
          } catch {
            // If not valid JSON, use as-is (plain string)
          }
        }

        try {
          const response = await captureAndFinalizePaymentService(
            paymentId,
            payerId,
            orderId
          );

          if (response?.success) {
            sessionStorage.removeItem("currentOrderId");
            sessionStorage.removeItem("cartCheckout");
            
            // Clear the cart after successful payment
            try {
              await clearCartService();
              // Refresh cart context to update UI
              if (fetchCart) {
                await fetchCart();
              }
            } catch (e) {
              console.log("Cart already empty or error clearing:", e);
            }
            
            setStatus("success");
            
            // Redirect after 3 seconds
            setTimeout(() => {
              navigate("/student-courses");
            }, 3000);
          } else {
            setStatus("error");
            setErrorMessage(response?.message || "Payment verification failed");
          }
        } catch (error) {
          console.error("Payment capture error:", error);
          setStatus("error");
          setErrorMessage(error.message || "Failed to process payment");
        }
      }

      capturePayment();
    } else {
      setStatus("error");
      setErrorMessage("Missing payment information");
    }
  }, [payerId, paymentId, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === "processing" && (
            <>
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
              <CardTitle>Processing Payment...</CardTitle>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
            </>
          )}
        </CardHeader>
        <CardContent className="text-center">
          {status === "processing" && (
            <p className="text-gray-600">Please wait while we confirm your payment...</p>
          )}
          {status === "success" && (
            <>
              <p className="text-gray-600 mb-4">
                Thank you for your purchase! Your course has been added to your account.
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Redirecting to your courses in 3 seconds...
              </p>
              <Button onClick={() => navigate("/student-courses")}>
                Go to My Courses
              </Button>
            </>
          )}
          {status === "error" && (
            <>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => navigate("/courses")}>
                  Browse Courses
                </Button>
                <Button onClick={() => navigate("/checkout")}>
                  Try Again
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default PaypalPaymentReturnPage;
