import React, { useEffect, useState, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../auth/Firebase';
import Sidebar from '../components/Sidebar';
import { Link } from 'react-router-dom';

const Main = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);

  // Fetching teachers from Firestore
  const fetchTeachers = async () => {
    const querySnapshot = await getDocs(collection(db, 'Teacher'));
    const teachersData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setTeachers(teachersData);
  };

  // Fetching students from Firestore
  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, 'Student'));
    const studentsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setStudents(studentsData);
  };

  // Fetching lessons from Firestore
  const fetchLessons = useCallback(async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'lessons'));
      const lessonsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        lessonList: doc.data().lessonList || [],
        subjectName: doc.data().subjectName || '',
        subjectImage: doc.data().subjectImage || '',
      }));
      setLessons(lessonsData);
      console.log('Fetched lessons data:', lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  }, []);

  // UseEffect for fetching data on component mount
  useEffect(() => {
    fetchTeachers();
    fetchStudents();
    fetchLessons();
  }, [fetchLessons]);

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="w-4/5 grow bg-white h-screen overflow-y-auto p-4 flex flex-col items-center">
        <div className="flex justify-between gap-4 w-full mb-4">
          {/* Teachers Grid with Navigation */}
          <Link to="/teachers-list" className="flex-1 bg-blue-100 rounded-lg p-4 overflow-y-auto max-h-64">
            <h2 className="text-3xl font-bold mb-2 text-blue-700">Teachers List</h2>
            {teachers.slice(0, 5).map((teacher) => (
              <div key={teacher.id} className="flex justify-between border-b py-2">
                <span>{`${teacher.school}`}</span>
                <span>{teacher.id}</span>
              </div>
            ))}
          </Link>

          {/* Students Grid with Navigation */}
          <Link to="/students-list" className="flex-1 bg-green-100 rounded-lg p-4 overflow-y-auto max-h-64">
            <h2 className="text-3xl font-bold mb-2 text-green-700">Students List</h2>
            {students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex justify-between border-b py-2">
                <span>{`${student.school}`}</span>
                <span>{student.id}</span>
              </div>
            ))}
          </Link>
        </div>

        {/* Lessons Grid with Navigation */}
        <Link to="/lessons-list" className="flex-1 bg-yellow-100 rounded-lg p-4 overflow-y-auto max-h-64 w-full">
          <h2 className="text-3xl font-bold mb-2 text-yellow-700">Lessons List</h2>
          {lessons.length > 0 ? (
            lessons.slice(0, 5).map((lesson) => (
              <div key={lesson.id} className="border-b py-2">
                <h3 className="font-bold">{lesson.subjectName}</h3>
                {lesson.lessonList.map((lessonName, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{lessonName}</span>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <p>No lessons found.</p>
          )}
        </Link>
      </section>
    </section>
  );
};

export default Main;
