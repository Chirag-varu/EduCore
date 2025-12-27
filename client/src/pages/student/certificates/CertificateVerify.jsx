import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { verifyCertificateService } from "@/services/certificateService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  User,
  BookOpen,
  Shield,
  ExternalLink
} from "lucide-react";
import useDocumentTitle from "@/hooks/use-document-title";

function CertificateVerifyPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const [certificate, setCertificate] = useState(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useDocumentTitle("Verify Certificate | EduCore");

  useEffect(() => {
    verifyCertificate();
  }, [certificateId]);

  async function verifyCertificate() {
    setLoading(true);
    setError(null);
    try {
      const response = await verifyCertificateService(certificateId);
      if (response?.success) {
        setCertificate(response.data);
        setVerified(response.verified);
      } else {
        setError(response?.message || "Certificate not found");
        setVerified(false);
      }
    } catch (err) {
      setError("Failed to verify certificate");
      setVerified(false);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="p-8 max-w-xl w-full">
          <div className="flex flex-col items-center">
            <Skeleton className="h-16 w-16 rounded-full mb-4" />
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </Card>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="p-8 max-w-xl w-full text-center">
          <div className="flex flex-col items-center">
            <div className="rounded-full bg-red-100 p-4 mb-4">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Certificate Not Found
            </h1>
            <p className="text-gray-600 mb-6">
              {error || "The certificate you're looking for doesn't exist or has been revoked."}
            </p>
            <Button onClick={() => navigate("/")}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Visit EduCore
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <Card className="p-8 max-w-2xl w-full">
        {/* Verification Status */}
        <div className="flex flex-col items-center mb-8">
          <div className={`rounded-full p-4 mb-4 ${verified ? "bg-green-100" : "bg-yellow-100"}`}>
            {verified ? (
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            ) : (
              <XCircle className="h-12 w-12 text-yellow-600" />
            )}
          </div>
          <Badge 
            className={`text-lg px-4 py-1 ${
              verified 
                ? "bg-green-100 text-green-800 hover:bg-green-100" 
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            }`}
          >
            {verified ? "✓ Verified Certificate" : "⚠ Certificate Invalid"}
          </Badge>
        </div>

        {/* Certificate Details */}
        <div className="space-y-6">
          <div className="text-center">
            <Award className="h-10 w-10 mx-auto text-amber-600 mb-2" />
            <h2 className="text-xl font-semibold text-gray-800">
              Certificate of Completion
            </h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Issued To</p>
                <p className="font-semibold text-gray-800">{certificate.studentName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-semibold text-gray-800">{certificate.courseName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-semibold text-gray-800">{certificate.instructorName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(certificate.completionDate)}
                </p>
              </div>
            </div>

            {certificate.courseDuration && (
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Course Duration</p>
                  <p className="font-semibold text-gray-800">{certificate.courseDuration}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-mono text-sm text-gray-800 break-all">
                  {certificate.certificateId}
                </p>
              </div>
            </div>
          </div>

          {/* EduCore Branding */}
          <div className="text-center pt-4 border-t">
            <div className="flex items-center justify-center gap-2 mb-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-primary">EduCore</span>
            </div>
            <p className="text-sm text-gray-500">
              Learning Management System
            </p>
            <Button 
              variant="link" 
              className="mt-2"
              onClick={() => navigate("/")}
            >
              Visit EduCore <ExternalLink className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CertificateVerifyPage;
