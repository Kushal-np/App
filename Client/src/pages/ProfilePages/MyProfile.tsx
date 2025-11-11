import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api/profileApi";
import type { User } from "../../types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";

const MyProfile = () => {
  const userId = useSelector((state: RootState) => state.auth.user?._id);
  console.log("This is", userId);

  const { data, isLoading, isError, error } = useQuery<User, Error>({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  console.log("this is", data.user.name);

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
            Error Loading Profile
          </h2>
          <p className="text-red-600">{error?.message || "Error fetching profile"}</p>
        </div>
      </div>
    );
  }

  const user = data?.user;
  const createdDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : 'N/A';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-serif text-gray-900">
            My Profile
          </h1>
        </div>
      </div>
        {
            user.role === "student" ? (<div>lol</div>):(<div className="border-black border-2 border-solid bg-black text-white p-2  inline relative left-[45%]">Go to Dashboard</div>)
        }
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 px-6 sm:px-8 py-8 sm:py-12">
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white text-gray-900 flex items-center justify-center text-4xl sm:text-5xl font-serif shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-serif text-white mb-2">
                  {user?.name}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white bg-opacity-20 rounded-full">
                  <svg
                    className="w-4 h-4 text-black"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm text-black font-medium capitalize">
                    {user?.role || "Student"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8">
            <h3 className="text-xl font-serif text-gray-900 mb-6 pb-3 border-b border-gray-200">
              Account Information
            </h3>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Email Address
                  </p>
                  <p className="text-base sm:text-lg text-gray-900 font-medium break-all">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* User ID */}


              {/* Member Since */}
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Member Since
                  </p>
                  <p className="text-base sm:text-lg text-gray-900 font-medium">
                    {createdDate}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}

        </div>
      </div>
    </div>
  );
};

export default MyProfile;