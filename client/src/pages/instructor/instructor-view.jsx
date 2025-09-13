import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "@/api/axiosInstance";

// Placeholder avatar generator
const getAvatarUrl = (name) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff&size=128`;

const InstructorView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/instructor/course/get/instructor/${id}`);
        console.log('====================================');
        console.log(res);
        console.log('====================================');
        setInstructor(res.data.instructor);
        setCourses(res.data.courses);
      } catch (err) {
        setError("Failed to load instructor data, " + err);
      } finally {
        setLoading(false);
      }
    };
    fetchInstructorData();
  }, [id]);


  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg font-semibold text-gray-600">
        Loading instructor profile...
      </div>
    );
  if (error)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg font-semibold text-red-500">
        {error}
      </div>
    );
  if (!instructor)
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-lg font-semibold text-gray-600">
        Instructor not found.
      </div>
    );


  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Instructor Profile Card */}
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-100">
        <img
          src={getAvatarUrl(instructor.userName)}
          alt={instructor.userName}
          className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-sm object-cover"
        />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{instructor.userName}</h1>
          <p className="text-gray-500 text-lg mb-2">Instructor</p>
          <p className="text-gray-600 text-base">Email: <span className="font-medium">{instructor.userEmail}</span></p>
        </div>
      </div>

      {/* Courses List */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Courses by {instructor.userName}</h2>
        {courses.length === 0 ? (
          <div className="text-gray-500 text-lg">No courses found for this instructor.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-md border border-gray-100 p-0 flex flex-col hover:shadow-xl transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/course/details/${course._id}`)}
              >
                {/* Thumbnail */}
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover rounded-t-lg"
                  />
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="text-xl font-bold text-blue-700 mb-2 truncate">{course.title}</h3>
                  <p className="text-gray-600 mb-2 line-clamp-2">{course.subtitle}</p>
                  <p className="text-gray-500 mb-3 line-clamp-3">{course.description}</p>
                  <div className="flex flex-wrap gap-2 mt-auto text-xs">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                      <span className="font-bold mr-1">Level:</span>
                      {course.level?.toUpperCase() || "LEVEL"}
                    </span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded font-semibold">
                      <span className="font-bold mr-1">Language:</span>
                      {course.primaryLanguage || course.language || "Language"}
                    </span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
                      <span className="font-bold mr-1">Price:</span>
                      {typeof course.pricing === 'number' ? (course.pricing === 0 ? "Free" : `$${course.pricing}`) : (typeof course.price === 'number' ? (course.price === 0 ? "Free" : `$${course.price}`) : "Price")}
                    </span>
                    {course.category && (
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">
                        <span className="font-bold mr-1">Category:</span>
                        {course.category}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorView;
