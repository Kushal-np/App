import { Link, useLocation } from "react-router-dom";

const SidePanel = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    {
      path: "/Dashboard/instructor/me/createCourse",
      label: "Create course",
    },
    {
      path: "/Dashboard/instructor/me/MyCourses",
      label: "My courses",
    },
  ];

  return (
    <div className="bg-white h-screen border-r border-gray-100">
      <div className="py-12 px-6">
        <h2 className="text-2xl font-serif text-gray-900 mb-8 px-4">
          Dashboard
        </h2>
        
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                block px-4 py-3 text-sm tracking-wide transition-colors
                ${
                  isActive(item.path)
                    ? "text-gray-900 bg-gray-50 border-l-2 border-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-2 border-transparent"
                }
              `}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default SidePanel;