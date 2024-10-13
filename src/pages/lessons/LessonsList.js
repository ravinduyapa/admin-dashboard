import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../auth/Firebase';
import Sidebar from '../../components/Sidebar';

const LessonsList = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [lessonName, setLessonName] = useState('');
  const [lessons, setLessons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const lessonsPerPage = 2;
  const [isEditing, setIsEditing] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null);
  
  // New states for optional fields
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');

  // Subjects and Grades arrays
  const subjects = [
    'Sinhala', 'English', 'Maths', 'Science', 'Buddhism',
    'History', 'Tamil', 'ICT', 'Civic', 'Health', 'Geography',
    'Art', 'Dancing', 'Drama', 'Western Music', 'Eastern Music',
    'English Literature', 'Sinhala Literature', 'Media',
  ];
  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

  // Fetch lessons based on grade, subject, and lesson name
  const fetchLessons = async () => {
    try {
      let lessonsQuery = collection(db, 'lessons');
      if (grade) lessonsQuery = query(lessonsQuery, where('grade', '==', grade));
      if (subject) lessonsQuery = query(lessonsQuery, where('subject', '==', subject));
      if (lessonName) lessonsQuery = query(lessonsQuery, where('lessonName', '==', lessonName));

      const querySnapshot = await getDocs(lessonsQuery);
      const lessonsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLessons(lessonsData);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
  };

  const handleSearch = () => {
    fetchLessons();
  };

  // Handle Edit
  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setGrade(lesson.grade);
    setSubject(lesson.subject);
    setLessonName(lesson.lessonName);
    setDescription(lesson.description || ''); 
    setLink(lesson.link || ''); 
    setIsEditing(true);
  };

  // Update the lesson
  const updateLesson = async () => {
    try {
      const lessonRef = doc(db, 'lessons', editingLesson.id);
      await updateDoc(lessonRef, {
        grade,
        subject,
        lessonName,
        description: description || '', 
        link: link || '', 
      });
      fetchLessons();
      resetForm();
    } catch (error) {
      console.error('Error updating lesson:', error);
    }
  };

  // Delete lesson confirmation
  const confirmDelete = (id) => {
    setLessonToDelete(id);
    setShowDeleteModal(true);
  };

  // Delete the lesson
  const handleDelete = async () => {
    try {
      const lessonRef = doc(db, 'lessons', lessonToDelete);
      await deleteDoc(lessonRef);
      fetchLessons();
      setShowDeleteModal(false); 
    } catch (error) {
      console.error('Error deleting lesson:', error);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setGrade('');
    setSubject('');
    setLessonName('');
    setDescription(''); 
    setLink(''); 
    setIsEditing(false);
    setEditingLesson(null);
  };

  // Pagination logic
  const totalPages = Math.ceil(lessons.length / lessonsPerPage);
  const currentLessons = lessons.slice((currentPage - 1) * lessonsPerPage, currentPage * lessonsPerPage);

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="w-3/4 p-10">
        <h2 className="text-4xl font-semibold mb-6">Lessons List</h2>
        
        {/* Select Grade and Subject */}
        <div className="mb-4">
          <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
          <select id="grade" name="grade" onChange={(e) => setGrade(e.target.value)} value={grade} className="mt-1 p-2 block w-full border border-gray-300 rounded">
            <option value="">Select Grade</option>
            {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
          <select id="subject" name="subject" onChange={(e) => setSubject(e.target.value)} value={subject} className="mt-1 p-2 block w-full border border-gray-300 rounded">
            <option value="">Select Subject</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="lessonName" className="block text-sm font-medium">Lesson Name</label>
          <input type="text" id="lessonName" name="lessonName" onChange={(e) => setLessonName(e.target.value)} value={lessonName} className="mt-1 p-2 block w-full border border-gray-300 rounded" placeholder="Enter lesson name" required />
        </div>

        <button onClick={isEditing ? updateLesson : handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          {isEditing ? 'Update Lesson' : 'Search'}
        </button>

        <div className="mt-6">
          {currentLessons.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {currentLessons.map((lesson) => (
                <div key={lesson.id} className="p-4 border border-gray-300 rounded shadow">
                  <h3 className="text-xl font-semibold">{lesson.lessonName}</h3>
                  <p className="text-gray-700">Grade: {lesson.grade}</p>
                  <p className="text-gray-700">Subject: {lesson.subject}</p>
                  {lesson.description && <p className="text-gray-600">Description: {lesson.description}</p>}
                  {lesson.link && <a href={lesson.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">View Lesson</a>}
                  <div className="mt-4">
                    <button onClick={() => handleEdit(lesson)} className="bg-teal-700 text-white px-2 py-1 rounded hover:bg-teal-500">Edit</button>
                    <button onClick={() => confirmDelete(lesson.id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No lessons found. Please select filters and click search.</p>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`px-3 py-1 border rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-lg font-semibold">Edit Lesson</h3>

              <div className="mb-4">
                <label htmlFor="editGrade" className="block text-sm font-medium">Grade</label>
                <select id="editGrade" value={grade} onChange={(e) => setGrade(e.target.value)} className="mt-1 p-2 block w-full border border-gray-300 rounded" required>
                  <option value="">Select Grade</option>
                  {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="editSubject" className="block text-sm font-medium">Subject</label>
                <select id="editSubject" value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 p-2 block w-full border border-gray-300 rounded" required>
                  <option value="">Select Subject</option>
                  {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="editLessonName" className="block text-sm font-medium">Lesson Name</label>
                <input type="text" id="editLessonName" value={lessonName} onChange={(e) => setLessonName(e.target.value)} className="mt-1 p-2 block w-full border border-gray-300 rounded" required />
              </div>

              <div className="mb-4">
                <label htmlFor="editDescription" className="block text-sm font-medium">Description (Optional)</label>
                <input type="text" id="editDescription" value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 p-2 block w-full border border-gray-300 rounded" />
              </div>

              <div className="mb-4">
                <label htmlFor="editLink" className="block text-sm font-medium">Link (Optional)</label>
                <input type="text" id="editLink" value={link} onChange={(e) => setLink(e.target.value)} className="mt-1 p-2 block w-full border border-gray-300 rounded" />
              </div>

              <div className="mt-4">
                <button onClick={updateLesson} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Update</button>
                <button onClick={resetForm} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 ml-2">Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-5 rounded shadow">
              <h3 className="text-lg font-semibold">Confirm Deletion</h3>
              <p>Are you sure you want to delete this lesson?</p>
              <div className="mt-4">
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">Yes</button>
                <button onClick={() => setShowDeleteModal(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 ml-2">No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonsList;  