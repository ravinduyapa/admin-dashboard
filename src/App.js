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
import AddSubjects from './pages/subjects/AddSubjects';
import PrivateRoute from './auth/PrivateRoute '; 
import SubjectList from './pages/subjects/SubjectList';
import AddGrade from './pages/grades/AddGrade';

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Main />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-teachers"
          element={
            <PrivateRoute>
              <AddTeachers />
            </PrivateRoute>
          }
        />
        <Route
          path="/teachers-list"
          element={
            <PrivateRoute>
              <TeachersList />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-students"
          element={
            <PrivateRoute>
              <AddStudents />
            </PrivateRoute>
          }
        />
        <Route
          path="/students-list"
          element={
            <PrivateRoute>
              <StudentList />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-lessons"
          element={
            <PrivateRoute>
              <AddLessons />
            </PrivateRoute>
          }
        />
        <Route
          path="/lessons-list"
          element={
            <PrivateRoute>
              <LessonsList />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-subjects"
          element={
            <PrivateRoute>
              <AddSubjects />
            </PrivateRoute>
          }
        />
        <Route
          path="/subject-list"
          element={
            <PrivateRoute>
              <SubjectList />
            </PrivateRoute>
          }
        />
         <Route
          path="/add-grade"
          element={
            <PrivateRoute>
              <AddGrade />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
