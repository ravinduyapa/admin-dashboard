import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar'; 
import { storage } from '../../auth/Firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../auth/Firebase'; // Ensure Firestore is imported
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions

const AddGrade = () => {
  const [grade, setGrade] = useState('');
  const [stream, setStream] = useState('');
  const [gradeImageFile, setGradeImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!grade) {
      newErrors.grade = 'Grade is required';
    }
    if (grade === '12' && !stream) {
      newErrors.stream = 'Stream is required when Grade 12 is selected';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      return; // If validation fails, do not submit
    }

    try {
      // Format the document ID as "Grade 1", "Grade 2", etc.
      const gradeDocId = `Grade ${grade}`;

      // Check if the document already exists
      const docRef = doc(db, 'Grades', gradeDocId);
      const docSnap = await getDoc(docRef);

      let gradeImageUrl = '';

      // Upload image to Firebase Storage and get the URL
      if (gradeImageFile) {
        const gradeImageRef = ref(storage, `grades/${gradeImageFile.name}`);
        const snapshot = await uploadBytes(gradeImageRef, gradeImageFile);
        gradeImageUrl = await getDownloadURL(snapshot.ref);
      }

      if (docSnap.exists()) {
        // Document exists, update the streams for this grade
        const existingData = docSnap.data();
        
        // Check if the stream already exists
        if (existingData.streams && existingData.streams.includes(stream)) {
          toast.error('This stream already exists for the selected grade.');
          return; // Prevent adding the same stream
        }

        // Update the document to add the new stream
        await updateDoc(docRef, {
          streams: existingData.streams ? [...existingData.streams, stream] : [stream],
        });

        toast.success('Stream added successfully to existing grade!');
      } else {
        // Save the grade image URL to Firestore in the Years collection
        await setDoc(doc(db, 'Years', gradeDocId), {
          gradeImg: gradeImageUrl, // Save image path in Years collection
        });

        // Save the grade and stream in the Grades collection
        await setDoc(docRef, {
          streams: grade === '12' ? [stream] : [], // Initialize streams array if grade is 12
        });

        toast.success('Grade added successfully!');
      }

      // Reset form
      setGrade('');
      setStream('');
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
        <h2 className="text-4xl font-semibold mb-6">Add Grade</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                if (e.target.value !== '12') {
                  setStream(''); // Clear stream if not Grade 12
                }
              }}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            >
              <option value="">Select Grade</option>
              {Array.from({ length: 11 }, (_, i) => (i + 1)).map((g) => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
              <option value="12">Grade 12</option>
            </select>
            {errors.grade && <div className="text-red-600 text-sm">{errors.grade}</div>}
          </div>
          {grade === '12' && (
            <div>
              <label htmlFor="stream" className="block text-sm font-medium">Stream</label>
              <input
                id="stream"
                type="text"
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="mt-1 p-2 block w-full border border-gray-300 rounded"
              />
              {errors.stream && <div className="text-red-600 text-sm">{errors.stream}</div>}
            </div>
          )}
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
