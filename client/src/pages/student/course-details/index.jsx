import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import StudentChatDrawer from "@/components/chat/StudentChatDrawer";
import {
  checkCoursePurchaseInfoService,
  createPaymentService,
  fetchStudentViewCourseDetailsService,
} from "@/services";
import { CheckCircle, Globe, Lock, PlayCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CommentsSection from "@/components/comments/CommentsSection";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
    lectures,
    setLectures,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl, setApprovalUrl] = useState("");
  const [isEnrolled, setIsEnrolled] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  async function fetchStudentViewCourseDetails() {
    // const checkCoursePurchaseInfoResponse =
    //   await checkCoursePurchaseInfoService(
    //     currentCourseDetailsId,
    //     auth?.user._id
    //   );

    // if (
    //   checkCoursePurchaseInfoResponse?.success &&
    //   checkCoursePurchaseInfoResponse?.data
    // ) {
    //   navigate(`/course-progress/${currentCourseDetailsId}`);
    //   return;
    // }

    const response = await fetchStudentViewCourseDetailsService(
      currentCourseDetailsId
    );

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLectures(response?.lectures);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLectures(null);
      setLoadingState(false);
    }
  }

  function handleSetFreePreview(getCurrentVideoInfo) {
    console.log(getCurrentVideoInfo);
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  async function handleCreatePayment() {
    const paymentPayload = {
      userId: auth?.user?._id,
      userName: auth?.user?.userName,
      userEmail: auth?.user?.userEmail,
      orderStatus: "pending",
      paymentMethod: "paypal",
      paymentStatus: "initiated",
      orderDate: new Date(),
      paymentId: "",
      payerId: "",
      instructorId: studentViewCourseDetails?.instructorId,
      instructorName: studentViewCourseDetails?.instructorName,
      courseImage: studentViewCourseDetails?.thumbnail,
      courseTitle: studentViewCourseDetails?.title,
      courseId: studentViewCourseDetails?._id,
      coursePricing: studentViewCourseDetails?.price,
    };

    console.log(paymentPayload, "paymentPayload");
    const response = await createPaymentService(paymentPayload);

    if (response.success) {
      sessionStorage.setItem(
        "currentOrderId",
        JSON.stringify(response?.data?.orderId)
      );
      setApprovalUrl(response?.data?.approveUrl);
    }
  }

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (currentCourseDetailsId !== null) fetchStudentViewCourseDetails();
  }, [currentCourseDetailsId]);

  useEffect(() => {
    if (id) setCurrentCourseDetailsId(id);
  }, [id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details"))
      setStudentViewCourseDetails(null),
        setLectures(null),
        setCurrentCourseDetailsId(null);
  }, [location.pathname]);
  
  // Check if user is already enrolled in this course
  async function checkEnrollmentStatus() {
    if (auth?.user?._id && studentViewCourseDetails?._id) {
      const response = await checkCoursePurchaseInfoService(
        studentViewCourseDetails._id, 
        auth.user._id
      );
      
      if (response?.success) {
        setIsEnrolled(response.data);
      }
    }
  }
  
  // Handle course access (buy or continue)
  function handleCourseAction() {
    if (isEnrolled) {
      // If enrolled, navigate to course progress
      navigate(`/course-progress/${studentViewCourseDetails._id}`);
    } else {
      // If not enrolled, initiate payment
      handleCreatePayment();
    }
  }
  
  // Check enrollment status when course details load
  useEffect(() => {
    if (studentViewCourseDetails?._id && auth?.user?._id) {
      checkEnrollmentStatus();
    }
  }, [studentViewCourseDetails, auth?.user]);

  if (loadingState) return <Skeleton />;

  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className=" mx-auto p-4">
      <div className="bg-gray-900 text-white p-8 rounded-t-lg">
        <h1 className="text-3xl font-bold mb-4">
          {studentViewCourseDetails?.title}
        </h1>
        <p className="text-xl mb-4">{studentViewCourseDetails?.subtitle}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm">
          <span>Created By {studentViewCourseDetails?.instructorName}</span>
          <span>Created On {studentViewCourseDetails?.date.split("T")[0]}</span>
          <span className="flex items-center">
            <Globe className="mr-1 h-4 w-4" />
            {studentViewCourseDetails?.primaryLanguage}
          </span>
          <span>
            {studentViewCourseDetails?.enrolledStudents.length}{" "}
            {studentViewCourseDetails?.enrolledStudents.length <= 1
              ? "Student"
              : "Students"}
          </span>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 mt-8">
        <main className="flex-grow">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What you'll learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {studentViewCourseDetails?.objectives
                  .split(",")
                  .map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="mr-2 h-5 w-5 text-green-500 flex-shrink-0" />
                      <span>{objective}</span>
                    </li>
                  ))}
              </ul>
            </CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Description</CardTitle>
            </CardHeader>
            <CardContent>{studentViewCourseDetails?.description}</CardContent>
          </Card>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent>
              {lectures?.map((curriculumItem, index) => (
                <li
                  key={index}
                  className={`${
                    index === 0 ? "cursor-pointer" : "cursor-default"
                  } flex items-center mb-4`}
                  onClick={
                    index === 0
                      ? () => handleSetFreePreview(curriculumItem)
                      : null
                  }
                >
                  {index === 0 ? (
                    <PlayCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  <span>{curriculumItem?.lectureTitle}</span>
                </li>
              ))}
            </CardContent>
          </Card>
        </main>
        <aside className="w-full md:w-[500px]">
          <Card className="sticky top-4">
            <CardContent className="p-6">
              <div className="aspect-video mb-4 rounded-lg flex items-center justify-center">
                <VideoPlayer
                  url={lectures?.length > 0 ? lectures[0].videoUrl : ""}
                  width="450px"
                  height="200px"
                />
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold">
                  ${studentViewCourseDetails?.price}
                </span>
              </div>
              <Button onClick={handleCourseAction} className="w-full">
                {isEnrolled ? "Continue Learning" : "Buy Now"}
              </Button>
              
              {auth?.authenticate && studentViewCourseDetails?.instructorId && (
                <div className="mt-4 flex justify-center">
                  <StudentChatDrawer
                    courseId={studentViewCourseDetails?._id}
                    instructorId={studentViewCourseDetails?.instructorId}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
      
      {/* Course Reviews Section */}
      <div className="mt-12 container mx-auto">
        <CommentsSection courseId={id} />
      </div>
      
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="max-w-[900px] p-6">
          {/* Header with title + close button aligned */}
          <div className="flex items-center justify-between mb-4">
            <DialogTitle className="text-2xl font-bold">
              Course Preview
            </DialogTitle>
            <DialogClose asChild>
              <button
                className="rounded-full p-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </DialogClose>
          </div>

          {/* Video preview */}
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg mb-4 bg-black">
            <VideoPlayer
              url={lectures?.[0]?.videoUrl}
              width="100%"
              height="100%"
            />
          </div>

          {/* Lecture info */}
          <div className="text-center space-y-1 mb-6">
            <p className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              {lectures?.[0]?.lectureTitle}
            </p>
            <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              Preview Video
            </span>
          </div>

          {/* Footer button */}
          <DialogFooter className="sm:justify-center">
            <DialogClose asChild>
              <Button
                type="button"
                variant="secondary"
                className="px-6 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;
