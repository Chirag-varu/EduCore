import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCertificateByIdService, verifyCertificateService } from "@/services/certificateService";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  Calendar, 
  Download, 
  Share2, 
  ArrowLeft, 
  CheckCircle2, 
  User,
  BookOpen,
  Shield
} from "lucide-react";
import useDocumentTitle from "@/hooks/use-document-title";
import html2canvas from "html2canvas";

function CertificateViewPage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const certificateRef = useRef(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useDocumentTitle(
    certificate 
      ? `Certificate - ${certificate.courseName} | EduCore` 
      : "Certificate | EduCore"
  );

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  async function fetchCertificate() {
    setLoading(true);
    setError(null);
    try {
      // Try authenticated fetch first, fallback to verification endpoint
      let response;
      try {
        response = await getCertificateByIdService(certificateId);
      } catch {
        response = await verifyCertificateService(certificateId);
      }
      
      if (response?.success) {
        setCertificate(response.data);
      } else {
        setError(response?.message || "Certificate not found");
      }
    } catch (err) {
      setError("Failed to load certificate");
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

  async function handleDownload() {
    if (!certificateRef.current) return;
    
    setDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });
      
      const link = document.createElement("a");
      link.download = `Certificate-${certificate.courseName.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to download certificate:", err);
      alert("Failed to download certificate. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  function handleShare() {
    const shareUrl = `${window.location.origin}/certificate/verify/${certificateId}`;
    if (navigator.share) {
      navigator.share({
        title: `${certificate.studentName}'s Certificate`,
        text: `Check out this course completion certificate for ${certificate.courseName}!`,
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Certificate link copied to clipboard!");
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center">
        <Card className="p-12">
          <Award className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate("/certificates")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Certificates
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/certificates")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Certificates
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button onClick={handleDownload} disabled={downloading}>
            <Download className="h-4 w-4 mr-2" />
            {downloading ? "Downloading..." : "Download"}
          </Button>
        </div>
      </div>

      {/* Certificate */}
      <div 
        ref={certificateRef}
        className="bg-white rounded-lg shadow-2xl overflow-hidden"
      >
        {/* Certificate Border Design */}
        <div className="border-[12px] border-double border-amber-600/30 m-2 rounded-lg">
          <div className="bg-gradient-to-br from-amber-50 via-white to-orange-50 p-8 md:p-12">
            
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <Award className="h-20 w-20 text-amber-600" />
                  <CheckCircle2 className="h-8 w-8 text-green-600 absolute -bottom-1 -right-1 bg-white rounded-full" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-800 mb-2">
                Certificate of Completion
              </h1>
              <p className="text-lg text-gray-600">This is to certify that</p>
            </div>

            {/* Student Name */}
            <div className="text-center mb-8">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary border-b-2 border-amber-600/50 pb-2 inline-block px-8">
                {certificate.studentName}
              </h2>
            </div>

            {/* Course Info */}
            <div className="text-center mb-8">
              <p className="text-lg text-gray-600 mb-4">
                has successfully completed the course
              </p>
              <h3 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                "{certificate.courseName}"
              </h3>
              {certificate.courseDuration && (
                <p className="text-gray-600">
                  Course Duration: {certificate.courseDuration}
                </p>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
              <div className="text-center p-4 bg-white/50 rounded-lg border border-amber-200">
                <Calendar className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                <p className="text-sm text-gray-500">Completion Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(certificate.completionDate)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg border border-amber-200">
                <User className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                <p className="text-sm text-gray-500">Instructor</p>
                <p className="font-semibold text-gray-800">
                  {certificate.instructorName}
                </p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-lg border border-amber-200">
                <Shield className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                <p className="text-sm text-gray-500">Certificate ID</p>
                <p className="font-mono text-xs text-gray-800 break-all">
                  {certificate.certificateId?.slice(0, 16)}...
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-amber-200">
              <div className="text-center md:text-left mb-4 md:mb-0">
                <BookOpen className="h-8 w-8 text-primary inline-block mr-2" />
                <span className="text-2xl font-bold text-primary">EduCore</span>
                <p className="text-sm text-gray-500 mt-1">
                  Learning Management System
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-500">Issue Date</p>
                <p className="font-semibold text-gray-800">
                  {formatDate(certificate.issueDate)}
                </p>
              </div>
            </div>

            {/* Verification Badge */}
            <div className="mt-6 text-center">
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 px-4 py-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Verified Certificate
              </Badge>
              <p className="text-xs text-gray-400 mt-2">
                Verify at: {window.location.origin}/certificate/verify/{certificate.certificateId}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateViewPage;
