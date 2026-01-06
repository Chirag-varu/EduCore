import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { verifyCertificateByIdService } from "@/services";
import { useToast } from "@/hooks/use-toast";
import { 
  Download, 
  Share2, 
  ArrowLeft, 
  CheckCircle,
  Award,
  Calendar,
  User,
  BookOpen,
  Shield
} from "lucide-react";

export default function CertificatePage() {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const certificateRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificate();
  }, [certificateId]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await verifyCertificateByIdService(certificateId);
      
      if (response.success) {
        setCertificate(response.data);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Failed to load certificate");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    // Create a printable version
    const printContent = certificateRef.current;
    const windowContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Certificate - ${certificate?.courseName}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              margin: 0;
              padding: 40px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              background: white;
              padding: 60px;
              max-width: 800px;
              border: 8px solid #d4af37;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
              position: relative;
            }
            .certificate::before {
              content: '';
              position: absolute;
              top: 15px;
              left: 15px;
              right: 15px;
              bottom: 15px;
              border: 2px solid #d4af37;
              pointer-events: none;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #667eea;
              margin-bottom: 10px;
            }
            .title {
              font-size: 48px;
              color: #1a1a1a;
              margin: 20px 0;
              text-transform: uppercase;
              letter-spacing: 4px;
            }
            .subtitle {
              font-size: 18px;
              color: #666;
            }
            .recipient {
              text-align: center;
              margin: 40px 0;
            }
            .recipient-name {
              font-size: 36px;
              color: #333;
              border-bottom: 2px solid #d4af37;
              display: inline-block;
              padding-bottom: 10px;
            }
            .course-info {
              text-align: center;
              margin: 30px 0;
            }
            .course-name {
              font-size: 24px;
              color: #667eea;
              font-weight: bold;
            }
            .completion-text {
              font-size: 16px;
              color: #666;
              margin: 10px 0;
            }
            .details {
              display: flex;
              justify-content: space-around;
              margin: 40px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .detail-item {
              text-align: center;
            }
            .detail-label {
              font-size: 12px;
              color: #888;
              text-transform: uppercase;
            }
            .detail-value {
              font-size: 16px;
              color: #333;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
            }
            .verify-badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #e8f5e9;
              color: #2e7d32;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
            }
            .certificate-id {
              font-size: 12px;
              color: #999;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">🎓 EduCore</div>
              <div class="title">Certificate</div>
              <div class="subtitle">of Completion</div>
            </div>
            <div class="recipient">
              <div class="completion-text">This is to certify that</div>
              <div class="recipient-name">${certificate?.userName}</div>
            </div>
            <div class="course-info">
              <div class="completion-text">has successfully completed the course</div>
              <div class="course-name">${certificate?.courseName}</div>
              <div class="completion-text">with a score of ${certificate?.score}%</div>
            </div>
            <div class="details">
              <div class="detail-item">
                <div class="detail-label">Date Issued</div>
                <div class="detail-value">${new Date(certificate?.issuedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</div>
              </div>
              <div class="detail-item">
                <div class="detail-label">Instructor</div>
                <div class="detail-value">${certificate?.instructorName || 'EduCore Instructor'}</div>
              </div>
            </div>
            <div class="footer">
              <div class="verify-badge">
                ✓ Verified Certificate
              </div>
              <div class="certificate-id">Certificate ID: ${certificate?.certificateId}</div>
            </div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(windowContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificate - ${certificate?.courseName}`,
          text: `I completed ${certificate?.courseName} on EduCore!`,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link Copied!",
        description: "Certificate link copied to clipboard"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Skeleton className="h-[600px] w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={handleDownload} className="bg-indigo-600 text-white hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Certificate Card */}
        <Card ref={certificateRef} className="overflow-hidden shadow-2xl">
          {/* Decorative border */}
          <div className="border-8 border-yellow-500/30">
            <div className="border-2 border-yellow-500 m-2">
              <CardContent className="p-8 md:p-12 text-center relative">
                {/* Corner decorations */}
                <div className="absolute top-4 left-4 w-12 h-12 border-l-4 border-t-4 border-yellow-500"></div>
                <div className="absolute top-4 right-4 w-12 h-12 border-r-4 border-t-4 border-yellow-500"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 border-l-4 border-b-4 border-yellow-500"></div>
                <div className="absolute bottom-4 right-4 w-12 h-12 border-r-4 border-b-4 border-yellow-500"></div>

                {/* Header */}
                <div className="mb-8">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    🎓 EduCore
                  </div>
                  <h1 className="text-4xl md:text-5xl font-serif text-gray-800 tracking-wider">
                    CERTIFICATE
                  </h1>
                  <p className="text-lg text-gray-500 tracking-widest">OF COMPLETION</p>
                </div>

                {/* Recipient */}
                <div className="my-8">
                  <p className="text-gray-600 mb-2">This is to certify that</p>
                  <div className="inline-block">
                    <h2 className="text-3xl md:text-4xl font-serif text-gray-800 border-b-2 border-yellow-500 pb-2 px-4">
                      {certificate?.userName}
                    </h2>
                  </div>
                </div>

                {/* Course Info */}
                <div className="my-8">
                  <p className="text-gray-600 mb-2">has successfully completed the course</p>
                  <h3 className="text-2xl md:text-3xl font-bold text-indigo-600 mb-2">
                    {certificate?.courseName}
                  </h3>
                  <p className="text-gray-600">
                    with a score of <span className="font-bold text-green-600">{certificate?.score}%</span>
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8 py-6 bg-gray-50 rounded-lg">
                  <div className="flex flex-col items-center">
                    <Calendar className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 uppercase">Issued</span>
                    <span className="text-sm font-semibold">
                      {new Date(certificate?.issuedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <User className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 uppercase">Instructor</span>
                    <span className="text-sm font-semibold">
                      {certificate?.instructorName || 'EduCore'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <BookOpen className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 uppercase">Duration</span>
                    <span className="text-sm font-semibold">
                      {certificate?.courseDuration || 'Self-paced'}
                    </span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Award className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-xs text-gray-500 uppercase">Grade</span>
                    <span className="text-sm font-semibold text-green-600">
                      {certificate?.score >= 90 ? 'Excellent' : 
                       certificate?.score >= 75 ? 'Very Good' : 
                       certificate?.score >= 60 ? 'Good' : 'Pass'}
                    </span>
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="flex flex-col items-center mt-8">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
                    <Shield className="w-5 h-5" />
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Verified Certificate</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">
                    Certificate ID: {certificate?.certificateId}
                  </p>
                </div>
              </CardContent>
            </div>
          </div>
        </Card>

        {/* Verification Info */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>This certificate can be verified at:</p>
          <p className="font-mono bg-white/20 inline-block px-3 py-1 rounded mt-1">
            {window.location.origin}/certificate/{certificate?.certificateId}
          </p>
        </div>
      </div>
    </div>
  );
}
