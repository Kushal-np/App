import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Course } from "../../types";
import { GetCoursesMadeByMe, updatePost } from "../../api/courseApi";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { updateCourse } from "../../store/courseSlice";
import { resetForm } from "../../store/CourseCreationSlice";
import { Link } from "react-router-dom";

type RootState = {
  auth: { user: any };
  createCourse: {
    title: string;
    description: string;
    category: string;
    thumbnail: File | null;
    thumbnailPreview: string;
    mediaFiles: File[];
    loading: boolean;
    error: string | null;
  };
};

const MyOwnCourses = () => {
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);
  const id = user?._id;
  const dispatch = useDispatch();
  const query = useQueryClient();
  const { loading, error } = useSelector((state: RootState) => state.createCourse);

  const { data, isLoading, isError } = useQuery<{ courses: Course[] }>({
    queryKey: ["MyCourses", id],
    queryFn: () => GetCoursesMadeByMe(id),
    enabled: !!id,
  });

  const mutation = useMutation({
    mutationFn: ({ courseId, formData }: { formData: FormData; courseId: string }) =>
      updatePost(courseId, formData),
    onSuccess: (data: any) => {
      dispatch(updateCourse({
        _id: data._id,
        title: data.title,
        description: data.description,
        category: data.category,
        thumbnail: data.thumbnailUrl || "",
        mediaFiles: data.mediaFilesUrl || data.videoUrls || [],
        students: [],
        instructor: data.instructor || "",
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || new Date().toISOString(),
      }));
      query.invalidateQueries({ queryKey: ["MyCourses"] });
      setEditingCourseId(null);
      dispatch(resetForm());
    },
  });

  const handleEdit = (e: React.FormEvent<HTMLFormElement>, courseId: string) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData();

    const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const categoryInput = form.querySelector('input[name="category"]') as HTMLInputElement;

    formData.append("title", titleInput?.value || "");
    formData.append("description", descriptionInput?.value || "");
    formData.append("category", categoryInput?.value || "");

    const thumbnailInput = form.querySelector('input[name="thumbnail"]') as HTMLInputElement;
    if (thumbnailInput?.files?.[0]) {
      formData.append("thumbnail", thumbnailInput.files[0]);
    }

    const mediaInput = form.querySelector('input[name="mediaFiles"]') as HTMLInputElement;
    if (mediaInput?.files && mediaInput.files.length > 0) {
      Array.from(mediaInput.files).forEach((file) => {
        formData.append("mediaFiles", file);
      });
    }

    mutation.mutate({ formData, courseId });
  };

  const toggleEdit = (courseId: string) => {
    if (editingCourseId === courseId) {
      setEditingCourseId(null);
      dispatch(resetForm());
    } else {
      setEditingCourseId(courseId);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 absolute top-20 to-gray-50 lg:pl-[30%] xl:pl-[25%]">
      <div className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10 pt-16 lg:pt-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1 h-8 sm:h-10 bg-gray-900 rounded-full"></div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-900 tracking-tight">
                My Courses
              </h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base pl-5">
              Manage and edit your published courses
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm sm:text-base text-gray-600">Loading your courses...</p>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 sm:p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-red-800 font-semibold mb-1 text-sm sm:text-base">Unable to load courses</h3>
                  <p className="text-red-600 text-xs sm:text-sm">Please try again later or contact support.</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && (!data?.courses || data.courses.length === 0) && (
            <div className="text-center py-16 sm:py-20">
              <div className="max-w-md mx-auto px-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-gray-900 mb-2">No courses yet</h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Start sharing your knowledge by creating your first course
                </p>
                <Link
                  to="/Dashboard/instructor/me/createCourse"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create your first course
                </Link>
              </div>
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && !isError && data?.courses && data.courses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {data.courses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Category Badge */}
                    <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
                      <span className="px-2 sm:px-3 py-1 bg-white bg-opacity-95 backdrop-blur-sm rounded-full text-xs font-medium text-gray-700 shadow-sm">
                        {course.category}
                      </span>
                    </div>

                    {/* Video Count Badge */}
                    {course.videoUrls && course.videoUrls.length > 0 && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                        <span className="px-2 sm:px-3 py-1 bg-gray-900 bg-opacity-90 backdrop-blur-sm rounded-full text-xs font-medium text-white shadow-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                          </svg>
                          {course.videoUrls.length}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-serif text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 sm:line-clamp-3 mb-4">
                      {course.description}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleEdit(course._id || course.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 text-xs sm:text-sm border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-lg transition-all duration-200 font-medium"
                      >
                        {editingCourseId === (course._id || course.id) ? (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            <span className="hidden sm:inline">Cancel</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </>
                        )}
                      </button>

                      <Link to={`/course/detail/${course._id}`} className="flex-1">
                        <button className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 text-xs sm:text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium shadow-md hover:shadow-lg">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </Link>
                    </div>
                  </div>

                  {/* Edit Form */}
                  {editingCourseId === (course._id || course.id) && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100 bg-gray-50">
                      <form className="space-y-4 sm:space-y-5 pt-4 sm:pt-6" onSubmit={(e) => handleEdit(e, course._id || course.id)}>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Course Title</label>
                          <input
                            type="text"
                            name="title"
                            defaultValue={course.title}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 rounded-lg transition-all"
                            placeholder="Enter course title"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Description</label>
                          <textarea
                            name="description"
                            defaultValue={course.description}
                            rows={3}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 rounded-lg resize-none transition-all"
                            placeholder="Describe your course"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Category</label>
                          <input
                            type="text"
                            name="category"
                            defaultValue={course.category}
                            required
                            className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900 focus:ring-opacity-20 rounded-lg transition-all"
                            placeholder="e.g., Programming, Design"
                          />
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Thumbnail</label>
                          <input
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            className="w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 sm:file:py-2.5 sm:file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:font-medium hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                          />
                          {course.thumbnailUrl && (
                            <img
                              src={course.thumbnailUrl}
                              alt="Preview"
                              className="mt-3 w-full h-24 sm:h-32 object-cover border border-gray-200 rounded-lg shadow-sm"
                            />
                          )}
                        </div>

                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">Media Files</label>
                          <input
                            type="file"
                            name="mediaFiles"
                            accept="video/*,image/*"
                            multiple
                            className="w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 sm:file:py-2.5 sm:file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:font-medium hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                          />
                        </div>

                        {error && (
                          <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded">
                            <p className="text-xs sm:text-sm text-red-700">{error}</p>
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={mutation.isPending || loading}
                          className="w-full py-2.5 sm:py-3.5 text-sm sm:text-base bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                        >
                          {mutation.isPending || loading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Updating...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Update Course
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOwnCourses;