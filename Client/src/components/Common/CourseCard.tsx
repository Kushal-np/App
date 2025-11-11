import { Link } from "react-router-dom";
import type { Course } from "../../types";

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC = ({ course }: CourseCardProps) => {
  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200">
      {/* Thumbnail Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        
        {/* Video Badge */}
        {course.videoUrls && (
          <div className="absolute top-3 right-3 bg-gray-900 bg-opacity-90 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
            <svg
              className="w-3 h-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
            </svg>
            Video
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Title */}
        <h3 className="text-lg sm:text-xl font-serif text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {course.title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-3 py-3 border-t border-gray-100">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
            {course.instructor?.name?.charAt(0).toUpperCase() || "I"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
              Instructor
            </p>
            <p className="text-sm font-medium text-gray-900 truncate">
              {course.instructor?.name || "Unknown Instructor"}
            </p>
          </div>
        </div>

        {/* Course Details Button */}
        <Link
          to={`/course/detail/${course._id}`}
          className="block w-full"
        >
          <button className="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium tracking-wide transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2">
            View Course Details
          </button>
        </Link>
      </div>
    </div>
  );
};

export default CourseCard;