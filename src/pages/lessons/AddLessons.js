import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'; 
import { db, storage } from '../../auth/Firebase'; 
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddLessons = () => {
  const [subjectImageFile, setSubjectImageFile] = useState(null); 

  const formik = useFormik({
    initialValues: {
      grade: '',
      subject: '',
      lessonName: '',
    },
    validationSchema: Yup.object({
      grade: Yup.string().required('Grade is required'),
      subject: Yup.string().required('Subject is required'),
      lessonName: Yup.string().max(100, 'Must be 100 characters or less').required('Lesson name is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        let subjectImageUrl = ''; 

        // Define the document reference using grade and subject
        const docRef = doc(collection(db, values.grade), values.subject);

        // Get existing document
        const docSnap = await getDoc(docRef);
        let existingLessonList = [];
        let subjectImageExists = false;

        if (docSnap.exists()) {
          // If document exists, retrieve the existing lessonList
          existingLessonList = docSnap.data().lessonList || [];
          
          // Check if subjectImage already exists for this subject
          subjectImageExists = docSnap.data().subjectImage ? true : false;
        }

        // Handle subject image upload if there's a file and no existing image
        if (subjectImageFile && !subjectImageExists) {
          const subjectImageRef = ref(storage, `subjects/${subjectImageFile.name}`);
          const snapshot = await uploadBytes(subjectImageRef, subjectImageFile);
          subjectImageUrl = await getDownloadURL(snapshot.ref);
        } else if (subjectImageExists) {
          subjectImageUrl = docSnap.data().subjectImage;
        }

        // Add new lesson directly as a string in the lessonList
        existingLessonList.push(values.lessonName); 

        // Create or update the document with the updated lessonList
        await setDoc(docRef, {
          lessonList: existingLessonList, 
          subjectName: values.subject, 
          subjectImage: subjectImageUrl, 
        }, { merge: true }); 

        toast.success('Lesson added successfully!');
        resetForm();
        setSubjectImageFile(null); 
      } catch (error) {
        console.error('Error adding document: ', error);
        toast.error('Failed to add lesson. Please try again.');
      }
    },
  });

  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <h2 className="text-4xl font-semibold mb-6">Add Lesson</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Select Grade */}
          <div>
            <label htmlFor="grade" className="block text-sm font-medium">Grade</label>
            <select
              id="grade"
              name="grade"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.grade}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {formik.touched.grade && formik.errors.grade ? (
              <div className="text-red-600 text-sm">{formik.errors.grade}</div>
            ) : null}
          </div>

          {/* Subject Input (Text Field) */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
            <input
              id="subject"
              name="subject"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.subject}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.subject && formik.errors.subject ? (
              <div className="text-red-600 text-sm">{formik.errors.subject}</div>
            ) : null}
          </div>

          {/* Subject Image Upload */}
          <div>
            <label htmlFor="subjectImage" className="block text-sm font-medium">Subject Image</label>
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

          {/* Lesson Name */}
          <div>
            <label htmlFor="lessonName" className="block text-sm font-medium">Lesson Name</label>
            <input
              id="lessonName"
              name="lessonName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lessonName}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.lessonName && formik.errors.lessonName ? (
              <div className="text-red-600 text-sm">{formik.errors.lessonName}</div>
            ) : null}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Lesson
          </button>
        </form>
      </section>
      <ToastContainer />
    </section>
  );
};

export default AddLessons;
