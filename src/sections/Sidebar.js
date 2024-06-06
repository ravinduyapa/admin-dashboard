import React, { useEffect, useState } from "react";
import { MdDashboard, MdOutlineMessage, MdLogout } from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
import { LiaToolsSolid } from "react-icons/lia";
import { IoSettingsSharp } from "react-icons/io5";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import { motion } from "framer-motion";

function Sidebar() {
  const variants = {
    expanded: { width: "20%" },
    nonExpanded: { width: "5%" },
    mobileNonExpanded: { width: "16%" }
  };

  const navItems = [
    { name: "Dashboard", icon: MdDashboard },
    { name: "Message", icon: MdOutlineMessage },
    { name: "Analytics", icon: SiSimpleanalytics },
    { name: "Tools", icon: LiaToolsSolid },
    { name: "Setting", icon: IoSettingsSharp }
  ];

  const [activeNavIndex, setActiveNavIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <motion.section
      animate={isExpanded ? "expanded" : isMobile ? "mobileNonExpanded" : "nonExpanded"}
      variants={variants}
      className={`bg-gray-950 h-screen flex flex-col justify-between items-center gap-10 relative ${isExpanded ? 'py-8 px-6' : 'px-2 py-6'}`}
    >
      <div className="flex flex-col justify-center items-center gap-8">
        {isExpanded ? (
          <div id="logo-box">
            <h1 className="text-red-600 font-bold text-4xl">
              Hela <span className="italic text-yellow-500">Script</span>
            </h1>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <h1 className="text-red-600 font-bold text-3xl">H</h1>
            <span className="italic text-yellow-500 text-3xl">S</span>
          </div>
        )}

        <div id="navLinks-box" className="flex flex-col justify-center items-start gap-5 w-full mt-5">
          {navItems.map((item, index) => (
            <div
              key={item.name}
              id="link-box"
              className={`flex justify-start items-center gap-4 w-full cursor-pointer rounded-xl ${activeNavIndex === index ? 'bg-yellow-500 text-black border-2 border-yellow-300' : 'text-white'} ${isExpanded ? 'px-6 py-2' : 'p-2'}`}
              onClick={() => setActiveNavIndex(index)}
            >
              <div className="bg-yellow-300 text-black p-2 rounded-full">
                <item.icon className="w-4 h-4 md:w-6 md:h-6" />
              </div>
              {isExpanded && (
                <span className="text-lg flex">{item.name}</span>
              )}
            </div>
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

      <div id="logout-box" className="w-full flex flex-col justify-start items-center gap-4 cursor-pointer">
        <div className="bg-slate-700 w-full h-[0.5px]"></div>
        <div className="flex justify-center items-center gap-2">
          <MdLogout className="text-white h-6 w-6" />
          <span className={`text-white text-lg ${isExpanded ? 'flex' : 'hidden'}`}>Logout</span>
        </div>
      </div>
    </motion.section>
  );
}

export default Sidebar;
