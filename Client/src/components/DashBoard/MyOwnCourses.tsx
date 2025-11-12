import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import SidePanel from "./SidePanel";
import type { Course } from "../../types";
import { GetCoursesMadeByMe, updatePost, type UpdateDetails } from "../../api/courseApi";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { updateCourse } from "../../store/courseSlice";
import {
  setTitle,
  setDescription,
  setCategory,
  setThumbnail,
  setMediaFiles,
  resetForm,
  setError,
} from "../../store/CourseCreationSlice";
import { Link } from "react-router-dom";

// Add RootState type if not imported
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
  const { 
    title, 
    description, 
    category, 
    thumbnail,
    thumbnailPreview, 
    mediaFiles,
    loading, 
    error 
  } = useSelector((state: RootState) => state.createCourse);

  const { data, isLoading, isError } = useQuery<{ courses: Course[] }>({
    queryKey: ["MyCourses", id],
    queryFn: () => GetCoursesMadeByMe(id),
    
    enabled: !!id,
  });

const mutation = useMutation({
  mutationFn: ({ courseId , formData}: { formData: FormData; courseId: string }) =>
    updatePost(courseId , formData),
  onSuccess: (data: any) => {
    console.log("Course updated successfully", data);
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
    query.invalidateQueries(["Course"])
    setEditingCourseId(null);
    dispatch(resetForm());
  },
});


  const handleEdit = (e: React.FormEvent<HTMLFormElement>, courseId: string) => {
    e.preventDefault();
    
    console.log("Course ID being sent:", courseId); // DEBUG
    
    const form = e.currentTarget;
    const formData = new FormData();
    
    // DON'T add courseId to formData - it goes in the URL
    
    // Get form values
    const titleInput = form.querySelector('input[name="title"]') as HTMLInputElement;
    const descriptionInput = form.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
    const categoryInput = form.querySelector('input[name="category"]') as HTMLInputElement;
    
    formData.append("title", titleInput?.value || "");
    formData.append("description", descriptionInput?.value || "");
    formData.append("category", categoryInput?.value || "");

    // Handle thumbnail file
    const thumbnailInput = form.querySelector('input[name="thumbnail"]') as HTMLInputElement;
    if (thumbnailInput?.files?.[0]) {
      formData.append("thumbnail", thumbnailInput.files[0]);
    }

    // Handle media files
    const mediaInput = form.querySelector('input[name="mediaFiles"]') as HTMLInputElement;
    if (mediaInput?.files && mediaInput.files.length > 0) {
      Array.from(mediaInput.files).forEach((file) => {
        formData.append("mediaFiles", file);
      });
    }

    console.log("Submitting FormData:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-1/5 border-r border-gray-200 bg-white">
        <SidePanel />
      </div>

      {/* Main Content */}
      <div className="flex-1 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600 text-base">
              Manage and edit your published courses
            </p>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <svg className="animate-spin h-8 w-8 text-gray-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          )}

          {/* Error */}
          {isError && (
            <div className="text-sm text-red-600 px-4 py-3 bg-red-50 border-l-4 border-red-600 rounded-md">
              Unable to load courses. Please try again later.
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !isError && (!data?.courses || data.courses.length === 0) && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-base mb-4">
                You haven't created any courses yet
              </p>
              <a
                href="/Dashboard/instructor/me/createCourse"
                className="inline-block px-6 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide rounded-md transition-colors"
              >
                Create your first course
              </a>
            </div>
          )}

          {/* Courses Grid */}
          {!isLoading && !isError && data?.courses && data.courses.length > 0 && (
            <>
              {console.log("First course object:", data.courses[0])}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {data.courses.map((course) => (
                <div
                  key={course._id || course.id}
                  className="group border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  {/* Course Info */}
                  <div className="p-5">
                    <span className="text-xs tracking-wide text-gray-500 uppercase">{course.category}</span>
                    <h3 className="text-lg font-serif text-gray-900 mt-1 mb-2 group-hover:text-gray-700 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{course.description}</p>
                    {course.videoUrls && course.videoUrls.length > 0 && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-500">
                          {course.videoUrls.length} video{course.videoUrls.length > 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex px-5 pb-5 gap-2">
                    <button
                      onClick={() => toggleEdit(course._id || course.id)}
                      className="flex-1 py-2 text-sm border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white rounded-md transition-colors"
                    >
                      {editingCourseId === (course._id || course.id) ? "Cancel" : "Edit"}
                    </button>

                    <Link to={`/course/detail/${course._id}`}>
                    <button className="flex-1 py-2 text-sm bg-gray-900 text-white hover:bg-gray-800 rounded-md transition-colors">
                      View
                    </button>
                    </Link>
                  </div>

                  {/* Edit Form */}
                  {editingCourseId === (course._id || course.id) && (
                    <div className="px-5 pb-5 border-t border-gray-100 bg-gray-50 rounded-b-lg mt-2">
                      <form className="space-y-6" onSubmit={(e) => handleEdit(e, course._id || course.id)}>
                        {/* Title */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Course title</label>
                          <input
                            type="text"
                            name="title"
                            defaultValue={course.title}
                            required
                            className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none rounded-md placeholder-gray-400"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Course description</label>
                          <textarea
                            name="description"
                            defaultValue={course.description}
                            rows={4}
                            required
                            className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none rounded-md placeholder-gray-400 resize-none"
                          />
                        </div>

                        {/* Category */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Category</label>
                          <input
                            type="text"
                            name="category"
                            defaultValue={course.category}
                            required
                            className="w-full px-4 py-3 border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none rounded-md placeholder-gray-400"
                          />
                        </div>

                        {/* Thumbnail */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Course thumbnail</label>
                          <input
                            type="file"
                            name="thumbnail"
                            accept="image/*"
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-900 file:text-white file:text-sm file:tracking-wide hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                          />
                          {course.thumbnailUrl && (
                            <img
                              src={course.thumbnailUrl}
                              alt="Thumbnail preview"
                              className="mt-3 max-w-xs border border-gray-200 shadow-sm rounded-md"
                            />
                          )}
                        </div>

                        {/* Media Files */}
                        <div>
                          <label className="block text-sm text-gray-700 mb-1">Course media</label>
                          <input
                            type="file"
                            name="mediaFiles"
                            accept="video/*,image/*"
                            multiple
                            className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-900 file:text-white file:text-sm file:tracking-wide hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                          />
                          {course.videoUrls && course.videoUrls.length > 0 && (
                            <div className="mt-3 grid grid-cols-3 gap-3">
                              {course.videoUrls.map((url, i) => (
                                <div key={i} className="relative aspect-video">
                                  <img
                                    src={url}
                                    alt={`Media ${i + 1}`}
                                    className="w-full h-full object-cover border border-gray-200 rounded-md"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Error Display */}
                        {error && (
                          <div className="text-sm text-red-600 px-3 py-2 bg-red-50 border-l-4 border-red-600 rounded">
                            {error}
                          </div>
                        )}

                        {/* Submit Button */}
                        <button
                          type="submit"
                          disabled={mutation.isPending || loading}
                          className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {mutation.isPending || loading ? "Updating..." : "Update Course"}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyOwnCourses;