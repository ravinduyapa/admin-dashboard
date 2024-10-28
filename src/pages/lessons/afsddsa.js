import React, { useEffect, useState, useCallback } from 'react';
import { collection, doc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase'; 
import Sidebar from '../../components/Sidebar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../auth/Firebase'; 

// Modal Component for Delete Confirmation
const Modal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6">
        <h3 className="text-lg font-semibold">Confirm Delete</h3>
        <p>{message}</p>
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
        <h3 className="text-lg font-semibold">Edit Subject</h3>
        
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

// LessonList Component
const LessonList = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [lessons, setLessons] = useState([]); 
  const [subjects, setSubjects] = useState([]); 
  const [editingLesson, setEditingLesson] = useState(null);
  const [subjectImageFile, setSubjectImageFile] = useState(null);
  const [lessonName, setLessonName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [subjectImageUrl, setSubjectImageUrl] = useState('');
  const [deleteMode, setDeleteMode] = useState(null); 

  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

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

  const handleEdit = () => {
    setEditingLesson(subject);
    setIsEditModalOpen(true);
  };

  const handleDeleteLesson = (lesson) => {
    setLessonName(lesson); 
    setDeleteMode('lesson');
    setModalMessage(`Are you sure you want to delete the lesson "${lesson}"?`);
    setIsModalOpen(true); 
  };

  const handleDeleteSubject = () => {
    setDeleteMode('subject');
    setModalMessage(`Are you sure you want to delete the entire subject "${subject}"?`);
    setIsModalOpen(true); 
  };

  const confirmDelete = async () => {
    try {
      const docRef = doc(collection(db, grade), subject);
      if (deleteMode === 'lesson' && lessonName) {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          const updatedLessons = data.lessonList.filter(lesson => lesson !== lessonName);
          await updateDoc(docRef, { lessonList: updatedLessons });
          setLessons(updatedLessons);
        }
      } else if (deleteMode === 'subject') {
        await deleteDoc(docRef);
        setLessons([]);
        setSubjectImageUrl('');
        setSubject('');
      }
      setIsModalOpen(false);
      setLessonName('');
    } catch (error) {
      console.error(`Error deleting ${deleteMode}: `, error);
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

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <h2 className="text-4xl font-semibold mb-6">Lesson List</h2>

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
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Lesson List */}
        <div className="mt-4">
          <h3 className="text-2xl font-semibold">Lessons:</h3>
          {lessons.map((lesson) => (
            <div key={lesson} className="flex items-center justify-between p-2 bg-gray-100 rounded mb-2">
              <span>{lesson}</span>
              <div>  
                <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded mr-4">Edit Subject</button>
                <button onClick={() => handleDeleteLesson(lesson)} className="bg-red-500 text-white px-2 py-1 rounded">Delete Lesson</button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit and Delete Subject Buttons */}
        {grade && subject && (
          <div className="mt-4">
            <button onClick={handleDeleteSubject} className="bg-red-500 text-white px-4 py-2 rounded">Delete Subject</button>
          </div>
        )}

        {/* Modals */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          message={modalMessage}
        />
        <EditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          lessonName={lessonName}
          subjectImageUrl={subjectImageUrl}
          onLessonNameChange={(e) => setLessonName(e.target.value)}
          onImageChange={(e) => setSubjectImageFile(e.target.files[0])}
          onUpdate={handleUpdate}
        />
      </section>
    </section>
  );
};

export default LessonList;
