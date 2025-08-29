import { courseCategories } from "@/config";
import banner from "/banner-img.png";
import { Button } from "@/components/ui/button";
import { useContext, useEffect } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import Studentfooter from "@/pages/student/Studentfooter";

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = { category: [getCurrentId] };
    sessionStorage.setItem("filters", JSON.stringify(currentFilter));
    navigate("/courses");
  }

  async function fetchAllStudentViewCourses() {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/course-progress/${getCurrentCourseId}`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  useEffect(() => {
    fetchAllStudentViewCourses();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="flex flex-col lg:flex-row items-center justify-between py-16 px-6 lg:px-16">
          <div className="lg:w-1/2 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight bg-gradient-to-r  bg-clip-text text-blue-600">
              Learning that gets you ahead 🚀
            </h1>
            <p className="text-lg text-gray-700">
              Skills for your present and your future. <br />
              <span className="font-semibold text-gray-900">
                Get started with us today.
              </span>
            </p>
            <Button
              className="px-6 py-3 text-lg rounded-xl shadow-md hover:scale-105 transition"
              onClick={() => navigate("/courses")}
            >
              Browse Courses
            </Button>
          </div>
          <div className="lg:w-1/2 mt-10 lg:mt-0 flex justify-center">
            <img
              src={banner}
              alt="Banner"
              className="w-full max-w-lg rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 px-6 lg:px-16 bg-gray-100 rounded-t-3xl">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">
            Explore Categories
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {courseCategories.map((categoryItem) => (
              <Button
                className="justify-center py-6 rounded-xl shadow-sm hover:shadow-lg hover:bg-blue-50 transition font-medium text-gray-800"
                variant="outline"
                key={categoryItem.id}
                onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
              >
                {categoryItem.label}
              </Button>
            ))}
          </div>
        </section>

        {/* Featured Courses */}
        <section className="py-16 px-6 lg:px-16">
          <h2 className="text-3xl font-bold mb-10 text-gray-900">
            Featured Courses ⭐
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
              studentViewCoursesList.map((courseItem) => (
                <div
                  key={courseItem?._id}
                  onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="bg-white border rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition transform hover:-translate-y-2 hover:scale-[1.02] duration-300 ease-in-out"
                >
                  <img
                    src={courseItem?.thumbnail}
                    alt={courseItem?.title}
                    className="w-full h-44 object-cover rounded-t-2xl hover:opacity-90 transition"
                  />
                  <div className="p-5">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">
                      {courseItem?.title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                      {courseItem?.subtitle}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      {courseItem?.instructorName}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="font-extrabold text-lg bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        ${courseItem?.price}
                      </p>

                      <p
                        className={`inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide shadow-sm ${
                          courseItem?.level === "beginner"
                            ? "bg-green-100 text-green-800"
                            : courseItem?.level === "intermediate"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {courseItem?.level?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex justify-center">
                <h3 className="text-gray-500 text-lg">No Courses Found</h3>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Studentfooter />
    </div>
  );
}

export default StudentHomePage;
