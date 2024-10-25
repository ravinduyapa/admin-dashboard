import React, { useEffect, useState, useCallback } from 'react';
import { collection, doc, getDoc, updateDoc, getDocs } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase'; 
import Sidebar from '../../components/Sidebar';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 
import { storage } from '../../auth/Firebase'; 

// Modal Component
const Modal = ({ isOpen, onClose, onConfirm, lessonName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg p-6">
        <h3 className="text-lg font-semibold">Confirm Delete</h3>
        <p>Are you sure you want to delete the lesson "{lessonName}"?</p>
        <div className="flex justify-end mt-4">
          <button onClick={onClose} className="bg-gray-300 px-4 py-2 rounded mr-2">Cancel</button>
          <button onClick={onConfirm} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
        </div>
      </div>
    </div>
  );
};

const LessonList = () => {
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [lessons, setLessons] = useState([]); 
  const [subjects, setSubjects] = useState([]); 
  const [editingLesson, setEditingLesson] = useState(null);
  const [subjectImageFile, setSubjectImageFile] = useState(null);
  const [lessonName, setLessonName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [lessonToDelete, setLessonToDelete] = useState(null); 
  const [subjectImageUrl, setSubjectImageUrl] = useState('');

  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

  const fetchSubjects = async (grade) => {
    const subjectsRef = collection(db, grade);
    const subjectDocs = await getDocs(subjectsRef);
    const fetchedSubjects = subjectDocs.docs.map(doc => doc.id); 
    setSubjects(fetchedSubjects);
    console.log('Fetched subjects for grade', grade, ':', fetchedSubjects);
  };

  const fetchLessons = useCallback(async () => {
    if (grade && subject) {
      const docRef = doc(collection(db, grade), subject);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data(); 
        const lessonList = data.lessonList || [];
        setLessons(lessonList); 
        setSubjectImageUrl(data.subjectImage); 
        console.log('Fetched document data:', data);
      } else {
        console.log('No document found for this grade and subject');
        setLessons([]); 
        setSubjectImageUrl(''); 
      }
    }
  }, [grade, subject]);

  useEffect(() => {
    if (grade) {
      fetchSubjects(grade); 
    }
  }, [grade]);

  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setLessonName(lesson); 
    setSubjectImageFile(null);
  };

  const handleDelete = (lesson) => {
    setLessonToDelete(lesson); 
    setIsModalOpen(true); 
  };

  const confirmDelete = async () => {
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

  const handleUpdate = async () => {
    if (!editingLesson) return;

    try {
      let updatedLessons = [...lessons];
      
      // Handle subject image upload
      let subjectImageUrl = editingLesson.subjectImage; 
      if (subjectImageFile) {
        const subjectImageRef = ref(storage, `subjects/${subjectImageFile.name}`);
        const snapshot = await uploadBytes(subjectImageRef, subjectImageFile);
        subjectImageUrl = await getDownloadURL(snapshot.ref);
        console.log('Uploaded subject image URL:', subjectImageUrl);
      }

      // Update the lesson name in the array
      updatedLessons = updatedLessons.map(lesson => lesson === editingLesson ? lessonName : lesson);

      const docRef = doc(collection(db, grade), subject);
      await updateDoc(docRef, {
        lessonList: updatedLessons 
      });

      setLessons(updatedLessons);
      setEditingLesson(null);
      setSubjectImageFile(null);
      setLessonName('');
      setSubjectImageUrl(subjectImageUrl); 
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
            disabled={!subjects.length}
          >
            <option value="">Select Subject</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>

        {/* Display Selected Subject Image */}
        {subjectImageUrl && (
          <div className="mt-4">
            <h3 className="text-xl font-semibold mb-2">Subject Image:</h3>
            <img src={subjectImageUrl} alt="Subject" className="max-w-12 h-12 rounded shadow" />
          </div>
        )}

        {/* Lesson List Display */}
        <div className="mt-4">
          {lessons.length > 0 ? (
            <ul>
              {lessons.map((lesson, index) => (
                <li key={index} className="border-b py-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="font-medium">Lesson Name:</span> 
                    <span className="ml-4 font-bold text-red-500">{lesson}</span> 
                  </div>
                  <div>
                    <button onClick={() => handleEdit(lesson)} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 mr-2">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(lesson)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No lessons found for this grade and subject.</p>
          )}
        </div>

        {/* Edit Lesson Section */}
        {editingLesson && (
          <div className="mt-6">
            <h3 className="text-2xl font-semibold mb-4">Edit Lesson</h3>
            <div>
              <label htmlFor="lessonName" className="block text-sm font-medium">Lesson Name</label>
              <input
                id="lessonName"
                name="lessonName"
                type="text"
                value={lessonName}
                onChange={(e) => setLessonName(e.target.value)}
                className="mt-1 p-2 block w-full border border-gray-300 rounded"
              />
            </div>
            <div>
              <label htmlFor="subjectImage" className="block text-sm font-medium">Subject Image</label>
              {editingLesson && (
                <div className="mt-2">
                  <img src={subjectImageUrl} alt="Current Subject" className="max-w-12 h-12 rounded shadow mb-2" />
                </div>
              )}
              <input
                id="subjectImage"
                name="subjectImage"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  setSubjectImageFile(event.currentTarget.files[0]); 
                }}
                className="mt-1 p-2 block w-full border border-gray-300 rounded"
              />
            </div>

            <button
              onClick={handleUpdate}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
            >
              Update Lesson
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={confirmDelete}
          lessonName={lessonToDelete || ''}
        />
      </section>
    </section>
  );
};

export default LessonList;
