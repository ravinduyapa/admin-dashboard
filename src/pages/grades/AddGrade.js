import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { storage } from '../../auth/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../auth/Firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AddGrade = () => {
  const [grade, setGrade] = useState('');
  const [gradeImageFile, setGradeImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!grade) {
      newErrors.grade = 'Grade is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
  
    if (!validate()) {
      return;
    }
  
    try {
      // Remove 'Grade ' prefix and save the grade directly
      const gradeDocId = grade;  
      const docRef = doc(db, 'Grades', gradeDocId);
      const docSnap = await getDoc(docRef);
  
      let gradeImageUrl = '';
  
      if (gradeImageFile) {
        const gradeImageRef = ref(storage, `grades/${gradeImageFile.name}`);
        const snapshot = await uploadBytes(gradeImageRef, gradeImageFile);
        gradeImageUrl = await getDownloadURL(snapshot.ref);
      }
  
      if (docSnap.exists()) {
        toast.error('This grade already exists.');
        return;
      }
  
      // Save to the 'Grades' collection
      await setDoc(docRef, {
        gradeImg: gradeImageUrl,
      });
  
      // Save to the 'Years' collection with the grade name as the document ID
      const yearDocRef = doc(db, 'Years', gradeDocId); 
      await setDoc(yearDocRef, {
        gradeImg: gradeImageUrl,
      });
  
      toast.success('Grade added successfully!');
  
      // Reset form fields
      setGrade('');
      setGradeImageFile(null);
      setErrors({});
    } catch (error) {
      console.error('Error adding grade: ', error);
      toast.error('Failed to add grade. Please try again.');
    }
  };
  
  
  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Add Grade</h2>
          <Link to="/grades-list" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
            Grades List
          </Link>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
            <input
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {errors.grade && <div className="text-red-600 text-sm">{errors.grade}</div>}
          </div>
          <div>
            <label htmlFor="gradeImage" className="block text-sm font-medium">Grade Image</label>
            <input
              id="gradeImage"
              type="file"
              accept="image/*"
              onChange={(e) => setGradeImageFile(e.target.files[0])}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Grade
          </button>
        </form>
      </section>
      <ToastContainer />
    </section>
  );
};

export default AddGrade;
