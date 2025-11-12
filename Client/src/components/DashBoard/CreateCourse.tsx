import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setTitle,
  setDescription,
  setCategory,
  setThumbnail,
  setMediaFiles,
  resetForm,
  setError,
} from "../../store/CourseCreationSlice";
import { useMutation } from "@tanstack/react-query";
import { createPost, type CreateDetails } from "../../api/courseApi";
import { addCourse } from "../../store/courseSlice";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../store";
import SidePanel from "./SidePanel";

const CreateCourse = () => {
  const dispatch = useDispatch();
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
  
  const navigate = useNavigate();
  const [mediaPreview, setMediaPreview] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      dispatch(setThumbnail({ file, preview: url }));
    }
  };

  const handleMediaFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      dispatch(setMediaFiles(fileArray));
      
      const urls: string[] = fileArray.map(file => URL.createObjectURL(file));
      setMediaPreview(urls);
    }
  };

  const mutation = useMutation({
    mutationFn: (data: FormData) => createPost(data as unknown as CreateDetails),
    onSuccess: (data: any) => {
      dispatch(
        addCourse({
          _id: data.id || data._id,
          title: data.title,
          description: data.description,
          category: data.category,
          thumbnail: data.thumbnailUrl || "",
          mediaFiles: data.mediaFilesUrl || data.videourls || [],
          students: [],
          instructor: data.instructor || "",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        })
      );
      
      dispatch(resetForm());
      setMediaPreview([]);
      navigate("/course");
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.message || error?.message || "Failed to create course";
      dispatch(setError(errorMessage));
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setError(null));

    if (!title || !description || !category) {
      dispatch(setError("Please fill all the required fields"));
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    if (mediaFiles && mediaFiles.length > 0) {
      mediaFiles.forEach((file) => {
        formData.append("mediaFiles", file);
      });
    }

    mutation.mutate(formData);
  };

  useEffect(() => {
    return () => {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      mediaPreview.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [thumbnailPreview, mediaPreview]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 absolute top-10 w-[100%] to-gray-50 lg:pl-[30%] xl:pl-[25%]">
        
      <div className="flex justify-center items-start py-8 sm:py-12 lg:py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl pt-16 lg:pt-0">
          {/* Header */}
          <div className="mb-8 sm:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif text-gray-900 mb-2">
              Create a new course
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Share your knowledge with learners
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Error Message */}
            {(error || mutation.isError) && (
                <div className="text-xs sm:text-sm text-red-600 px-3 sm:px-4 py-2 sm:py-3 bg-red-50 border-l-4 border-red-600 rounded">
                {error || "Unable to create course. Please try again."}
              </div>
            )}

            {/* Success Message */}
            {mutation.isSuccess && (
                <div className="text-xs sm:text-sm text-green-600 px-3 sm:px-4 py-2 sm:py-3 bg-green-50 border-l-4 border-green-600 rounded">
                Course created successfully. Redirecting...
              </div>
            )}

            {/* Course Title */}
            <div>
              <label htmlFor="title" className="block text-xs sm:text-sm text-gray-700 mb-2">
                Course Title <span className="text-gray-400">*</span>
              </label>
              <input
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400"
                type="text"
                name="title"
                id="title"
                value={title}
                onChange={(e) => dispatch(setTitle(e.target.value))}
                placeholder="Introduction to Modern Web Development"
                required
                disabled={mutation.isPending}
                />
            </div>

            {/* Course Description */}
            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm text-gray-700 mb-2">
                Course Description <span className="text-gray-400">*</span>
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400 resize-none"
                name="description"
                id="description"
                value={description}
                onChange={(e) => dispatch(setDescription(e.target.value))}
                placeholder="Describe what students will learn in this course"
                rows={4}
                required
                disabled={mutation.isPending}
                />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs sm:text-sm text-gray-700 mb-2">
                Category <span className="text-gray-400">*</span>
              </label>
              <input
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400"
                type="text"
                name="category"
                id="category"
                value={category}
                onChange={(e) => dispatch(setCategory(e.target.value))}
                placeholder="Programming, Design, Business"
                required
                disabled={mutation.isPending}
                />
            </div>

            {/* Thumbnail */}
            <div className="pt-2 sm:pt-4">
              <label htmlFor="thumbnail" className="block text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                Course Thumbnail
              </label>
              <input
                className="w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:text-xs sm:file:text-sm file:font-medium hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                type="file"
                name="thumbnail"
                id="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                disabled={mutation.isPending}
                />
              {thumbnailPreview && (
                  <div className="mt-3 sm:mt-4">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="w-full sm:max-w-sm h-auto border border-gray-200 rounded-lg shadow-sm"
                    />
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="pt-2 sm:pt-4">
              <label htmlFor="mediaFiles" className="block text-xs sm:text-sm text-gray-700 mb-2 sm:mb-3">
                Course Media
              </label>
              <input
                className="w-full text-xs sm:text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 sm:file:px-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white file:text-xs sm:file:text-sm file:font-medium hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                type="file"
                name="mediaFiles"
                id="mediaFiles"
                multiple
                accept="video/*,image/*"
                onChange={handleMediaFilesChange}
                disabled={mutation.isPending}
                />
              {mediaPreview.length > 0 && (
                  <div className="mt-3 sm:mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {mediaPreview.map((url, index) => (
                      <div key={index} className="relative aspect-video">
                      <img 
                        src={url} 
                        alt={`Media preview ${index + 1}`} 
                        className="w-full h-full object-cover border border-gray-200 rounded-lg"
                        />
                    </div>
                  ))}
                </div>
              )}
              {mediaFiles.length > 0 && (
                  <p className="text-xs text-gray-500 mt-2">
                  {mediaFiles.length} file{mediaFiles.length > 1 ? 's' : ''} selected
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 sm:pt-8 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={mutation.isPending || loading}
                className="w-full py-3 sm:py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm sm:text-base font-medium tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900 rounded-lg shadow-lg hover:shadow-xl"
                >
                {mutation.isPending || loading ? (
                    <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating course
                  </span>
                ) : (
                    "Create course"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCourse;