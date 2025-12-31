import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getStudentCertificatesService } from "@/services/certificateService";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Award, Calendar, Eye, Download, Share2, BookOpen } from "lucide-react";
import useDocumentTitle from "@/hooks/use-document-title";

function CertificatesPage() {
  useDocumentTitle("My Certificates | EduCore");
  const navigate = useNavigate();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    setLoading(true);
    setError(null);
    try {
      const response = await getStudentCertificatesService();
      if (response?.success) {
        setCertificates(response.data || []);
      } else {
        setError(response?.message || "Failed to load certificates");
      }
    } catch (err) {
      setError("Something went wrong while loading certificates");
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

  function handleViewCertificate(certificateId) {
    navigate(`/certificate/${certificateId}`);
  }

  function handleShareCertificate(certificateId) {
    const shareUrl = `${window.location.origin}/certificate/verify/${certificateId}`;
    if (navigator.share) {
      navigator.share({
        title: "My EduCore Certificate",
        text: "Check out my course completion certificate!",
        url: shareUrl,
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Certificate link copied to clipboard!");
    }
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Certificates</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="pt-4">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Award className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">My Certificates</h1>
        </div>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={fetchCertificates}>Try Again</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Award className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">My Certificates</h1>
      </div>

      {certificates.length === 0 ? (
        <Card className="p-12 text-center">
          <Award className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Certificates Yet</h2>
          <p className="text-muted-foreground mb-6">
            Complete courses to earn certificates. Your achievements will appear here.
          </p>
          <Button onClick={() => navigate("/student-courses")}>
            <BookOpen className="h-4 w-4 mr-2" />
            Go to My Courses
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert) => (
            <Card
              key={cert.certificateId}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-orange-500/20 border-b">
                <div className="flex items-start justify-between">
                  <Award className="h-10 w-10 text-amber-600" />
                  <Badge variant="secondary" className="bg-green-100 text-green-700">
                    Verified
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2 line-clamp-2">
                  {cert.courseName}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Issued to:</span>
                  <span>{cert.studentName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-medium">Instructor:</span>
                  <span>{cert.instructorName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Completed: {formatDate(cert.completionDate)}</span>
                </div>
                {cert.courseDuration && (
                  <div className="text-sm text-muted-foreground">
                    Duration: {cert.courseDuration}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2 pt-4 border-t">
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewCertificate(cert.certificateId)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareCertificate(cert.certificateId)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default CertificatesPage;
