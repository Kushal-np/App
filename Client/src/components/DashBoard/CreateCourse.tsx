import { useState, useEffect } from "react";
import SidePanel from "./SidePanel";
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
  
  console.log("Form values:", { title, description, category });
  
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
      console.log("Course created successfully:", data);
      
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
      console.error("Error creating course:", error);
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

    console.log("Submitting FormData:");
    for (let [key, value] of formData.entries()) {
      console.log(key, value);
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
    <div className="flex min-h-screen bg-white">
      <div className="w-[20%] border-r border-gray-100">
        <SidePanel />
      </div>

      <div className="flex w-[80%] justify-center items-start py-16 px-8">
        <div className="w-full max-w-2xl">
          <div className="mb-12">
            <h1 className="text-4xl font-serif text-gray-900 mb-2">
              Create a new course
            </h1>
            <p className="text-gray-600 text-base">
              Share your knowledge with learners
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Error Message */}
            {(error || mutation.isError) && (
              <div className="text-sm text-red-600 px-4 py-3 bg-red-50 border-l-2 border-red-600">
                {error || "Unable to create course. Please try again."}
              </div>
            )}

            {/* Success Message */}
            {mutation.isSuccess && (
              <div className="text-sm text-green-600 px-4 py-3 bg-green-50 border-l-2 border-green-600">
                Course created successfully. Redirecting...
              </div>
            )}

            {/* Course Title */}
            <div>
              <label htmlFor="title" className="block text-sm text-gray-700 mb-2">
                Course title <span className="text-gray-400">*</span>
              </label>
              <input
                className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400"
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
              <label htmlFor="description" className="block text-sm text-gray-700 mb-2">
                Course description <span className="text-gray-400">*</span>
              </label>
              <textarea
                className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400 resize-none"
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
              <label htmlFor="category" className="block text-sm text-gray-700 mb-2">
                Category <span className="text-gray-400">*</span>
              </label>
              <input
                className="w-full px-4 py-3 text-gray-900 bg-white border-b-2 border-gray-200 focus:border-gray-900 focus:outline-none transition-colors placeholder:text-gray-400"
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
            <div className="pt-4">
              <label htmlFor="thumbnail" className="block text-sm text-gray-700 mb-3">
                Course thumbnail
              </label>
              <div className="relative">
                <input
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-900 file:text-white file:text-sm file:tracking-wide hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                  type="file"
                  name="thumbnail"
                  id="thumbnail"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={mutation.isPending}
                />
              </div>
              {thumbnailPreview && (
                <div className="mt-4">
                  <img 
                    src={thumbnailPreview} 
                    alt="Thumbnail preview" 
                    className="max-w-sm border border-gray-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Media Files */}
            <div className="pt-4">
              <label htmlFor="mediaFiles" className="block text-sm text-gray-700 mb-3">
                Course media
              </label>
              <div className="relative">
                <input
                  className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:border-0 file:bg-gray-900 file:text-white file:text-sm file:tracking-wide hover:file:bg-gray-800 file:transition-colors file:cursor-pointer cursor-pointer"
                  type="file"
                  name="mediaFiles"
                  id="mediaFiles"
                  multiple
                  accept="video/*,image/*"
                  onChange={handleMediaFilesChange}
                  disabled={mutation.isPending}
                />
              </div>
              {mediaPreview.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {mediaPreview.map((url, index) => (
                    <div key={index} className="relative aspect-video">
                      <img 
                        src={url} 
                        alt={`Media preview ${index + 1}`} 
                        className="w-full h-full object-cover border border-gray-200"
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
            <div className="pt-8 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={mutation.isPending || loading}
                className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white text-sm tracking-wide transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-900"
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