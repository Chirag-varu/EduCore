import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { Watch } from "lucide-react";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentViewCommonHeader from "@/components/student-view/header";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();

  async function fetchStudentBoughtCourses() {
    if (auth?.user?._id) {
      try {
        console.log("Fetching courses for user:", auth.user._id);
        const response = await fetchStudentBoughtCoursesService(auth.user._id);
        console.log("Full API response:", response);
        
        // For debugging - check the courses we get from the API
        const hasCourses = 
          (Array.isArray(response.data) && response.data.length > 0) ||
          (response.data && Array.isArray(response.data.courses) && response.data.courses.length > 0);
          
        // Get courses from the correct data structure
        if (response?.success) {
          // If data is an array, use it directly
          if (Array.isArray(response.data) && response.data.length > 0) {
            console.log("Setting courses from array:", response.data);
            setStudentBoughtCoursesList(response.data);
          } 
          // If data has a courses property that's an array, use that
          else if (response.data && Array.isArray(response.data.courses) && response.data.courses.length > 0) {
            console.log("Setting courses from data.courses:", response.data.courses);
            setStudentBoughtCoursesList(response.data.courses);
          }
          // If data itself is not empty but not in expected format, wrap it in an array
          else if (response.data && typeof response.data === 'object' && Object.keys(response.data).length > 0) {
            console.log("Setting single course as array:", [response.data]);
            setStudentBoughtCoursesList([response.data]);
          } else {
            // No courses returned from API; set empty list and rely on UI to show empty state
            console.log("No courses returned from API for user", auth.user._id);
            setStudentBoughtCoursesList([]);
          }
        } else {
          console.error("Failed to fetch courses:", response?.message || "Unknown error");
          // On API failure, set an empty list so the UI shows the empty state
          setStudentBoughtCoursesList([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        // On error, set an empty list so the UI shows the empty state
        setStudentBoughtCoursesList([]);
      }
    } else {
      console.error("Cannot fetch courses - user ID is missing");
    }
  }
  
  useEffect(() => {
    if (auth?.user?._id) {
      fetchStudentBoughtCourses();
    }
  }, [auth?.user?._id]);

  return (
    <>
      <StudentViewCommonHeader />
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">My Courses</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          studentBoughtCoursesList.map((course) => {
            console.log("Rendering course:", course);
            return (
              <Card key={course._id || course.id || Math.random()} className="flex flex-col">
                <CardContent className="p-4 flex-grow">
                  <img
                    src={course?.courseImage || course?.thumbnail || "https://via.placeholder.com/300x200?text=Course+Image"}
                    alt={course?.courseTitle || course?.title || "Course"}
                    className="h-52 w-full object-cover rounded-md mb-4"
                  />
                  <h3 className="font-bold mb-1">{course?.courseTitle || course?.title || "Untitled Course"}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    {course?.instructorName || "Instructor"}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() =>
                      navigate(`/course-progress/${course?.courseId || course?._id}`)
                    }
                    className="flex-1"
                  >
                    <Watch className="mr-2 h-4 w-4" />
                    Start Watching
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-10">
            <h1 className="text-3xl font-bold mb-4">No Courses found</h1>
            <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet.</p>
            <Button onClick={() => navigate('/courses')} variant="outline" className="px-6">
              Explore Courses
            </Button>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default StudentCoursesPage;
