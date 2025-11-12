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

  const userId = useSelector((state: RootState) => state.auth.user?._id || "");

  const { data, isLoading, isError, error } = useQuery<{ course: Course }>({
    queryKey: ["course", courseId],
    queryFn: () => getCoursesById(courseId),
    enabled: !!courseId,
  });

  let isHeAlreadyEnrolled = false;

  if (userId && Array.isArray(data?.course?.students)) {
    isHeAlreadyEnrolled = data.course.students.some(
      (s: any) => (s?._id || s)?.toString() === userId.toString()
    );
  }

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

  const handleEnrolled = () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    if (!data?.course?._id) return;
    if (isHeAlreadyEnrolled) return;

    mutation.mutate(data.course._id);
  };

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

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Error Loading Course</h2>
          <p className="text-red-600 mb-6">
            {error instanceof Error ? error.message : "Failed to load course"}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide transition-colors rounded-md"
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
      {/* Back Button */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Courses
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section: Thumbnail + Description + Enroll */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left: Thumbnail */}
          <div className="lg:col-span-2">
            {course?.thumbnailUrl && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mb-6">
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Course Title & Category */}
            <div className="mb-6">
              <div className="inline-block px-3 py-1 bg-gray-900 text-white text-xs tracking-wider uppercase rounded-full mb-3">
                {course?.category}
              </div>
              <h1 className="text-4xl sm:text-5xl font-serif text-gray-900 leading-tight">
                {course?.title}
              </h1>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8">
              <h2 className="text-2xl font-serif text-gray-900 mb-4 flex items-center gap-3">
                <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                About This Course
              </h2>
              <p className="text-gray-700 leading-relaxed text-base whitespace-pre-line">
                {course?.description}
              </p>
            </div>
          </div>

          {/* Right: Enroll Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-6 sticky top-8">
              <div className="mb-6">
                <h3 className="text-xl font-serif text-gray-900 mb-4">Course Details</h3>
                
                <div className="space-y-4">
                  {/* Students Enrolled */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Students</p>
                      <p className="text-lg font-semibold text-gray-900">{course?.students?.length || 0} enrolled</p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
                      <p className="text-lg font-semibold text-gray-900">{course?.category}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enroll Button */}
              <button
                className={`w-full py-4 px-6 text-white text-sm font-semibold tracking-wide transition-all duration-200 rounded-lg ${
                  isHeAlreadyEnrolled
                    ? "bg-green-600 cursor-not-allowed"
                    : mutation.isPending
                    ? "bg-gray-700 cursor-wait"
                    : "bg-gray-900 hover:bg-gray-800 hover:shadow-lg transform hover:-translate-y-0.5"
                }`}
                onClick={handleEnrolled}
                disabled={isHeAlreadyEnrolled || mutation.isPending}
              >
                {isHeAlreadyEnrolled ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Enrolled
                  </span>
                ) : mutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Enrolling...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Enroll Now
                  </span>
                )}
              </button>

              {!userId && (
                <p className="text-center text-xs text-red-600 mt-3">
                  Please log in to enroll
                </p>
              )}

              {/* Additional Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Lifetime access</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Video Section */}
        {course?.videoUrls && (
          <div className="mb-12">
            <h2 className="text-3xl font-serif text-gray-900 mb-6 flex items-center gap-3">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Course Content
            </h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              <div className="aspect-video bg-black">
                <video
                  src={course.videoUrls}
                  controls
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* What You'll Learn Section */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-xl p-8 text-white">
          <h2 className="text-3xl font-serif mb-6 flex items-center gap-3">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            What You'll Learn
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Master the core concepts",
              "Build real-world projects",
              "Learn best practices",
              "Get hands-on experience"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <svg className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-100">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndividualCourseDetailPage;