import { useDispatch } from "react-redux";
import CourseCard from "../../components/Common/CourseCard";
import type { Course } from "../../types";
import { useQuery } from "@tanstack/react-query";
import { getAllCourses } from "../../api/courseApi";
import { Link } from "react-router-dom";
import SearchComponent from "../../components/Search/SearchComponet";

const GetAllCoursesPage = () => {
  const dispatch = useDispatch();

  const { data, isLoading, isError, error } = useQuery<Course[]>({
    queryKey: ["Course"],
    queryFn: getAllCourses,
  });

  console.log(data);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Search Section */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchComponent />
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif tracking-tight">
              Explore Our Courses
            </h1>
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
              Discover knowledge that transforms. Start your learning journey today.
            </p>
          </div>
        </div>
      </div>

      {/* Courses Grid Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-2">
            Available Courses
          </h2>
          <p className="text-gray-600">
            {data?.Courses?.length || 0} courses available
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {data?.Courses?.map((d) => (
            <div
              key={d._id}
              className="transform transition-all duration-300 hover:scale-105"
            >
              <CourseCard course={d} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {(!data?.Courses || data.Courses.length === 0) && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="text-xl font-serif text-gray-900 mb-2">
              No courses available
            </h3>
            <p className="text-gray-600">Check back later for new courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllCoursesPage;