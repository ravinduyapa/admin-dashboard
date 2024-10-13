import React, { useEffect, useState } from "react";
import { MdDashboard, MdLogout } from "react-icons/md";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoMdPersonAdd } from "react-icons/io";
import { FaListUl } from "react-icons/fa";
import { PiStudentBold } from "react-icons/pi";
import { PiUserListLight } from "react-icons/pi";
import { MdEditNote } from "react-icons/md"
import { MdNoteAdd } from "react-icons/md";


function Sidebar() {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false); 

  const variants = {
    expanded: { width: "20%" },
    nonExpanded: { width: "5%" },
    mobileNonExpanded: { width: "16%" },
  };

  const navItems = [
    { name: "Dashboard", icon: MdDashboard, path: "/dashboard" },
    { name: "Add Teacher", icon: IoMdPersonAdd, path: "/add-teachers" },
    { name: "Teachers List", icon: FaListUl, path: "/teachers-list" },
    { name: "Add Student", icon: PiStudentBold, path: "/add-students" },
    { name: "Students List", icon: PiUserListLight, path: "/students-list" },
    { name: "Add Lessons", icon: MdNoteAdd, path: "/add-lessons" },
    { name: "Lessons List", icon: MdEditNote, path: "/lessons-list" },
  ];

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      if (width <= 768) {
        setIsExpanded(false);
      } else {
        setIsExpanded(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <motion.section
      animate={isExpanded ? "expanded" : isMobile ? "mobileNonExpanded" : "nonExpanded"}
      variants={variants}
      className={`bg-gray-950 h-screen flex flex-col justify-between items-center gap-10 relative ${isExpanded ? 'py-8 px-6' : 'px-2 py-6'}`}
    >
      <div className="flex flex-col justify-center items-center gap-8">
        {isExpanded ? (
          <div id="logo-box">
            <Link to="/dashboard">
              <h1 className="text-red-600 font-bold text-4xl">
                ඉස්කෝල <span className="italic text-yellow-500">ඇප්</span>
              </h1>
            </Link>
          </div>
        ) : (
          <Link to="/dashboard">
            <div className="flex justify-center items-center">
              <h1 className="text-red-600 font-bold text-3xl">ඇ</h1>
              <span className="italic text-yellow-500 text-3xl">ප්</span>
            </div>
          </Link>
          
        )}

        <div id="navLinks-box" className="flex flex-col justify-center items-start gap-5 w-full mt-5">
          {navItems.map((item) => (
            <Link
              to={item.path}
              key={item.name}
              className="w-full"
              onClick={() => setIsExpanded(false)} 
            >
              <div
                id="link-box"
                className={`flex justify-start items-center gap-4 w-full cursor-pointer rounded-xl ${location.pathname === item.path ? 'bg-yellow-500 text-black border-2 border-yellow-300' : 'text-white'} ${isExpanded ? 'px-6 py-2' : 'p-2'}`}
              >
                <div className="bg-yellow-300 text-black p-2 rounded-full">
                  <item.icon className="w-4 h-4 md:w-6 md:h-6" />
                </div>
                {isExpanded && (
                  <span className="text-lg flex">{item.name}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div
        id="expanded-icon"
        className="bg-yellow-500 text-black p-2 rounded-full cursor-pointer absolute -right-4 bottom-10 md:block hidden"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <FaArrowLeft /> : <FaArrowRight />}
      </div>

      <div
        id="logout-box"
        className="w-full flex flex-col justify-start items-center gap-4 cursor-pointer"
        onClick={() => setShowLogoutConfirm(true)} 
      >
        <div className="bg-slate-700 w-full h-[0.5px]"></div>
        <div className="flex justify-center items-center gap-2">
          <MdLogout className="text-white h-6 w-6" />
          <span className={`text-white text-lg ${isExpanded ? 'flex' : 'hidden'}`}>Logout</span>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Do you want to log out?</h2>
            <div className="flex justify-end gap-4">
              <button
                onClick={handleLogout}
                className="bg-teal-900 text-white px-4 py-2 rounded hover:bg-teal-400"
              >
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-400"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}

export default Sidebar;
