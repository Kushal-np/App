import { Link, useLocation, useOutlet } from "react-router-dom";
import { useState } from "react";

const SidePanel = () => {
  const location = useLocation();
  const outlet = useOutlet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Check if there's content in the outlet
  const hasOutlet = outlet !== null;

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    {
      path: "/Dashboard/instructor/me/createCourse",
      label: "Create Course",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      path: "/Dashboard/instructor/me/MyCourses",
      label: "My Courses",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile Menu Button - Only show when there's outlet content */}
      {hasOutlet && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMobileMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      )}

      {/* Overlay for mobile */}
      {isMobileMenuOpen && hasOutlet && (
        <div
          className="lg:hidden fixed inset- bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Side Panel */}
      <div
        className={`
          ${hasOutlet ? 'lg:w-[30%] xl:w-[25%]' : 'w-full max-w-md mx-auto'}
          ${hasOutlet ? 'fixed lg:sticky' : 'relative'}
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${hasOutlet ? '' : 'mt-20'}
          top-0 left-0 h-screen bg-gradient-to-br from-white to-gray-50 
          border-r border-gray-200 shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out z-40
          flex flex-col
        `}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 sm:px-8 pt-8 pb-6 border-b border-gray-200 bg-white bg-opacity-80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-serif text-gray-900 tracking-tight">
                Dashboard
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Instructor Portal</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="space-y-2">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    group relative flex items-center gap-3 px-4 py-3.5 rounded-xl
                    text-sm font-medium tracking-wide
                    transition-all duration-200
                    ${
                      active
                        ? "text-gray-900 bg-gray-900 bg-opacity-5 shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }
                  `}
                >
                  {/* Active indicator */}
                  <div
                    className={`
                      absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full
                      transition-all duration-200
                      ${active ? "bg-gray-900 opacity-100" : "bg-gray-300 opacity-0 group-hover:opacity-50"}
                    `}
                  />

                  {/* Icon */}
                  <div
                    className={`
                      flex-shrink-0 transition-colors duration-200
                      ${active ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}
                    `}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span className="flex-1">{item.label}</span>

                  {/* Arrow indicator for active */}
                  {active && (
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                  )}
                </Link>
              );
            })}
          </div>

          {/* Quick Stats Card */}
          <div className="mt-8 p-5 rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-lg">
            <h3 className="text-sm font-medium mb-4 opacity-90">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-75">Total Courses</span>
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-75">Students</span>
                <span className="text-lg font-bold">0</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs opacity-75">Revenue</span>
                <span className="text-lg font-bold">$0</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-white bg-opacity-80">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </button>
        </div>
      </div>
    </>
  );
};

export default SidePanel;