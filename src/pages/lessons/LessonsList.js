import React, { useEffect, useState, useCallback } from 'react';
import { collection, doc, getDoc, updateDoc, getDocs, deleteDoc, setDoc } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase'; 
import Sidebar from '../../components/Sidebar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../auth/Firebase'; 
import { NavLink } from 'react-router-dom';

// Modal Component for Delete Confirmation
const Modal = ({ isOpen, onClose, onConfirm, lessonName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6">
        <h3 className="text-lg font-semibold">Confirm Delete</h3>
        <p>Are you sure you want to delete {lessonName}?</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded mr-2">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

// EditModal Component for Editing Lessons
const EditModal = ({ isOpen, onClose, lessonName, subjectImageUrl, onLessonNameChange, onImageChange, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-1/3">
        <h3 className="text-lg font-semibold">Edit Lesson</h3>
        
        {/* Lesson Name Input */}
        <div>
          <label htmlFor="lessonName" className="block text-sm font-medium">Lesson Name</label>
          <input
            id="lessonName"
            name="lessonName"
            type="text"
            value={lessonName}
            onChange={onLessonNameChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        {/* Subject Image Input */}
        <div>
          <label htmlFor="subjectImage" className="block text-sm font-medium">Subject Image</label>
          <div className="mt-2">
            <img src={subjectImageUrl} alt="Current Subject" className="max-w-12 h-12 rounded shadow mb-2" />
          </div>
          <input
            id="subjectImage"
            name="subjectImage"
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded mr-2">Cancel</button>
          <button onClick={onUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
        </div>
      </div>
    </div>
  );
};

// EditSubjectModal Component for Editing Subject
const EditSubjectModal = ({ isOpen, onClose, subjectName, onSubjectNameChange, onUpdate }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6 w-1/3">
        <h3 className="text-lg font-semibold">Edit Subject</h3>
        
        {/* Subject Name Input */}
        <div>
          <label htmlFor="subjectName" className="block text-sm font-medium">Subject Name</label>
          <input
            id="subjectName"
            name="subjectName"
            type="text"
            value={subjectName}
            onChange={onSubjectNameChange}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          />
        </div>

        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded mr-2">Cancel</button>
          <button onClick={onUpdate} className="bg-blue-500 text-white px-4 py-2 rounded">Update</button>
        </div>
      </div>
    </div>
  );
};

// LessonList Component
const LessonList = () => {
  const [grades, setGrades] = useState([]);
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [lessons, setLessons] = useState([]); 
  const [subjects, setSubjects] = useState([]); 
  const [editingLesson, setEditingLesson] = useState(null);
  const [subjectImageFile, setSubjectImageFile] = useState(null);
  const [lessonName, setLessonName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [lessonToDelete, setLessonToDelete] = useState(null); 
  const [subjectImageUrl, setSubjectImageUrl] = useState('');
  const [isEditSubjectModalOpen, setIsEditSubjectModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');


  // Fetch Grades from Firestore
  const fetchGrades = async () => {
    try {
      const gradesRef = collection(db, 'Grades');
      const gradeDocs = await getDocs(gradesRef);
      const fetchedGrades = gradeDocs.docs.map(doc => doc.id);
      setGrades(fetchedGrades);
    } catch (error) {
      console.error('Error fetching grades: ', error);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);


  const fetchSubjects = async (grade) => {
    const subjectsRef = collection(db, grade);
    const subjectDocs = await getDocs(subjectsRef);
    const fetchedSubjects = subjectDocs.docs.map(doc => doc.id); 
    setSubjects(fetchedSubjects);
  };

  const fetchLessons = useCallback(async () => {
    if (grade && subject) {
      const docRef = doc(collection(db, grade), subject);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data(); 
        setLessons(data.lessonList || []); 
        setSubjectImageUrl(data.subjectImage); 
      } else {
        setLessons([]); 
        setSubjectImageUrl(''); 
      }
    }
  }, [grade, subject]);

  useEffect(() => {
    if (grade) fetchSubjects(grade);
  }, [grade]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setLessonName(lesson); 
    setSubjectImageFile(null);
    setIsEditModalOpen(true);
  };


  const handleDelete = (lesson) => {
    setLessonToDelete(lesson); 
    setIsModalOpen(true); 
  };


  const confirmDeleteLesson = async () => {
    if (!lessonToDelete) return;

    try {
      const updatedLessons = lessons.filter(lesson => lesson !== lessonToDelete);
      const docRef = doc(collection(db, grade), subject);

      await updateDoc(docRef, {
        lessonList: updatedLessons 
      });

      setLessons(updatedLessons);
      setIsModalOpen(false); 
      setLessonToDelete(null); 
    } catch (error) {
      console.error('Error deleting lesson: ', error);
    }
  };

  const confirmDeleteSubject = async () => {
    if (!grade || !subject) return;

    try {
      const subjectRef = doc(collection(db, grade), subject);
      await deleteDoc(subjectRef);  

      // Update state to remove the subject from the list
      setSubjects(subjects.filter(s => s !== subject)); 
      
      setSubject('');
      setLessons([]);
      setSubjectImageUrl('');
      
      setIsModalOpen(false);  
    } catch (error) {
      console.error('Error deleting subject: ', error);
    }
  };

  const handleUpdate = async () => {
    if (!editingLesson) return;

    try {
      let updatedLessons = [...lessons];
      let updatedImageUrl = subjectImageUrl;

      if (subjectImageFile) {
        const subjectImageRef = ref(storage, `subjects/${subjectImageFile.name}`);
        const snapshot = await uploadBytes(subjectImageRef, subjectImageFile);
        updatedImageUrl = await getDownloadURL(snapshot.ref);
      }

      updatedLessons = updatedLessons.map(lesson => lesson === editingLesson ? lessonName : lesson);
      const docRef = doc(collection(db, grade), subject);
      await updateDoc(docRef, {
        lessonList: updatedLessons,
        subjectImage: updatedImageUrl
      });

      setLessons(updatedLessons);
      setEditingLesson(null);
      setSubjectImageFile(null);
      setLessonName('');
      setSubjectImageUrl(updatedImageUrl);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating lesson: ', error);
    }
  };

  const updateSubjectName = async () => {
    if (!subject || !newSubjectName) return;

    try {
      const subjectRef = doc(collection(db, grade), subject);
      const subjectSnap = await getDoc(subjectRef);

      if (subjectSnap.exists()) {
        const subjectData = subjectSnap.data();

        // Create a new document with the new subject name
        const newSubjectRef = doc(collection(db, grade), newSubjectName);
        await setDoc(newSubjectRef, { ...subjectData, id: newSubjectName });

        // Delete the old document
        await deleteDoc(subjectRef);

        // Update state to reflect the new subject name
        setSubjects(subjects.map(s => (s === subject ? newSubjectName : s)));
        setSubject(newSubjectName); 
        setIsEditSubjectModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating subject: ', error);
    }
  };


  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Add Lesson Name</h2>
          <NavLink to="/add-lessons">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Lesson 
          </button>
          </NavLink>
        </div>

        {/* Select Grade */}
        <div>
          <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
          <select
            id="grade"
            name="grade"
            onChange={(e) => setGrade(e.target.value)}
            value={grade}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
          >
            <option value="">Select Grade</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>{grade}</option>
            ))}
          </select>
        </div>

        {/* Subject Select (Dropdown) */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
          <select
            id="subject"
            name="subject"
            onChange={(e) => setSubject(e.target.value)}
            value={subject}
            className="mt-1 p-2 block w-full border border-gray-300 rounded"
            disabled={!subjects.length}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Lessons List */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold">Lessons</h3>
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson} className="flex justify-between items-center py-2">
                <div className="mt-2">
                  <img src={subjectImageUrl} alt="Current Subject" className="max-w-12 h-12 rounded shadow mb-2" />
                </div>
                <span className='font-medium'>{lesson}</span>
                <div>
                  <button onClick={() => handleEdit(lesson)} className="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(lesson)} className="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        </div> 

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={lessonToDelete ? confirmDeleteLesson : confirmDeleteSubject}
          lessonName={lessonToDelete ? lessonToDelete : `the subject "${subject}"`}
        />

        {/* Edit Modal */}
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lessonName={lessonName}
          subjectImageUrl={subjectImageUrl}
          onLessonNameChange={(e) => setLessonName(e.target.value)}
          onImageChange={(e) => setSubjectImageFile(e.target.files[0])}
          onUpdate={handleUpdate}
        />

        {/* Edit Subject Modal */}
        <EditSubjectModal
          isOpen={isEditSubjectModalOpen}
          onClose={() => setIsEditSubjectModalOpen(false)}
          subjectName={newSubjectName}
          onSubjectNameChange={(e) => setNewSubjectName(e.target.value)}
          onUpdate={updateSubjectName}
        />
      </section>
    </section>
  );
};

export default LessonList;
