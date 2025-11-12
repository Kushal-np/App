import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api/profileApi";
import type { User } from "../../types";
import { useSelector } from "react-redux";
import type { RootState } from "../../store/store";
import { Link } from "react-router-dom";

const MyProfile = () => {
  const userId = useSelector((state: RootState) => state.auth.user?._id);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading user...</p>
        </div>
      </div>
    );
  }

  const { data, isLoading, isError, error } = useQuery<User, Error>({
    queryKey: ["userProfile", userId],
    queryFn: () => getUserProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
          <p className="text-lg text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center max-w-md px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-serif text-gray-900 mb-2">
              Error Loading Profile
            </h2>
            <p className="text-red-600">{error?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-lg text-gray-600">No profile data available</p>
      </div>
    );
  }

  const user = data.user;

  const createdDate = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      {/* Header with subtle animation */}
      <div className="bg-white shadow-sm border-b border-gray-200 backdrop-blur-sm bg-opacity-95 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-serif text-gray-900 tracking-tight">
              My Profile
            </h1>
            
            {user.role === "instructor" && (
              <Link to="/Dashboard/instructor/me/MyCourses">
                <button className="group relative px-6 py-2.5 bg-gray-900 text-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105">
                  <span className="relative z-10 flex items-center gap-2 font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Dashboard
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
          {/* Profile Header with gradient and pattern */}
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black px-6 sm:px-8 py-12 sm:py-16 overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar with ring */}
              <div className="flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white text-gray-900 flex items-center justify-center text-5xl sm:text-6xl font-serif shadow-2xl ring-4 ring-white ring-opacity-50 transition-transform group-hover:scale-105">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
              </div>

              {/* Name and Role */}
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-3xl sm:text-4xl font-serif text-white mb-3 tracking-tight">
                  {user?.name}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full border border-white border-opacity-30 transition-all hover:bg-opacity-30">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-sm text-black font-medium capitalize">
                      {user?.role || "Student"}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 bg-opacity-20 backdrop-blur-sm rounded-full border border-green-400 border-opacity-30">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-100 font-medium">
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details */}
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
              <div className="w-1 h-6 bg-gray-900 rounded-full"></div>
              <h3 className="text-xl font-serif text-gray-900">
                Account Information
              </h3>
            </div>

            <div className="space-y-5">
              {/* Email Card */}
              <div className="group p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-gray-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
                      Email Address
                    </p>
                    <p className="text-base sm:text-lg text-gray-900 font-medium break-all">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Member Since Card */}
              <div className="group p-5 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-gray-300">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1 font-medium">
                      Member Since
                    </p>
                    <p className="text-base sm:text-lg text-gray-900 font-medium">
                      {createdDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Section (Optional Enhancement) */}

          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;