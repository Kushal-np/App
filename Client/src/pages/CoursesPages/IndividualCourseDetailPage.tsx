import { useNavigate, useParams } from "react-router-dom";
import type { Course } from "../../types";
import { EnrollOnACourse, getCoursesById } from "../../api/courseApi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { enrollStudent } from "../../store/courseSlice";
import type { RootState } from "../../store/store";

const IndividualCourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // ✅ Logged in user id
  const userId = useSelector((state: RootState) => state.auth.user?._id || "");

  // ✅ Fetch course details
  const { data, isLoading, isError, error } = useQuery<{ course: Course }>({
    queryKey: ["course", courseId],
    queryFn: () => getCoursesById(courseId),
    enabled: !!courseId,
  });

  // ✅ Safely check if enrolled (no undefined issues)
  let isHeAlreadyEnrolled = false;

  if (userId && Array.isArray(data?.course?.students)) {
    isHeAlreadyEnrolled = data.course.students.some(
      (s: any) => (s?._id || s)?.toString() === userId.toString()
    );
  }

  console.log("this is ", isHeAlreadyEnrolled);
  console.log("ENROLLED:", isHeAlreadyEnrolled);
  console.log("USER:", userId);

  // ✅ Enroll mutation
  const mutation = useMutation({
    mutationFn: (id: string) => EnrollOnACourse(id),
    onSuccess: (_, id) => {
      if (userId) {
        dispatch(enrollStudent({ courseId: id, studentId: userId }));
      }

      queryClient.invalidateQueries({ queryKey: ["course", id] });
      queryClient.invalidateQueries({ queryKey: ["Course"] });
    },
  });

  // ✅ Handle enroll with clean logic
  const handleEnrolled = () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (!data?.course?._id) return;
    if (isHeAlreadyEnrolled) return;

    mutation.mutate(data.course._id);
  };

  // ✅ Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  // ✅ Error
  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg
              className="w-8 h-8 text-red-600"
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
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">
            Error Loading Course
          </h2>
          <p className="text-red-600 mb-6">
            {error instanceof Error ? error.message : "Failed to load course"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const course = data?.course;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Courses
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-gray-900 mb-3">
            {course?.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            {course?.category}
          </p>
        </div>

        {/* Thumbnail */}
        {course?.thumbnailUrl && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <img
                src={course.thumbnailUrl}
                alt={course.title}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        )}

        {/* Video */}
        {course?.videoUrls && (
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="aspect-video">
                <video
                  src={course.videoUrls}
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        )}

        {/* Description */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900 mb-4 pb-3 border-b border-gray-200">
            Course Description
          </h2>
          <p className="text-gray-700 leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {course?.description}
          </p>
        </div>

        {/* Course Information Card */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-gray-200 w-full max-w-md mx-auto">
          <h3 className="text-xl sm:text-2xl font-serif text-gray-900 mb-6">
            Course Information
          </h3>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Category
                </p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">
                  {course?.category}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                  Students Enrolled
                </p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">
                  {course?.students?.length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* ✅ Enroll Button with CLEAN LOGIC */}
          <button
            className={`w-full py-3 px-4 text-white text-sm font-medium tracking-wide transition-colors duration-200 ${
              isHeAlreadyEnrolled
                ? "bg-green-600 cursor-not-allowed"
                : mutation.isPending
                ? "bg-gray-700 cursor-wait"
                : "bg-gray-900 hover:bg-gray-800"
            }`}
            onClick={handleEnrolled}
            disabled={isHeAlreadyEnrolled || mutation.isPending}
          >
            {isHeAlreadyEnrolled ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Already Enrolled
              </span>
            ) : mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Enrolling...
              </span>
            ) : (
              "Enroll Now"
            )}
          </button>

          {/* Message: login required */}
          {!userId && (
            <p className="text-center text-xs text-red-600 mt-3">
              Please log in to enroll
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualCourseDetailPage;