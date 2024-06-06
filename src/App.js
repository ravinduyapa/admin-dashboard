import React from "react";
import Sidebar from "./sections/Sidebar";
import Main from "./sections/Main";

function App() {



  return (
    <main className="w-full bg-slate-200 h-screen flex justify-between items-start"> 
      <Sidebar/>
      <Main/>
    </main>
  );
}

export default App;
