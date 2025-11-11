import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { searchCourses } from "../../api/courseApi";
import { clearSearch, setSearchQuery } from "../../store/searchSlice";
import { useState, useEffect } from "react";
import type { Course } from "../../types";

export default function SearchComponent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const searchQuery = useSelector((state: any) => state.search.query);

  // ✅ local debounced state
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Update debouncedQuery 0.8s after typing stops
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 800); // 0.8 seconds

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // React Query only triggers when debouncedQuery changes
  const { data, isLoading } = useQuery({
    queryKey: ["search-courses", debouncedQuery],
    queryFn: () => searchCourses(debouncedQuery),
    enabled: debouncedQuery.length > 0, // only run if not empty
    staleTime: 2000,
  });

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={searchQuery}
          placeholder="Search courses..."
          onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="w-full pl-12 pr-12 py-3 sm:py-4 text-gray-900 bg-white border-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors rounded-lg text-base"
        />

        {searchQuery && (
          <button
            onClick={() => dispatch(clearSearch())}
            className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-70 transition-opacity"
            aria-label="Clear search"
          >
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            <p className="text-sm text-gray-600">Searching courses...</p>
          </div>
        </div>
      )}

      {/* Search Results Dropdown */}
      {debouncedQuery && data && !isLoading && (
        <div className="absolute z-10 mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-[32rem] overflow-y-auto">
          {data.courses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">
                No courses found for "{debouncedQuery}"
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Try adjusting your search terms
              </p>
            </div>
          ) : (
            <div className="py-2">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  {data.courses.length} {data.courses.length === 1 ? 'Course' : 'Courses'} Found
                </p>
              </div>
              
              {data.courses.map((course: Course) => (
                <Link
                  key={course._id}
                  to={`/course/detail/${course._id}`}
                  onClick={() => dispatch(clearSearch())}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
                    {/* Thumbnail */}
                    <div className="flex-shrink-0 w-20 h-14 sm:w-24 sm:h-16 rounded overflow-hidden bg-gray-100">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-6 h-6 text-gray-400"
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
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 truncate mb-1">
                        {course.title}
                      </h4>
                      {course.instructor?.name && (
                        <p className="text-xs text-gray-500 truncate">
                          {course.instructor.name}
                        </p>
                      )}
                    </div>

                    {/* Arrow Icon */}
                    <div className="flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}