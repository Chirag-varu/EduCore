import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoPlayer from "@/components/video-player";
import StudentChatDrawer from "@/components/chat/StudentChatDrawer";
import CourseProgressBar from "@/components/student-view/CourseProgressBar";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  generateCertificateService,
} from "@/services";
import { updateLectureViewed as updateLectureViewedV2, resetCourseProgress as resetCourseProgressV2 } from "@/services/courseProgress";
import { Check, ChevronLeft, ChevronRight, Play, Award } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";
import useDocumentTitle from "@/hooks/use-document-title";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lectureQuery, setLectureQuery] = useState("");
  const [certificateId, setCertificateId] = useState(null);
  const [generatingCertificate, setGeneratingCertificate] = useState(false);
  const [showOnlyUnviewed, setShowOnlyUnviewed] = useState(false);
  const { id } = useParams();

  async function fetchCurrentCourseProgress() {
    setLoading(true);
    setError(null);
    try {
      const response = await getCurrentCourseProgressService(auth?.user?._id, id);
      if (response?.success) {
        if (!response?.data?.isPurchased) {
          setLockCourse(true);
        } else {
          setStudentCurrentCourseProgress({
            courseDetails: response?.data?.courseDetails,
            lectures:
              response?.data?.lectures ||
              response?.data?.courseDetails?.curriculum ||
              [],
            progress: response?.data?.progress,
          });

          if (response?.data?.completed) {
            setCurrentLecture(response?.data?.lectures?.[0] ?? null);
            setShowCourseCompleteDialog(true);
            setShowConfetti(true);
            // Auto-generate certificate when course is completed
            handleGenerateCertificate(response?.data?.courseDetails?._id);
          } else if ((response?.data?.progress?.length ?? 0) === 0) {
            setCurrentLecture(response?.data?.lectures?.[0] ?? null);
          } else {
            const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
              (acc, obj, index) => {
                return acc === -1 && obj.viewed ? index : acc;
              },
              -1
            );

            const fallbackLectures = response?.data?.lectures || response?.data?.courseDetails?.curriculum || [];
            setCurrentLecture(
              fallbackLectures[lastIndexOfViewedAsTrue + 1] ?? fallbackLectures[0] ?? null
            );
          }
        }
      } else {
        setError(response?.message || "Failed to load course progress.");
      }
    } catch (e) {
      setError("Something went wrong while loading course progress.");
    } finally {
      setLoading(false);
    }
  }

  async function updateCourseProgress() {
    if (currentLecture) {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        currentLecture._id
      );

      if (response?.success) {
        fetchCurrentCourseProgress();
      }
    }
  }

  // Generate certificate when course is completed
  async function handleGenerateCertificate(courseId) {
    const targetCourseId = courseId || studentCurrentCourseProgress?.courseDetails?._id;
    if (!targetCourseId) return;
    
    setGeneratingCertificate(true);
    try {
      const response = await generateCertificateService(targetCourseId);
      if (response?.success && response?.data?.certificateId) {
        setCertificateId(response.data.certificateId);
      }
    } catch (err) {
      console.error("Failed to generate certificate:", err);
    } finally {
      setGeneratingCertificate(false);
    }
  }

  // Navigate to view the certificate
  function handleViewCertificate() {
    if (certificateId) {
      navigate(`/certificate/${certificateId}`);
    } else {
      // Fallback: go to certificates list page
      navigate("/certificates");
    }
  }

  async function handleRewatchCourse() {
    // Prefer new authenticated reset; fall back to legacy if needed
    let ok = false;
    try {
      const resV2 = await resetCourseProgressV2(
        studentCurrentCourseProgress?.courseDetails?._id
      );
      ok = !!resV2?.success;
    } catch (e) {
      ok = false;
    }
    if (!ok) {
      const response = await resetCourseProgressService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );
      ok = !!response?.success;
    }

      if (ok) {
        setCurrentLecture(null);
        setShowConfetti(false);
        setShowCourseCompleteDialog(false);
        fetchCurrentCourseProgress();
    }
  }
  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id]);

  useEffect(() => {
    if (currentLecture?.progressValue === 1) updateCourseProgress();
  }, [currentLecture]);

  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);

  // Derived stats for header summary
  const totalLectures = studentCurrentCourseProgress?.lectures?.length || 0;
  const viewedCount = (studentCurrentCourseProgress?.progress || []).filter(p => p.viewed).length;
  const completionPct = totalLectures > 0 ? Math.round((viewedCount / totalLectures) * 100) : 0;

  // Filtered lectures by query / viewed state
  const filteredLectures = (studentCurrentCourseProgress?.lectures || []).filter((lec) => {
    const viewed = !!(studentCurrentCourseProgress?.progress || []).find((p) => p.lectureId === lec._id && p.viewed);
    const matchesQuery = lectureQuery.trim().length === 0 || (lec?.lectureTitle || "").toLowerCase().includes(lectureQuery.trim().toLowerCase());
    const matchesViewed = showOnlyUnviewed ? !viewed : true;
    return matchesQuery && matchesViewed;
  });

  // Dynamic page title when course name is known
  useDocumentTitle(
    studentCurrentCourseProgress?.courseDetails?.title
      ? `${studentCurrentCourseProgress.courseDetails.title} — Progress`
      : undefined,
    { suffix: " — EduCore" }
  );

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      <div className="flex items-center justify-between p-2 bg-[#1c1d1f] border-b border-gray-700 m-1">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-black"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Courses Page
          </Button>
          <div className="flex flex-col">
            {loading ? (
              <>
                <Skeleton className="h-5 w-64 mb-2 hidden md:block" />
                <Skeleton className="h-4 w-80 hidden md:block" />
                <Skeleton className="h-6 w-80 mt-2 hidden md:block" />
              </>
            ) : (
              <>
                <h1 className="text-lg font-bold hidden md:block">
                  {studentCurrentCourseProgress?.courseDetails?.title}
                </h1>
                <p className="text-sm font-semibold hidden md:block">
                  {studentCurrentCourseProgress?.courseDetails?.subtitle}
                </p>
                {/* Overall course progress bar */}
                {Array.isArray(studentCurrentCourseProgress?.lectures) && (
                  <div className="mt-2 w-80 hidden md:block">
                    <CourseProgressBar percentage={completionPct} />
                  </div>
                )}
              </>
            )}
          </div>
          
          {auth?.authenticate && studentCurrentCourseProgress?.courseDetails?.instructorId && (
            <StudentChatDrawer
              courseId={studentCurrentCourseProgress?.courseDetails?._id}
              instructorId={studentCurrentCourseProgress?.courseDetails?.instructorId}
            />
          )}
        </div>
        <div className="flex items-center gap-3">
          {!loading && totalLectures > 0 && (
            <div className="hidden md:flex items-center gap-2">
              <Badge variant="secondary" className="bg-gray-800 text-gray-100">{completionPct}%</Badge>
              <span className="text-sm text-gray-300">{viewedCount}/{totalLectures} lectures completed</span>
              <Separator orientation="vertical" className="h-5 bg-gray-700" />
              <Button
                variant="outline"
                size="sm"
                className="text-black"
                onClick={handleRewatchCourse}
                disabled={loading || totalLectures === 0}
                aria-label="Reset course progress"
              >
                Reset progress
              </Button>
            </div>
          )}
          <Button onClick={() => setIsSideBarOpen(!isSideBarOpen)} aria-label={isSideBarOpen ? "Hide sidebar" : "Show sidebar"}>
            {isSideBarOpen ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 bg-red-900/40 text-red-300 border-b border-red-800">
          {error}
        </div>
      )}
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "mr-[400px]" : ""
          } transition-all duration-300`}
        >
          {loading ? (
            <div className="p-6">
              <Skeleton className="w-full h-[500px]" />
            </div>
          ) : currentLecture ? (
            <VideoPlayer
              width="100%"
              height="500px"
              url={currentLecture?.videoUrl}
              onProgressUpdate={setCurrentLecture}
              progressData={currentLecture}
              courseId={studentCurrentCourseProgress?.courseDetails?._id}
              allowDownload={studentCurrentCourseProgress?.courseDetails?.isPurchased}
            />
          ) : (
            <div className="h-[500px] flex items-center justify-center text-gray-300">
              No lecture selected.
            </div>
          )}
          <div className="p-6 bg-[#1c1d1f]">
            {loading ? (
              <Skeleton className="h-7 w-96" />
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2 truncate">
                    {currentLecture?.lectureTitle || "Untitled lecture"}
                  </h2>
                  {currentLecture?.duration ? (
                    <p className="text-xs text-gray-400">Duration: {Math.round(currentLecture.duration)} min</p>
                  ) : null}
                </div>
                {totalLectures > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-black"
                      onClick={() => {
                        const all = studentCurrentCourseProgress?.lectures || [];
                        const idx = all.findIndex(l => l._id === currentLecture?._id);
                        if (idx > 0) setCurrentLecture(all[idx - 1]);
                      }}
                      aria-label="Previous lecture"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-black"
                      onClick={() => {
                        const all = studentCurrentCourseProgress?.lectures || [];
                        const idx = all.findIndex(l => l._id === currentLecture?._id);
                        if (idx < all.length - 1) setCurrentLecture(all[idx + 1]);
                      }}
                      aria-label="Next lecture"
                    >
                      Next <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        // jump to next unviewed
                        const all = studentCurrentCourseProgress?.lectures || [];
                        const progress = studentCurrentCourseProgress?.progress || [];
                        const next = all.find(l => !progress.find(p => p.lectureId === l._id && p.viewed));
                        if (next) setCurrentLecture(next);
                      }}
                      aria-label="Jump to next unviewed lecture"
                    >
                      Next Unviewed
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div
          className={`fixed top-[64px] mt-12 right-0 bottom-0 w-[400px] bg-[#1c1d1f] border-l border-gray-700 transition-all duration-300 ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="grid bg-[#1c1d1f] w-full grid-cols-2 p-0 h-14">
              <TabsTrigger
                value="content"
                className=" text-black rounded-none h-full"
              >
                Course Content
              </TabsTrigger>
              <TabsTrigger
                value="overview"
                className=" text-black rounded-none h-full"
              >
                Overview
              </TabsTrigger>
            </TabsList>
            <TabsContent value="content">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-bold">Lectures</h2>
                  {/* Filters */}
                  <div className="flex items-center gap-3">
                    <Input
                      placeholder="Search lectures"
                      value={lectureQuery}
                      onChange={(e) => setLectureQuery(e.target.value)}
                      className="bg-[#111214] border-gray-700 text-white placeholder:text-gray-500"
                      aria-label="Search lectures"
                    />
                    <div className="flex items-center gap-2">
                      <Switch
                        id="unviewed-switch"
                        checked={showOnlyUnviewed}
                        onCheckedChange={setShowOnlyUnviewed}
                        aria-label="Show only unviewed"
                      />
                      <Label htmlFor="unviewed-switch">Only unviewed</Label>
                    </div>
                  </div>

                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : filteredLectures.length === 0 ? (
                    <div className="text-sm text-gray-400 py-6">
                      {lectureQuery || showOnlyUnviewed
                        ? "No lectures match your filters."
                        : "No lectures available for this course yet."}
                    </div>
                  ) : (
                  filteredLectures.map((item) => {
                      const viewed = !!studentCurrentCourseProgress?.progress?.find(
                        (progressItem) => progressItem.lectureId === item._id && progressItem.viewed
                      );
                      return (
                        <div
                          className="flex items-center justify-between bg-gray-800/40 text-sm text-white font-bold gap-3 cursor-pointer hover:bg-gray-800/40 rounded p-2"
                          key={item._id}
                        >
                          <button
                            className="flex items-center bg-gray-800/40 gap-2 flex-1 text-left"
                            onClick={() => setCurrentLecture(item)}
                            aria-label={`Play ${item?.lectureTitle}`}
                          >
                            {viewed ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <Play className="h-4 w-4 " />
                            )}
                            <span className="truncate">{item?.lectureTitle}</span>
                            {typeof item?.duration === "number" && (
                              <span className="ml-auto text-xs font-normal text-black">
                                {Math.round(item.duration)}m
                              </span>
                            )}
                          </button>
                          <button
                            className={`text-xs px-2 py-1 bg-gray-800/40 rounded border ${viewed ? "border-green-500 text-green-400" : "border-gray-500 text-gray-300"}`}
                            onClick={async () => {
                              const nextViewed = !viewed;
                              try {
                                const res = await updateLectureViewedV2(
                                  studentCurrentCourseProgress?.courseDetails?._id,
                                  item._id,
                                  nextViewed
                                );
                                if (res?.success) {
                                  // sync local progress from server response
                                  setStudentCurrentCourseProgress((prev) => ({
                                    ...prev,
                                    progress: res.data.lecturesProgress || [],
                                  }));

                                  // If completed, celebrate
                                  if (res.data?.completed) {
                                    setShowCourseCompleteDialog(true);
                                    setShowConfetti(true);
                                  }
                                }
                              } catch (e) {
                                console.error("Failed to toggle viewed state", e);
                              }
                            }}
                          >
                            {viewed ? "Viewed" : "Mark as Viewed"}
                          </button>
                        </div>
                      );
                  }))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="overview" className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-bold">About this course</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.description}
                  </p>

                  <h2 className="text-xl font-bold">Objective</h2>
                  <p className="text-gray-400">
                    {studentCurrentCourseProgress?.courseDetails?.objectives}
                  </p>

                  <h2 className="text-xl font-bold">Instructor</h2>
                  <p className="text-gray-400">
                    {
                      studentCurrentCourseProgress?.courseDetails
                        ?.instructorName
                    }
                  </p>

                  <h2 className="text-xl font-bold">Course Details</h2>
                  <ul className="text-gray-400 space-y-1 list-disc pl-6">
                    {/* <li>
                      <span className="font-semibold">Subtitle:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.subtitle}
                    </li> */}
                    <li>
                      <span className="font-semibold">Category:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.category}
                    </li>
                    <li>
                      <span className="font-semibold">Language:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.language}
                    </li>
                    <li>
                      <span className="font-semibold">Level:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.level}
                    </li>
                    {/* <li>
                      <span className="font-semibold">Price:</span> ₹
                      {studentCurrentCourseProgress?.courseDetails?.price}
                    </li> */}
                    <li>
                      <span className="font-semibold">Certificate:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.certificate
                        ? "Yes"
                        : "No"}
                    </li>
                    <li>
                      <span className="font-semibold">Lifetime Access:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.lifetime
                        ? "Yes"
                        : "No"}
                    </li>
                    {/* <li>
                      <span className="font-semibold">Free Preview:</span>{" "}
                      {studentCurrentCourseProgress?.courseDetails?.freePreview
                        ? "Yes"
                        : "No"}
                    </li> */}
                    <li>
                      <span className="font-semibold">Course Created At:</span>{" "}
                      {new Date(
                        studentCurrentCourseProgress?.courseDetails?.createdAt
                      ).toLocaleDateString()}
                    </li>
                  </ul>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Dialog open={lockCourse}>
        <DialogContent className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>You can't view this page</DialogTitle>
            <DialogDescription className="flex flex-col gap-3">
              <span>Please purchase this course to get access</span>
              <Button
                onClick={() => navigate("/student-courses")}
                className="self-start"
              >
                <ChevronLeft className="h-3 w-3" />
                Back to My Courses
              </Button>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Dialog open={showCourseCompleteDialog}>
        <DialogContent showOverlay={false} className="sm:w-[425px]">
          <DialogHeader>
            <DialogTitle>🎉 Congratulations!</DialogTitle>
            <DialogDescription className="flex flex-col gap-4">
              <Label className="text-base">You have completed the course!</Label>
              <p className="text-sm text-muted-foreground">
                {generatingCertificate 
                  ? "Generating your certificate..." 
                  : "Your certificate is ready to view and download."}
              </p>
              <div className="flex flex-row gap-3 flex-wrap">
                <Button 
                  onClick={handleViewCertificate}
                  className="bg-amber-600 hover:bg-amber-700"
                  disabled={generatingCertificate}
                >
                  <Award className="h-4 w-4 mr-2" />
                  {generatingCertificate ? "Generating..." : "View Certificate"}
                </Button>
                <Button variant="outline" onClick={() => navigate("/student-courses")}>
                  My Courses
                </Button>
                <Button variant="outline" onClick={handleRewatchCourse}>
                  Rewatch
                </Button>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseProgressPage;
