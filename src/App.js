import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './login/Login';
import Main from './pages/Main';
import AddStudents from './pages/students/AddStudents';
import StudentList from './pages/students/StudentList';
import AddTeachers from './pages/teachers/AddTeachers';
import TeachersList from './pages/teachers/TeachersList';
import AddLessons from './pages/lessons/AddLessons';
import LessonsList from './pages/lessons/LessonsList';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={< Main/>} />
        <Route path="/add-teachers" element={< AddTeachers/>} />
        <Route path="/teachers-list" element={<TeachersList />} />
        <Route path="/add-students" element={< AddStudents/>} />
        <Route path="/students-list" element={< StudentList/>} />
        <Route path="/add-lessons" element={< AddLessons/>} />
        <Route path="/lessons-list" element={< LessonsList/>} />
      </Routes>
    </Router>
  );
}

export default App;
