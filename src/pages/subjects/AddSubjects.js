import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase';

const AddSubjects = () => {
  const formik = useFormik({
    initialValues: {
      grade: '',
      subject: '',
    },
    validationSchema: Yup.object({
      grade: Yup.string().required('Grade is required'),
      subject: Yup.string().required('Subject is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Format the subject to capitalize only the first letter
        const formattedSubject = values.subject.charAt(0).toUpperCase() + values.subject.slice(1).toLowerCase();

        // Reference the centralized "subjects" collection
        const subjectsCollectionRef = collection(db, 'subjects');

        // Query Firestore to check if this subject already exists (case-insensitive) for this grade
        const q = query(subjectsCollectionRef, where('subjectName', '==', formattedSubject), where('grade', '==', values.grade));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.error(`The subject "${formattedSubject}" already exists for Grade ${values.grade}!`);
          return;
        }

        // Create or update the document with subjectName and grade
        const docRef = doc(subjectsCollectionRef, formattedSubject + '-' + values.grade); 
        await setDoc(docRef, {
          subjectName: formattedSubject,
          grade: values.grade,
        });

        toast.success('Subject added successfully!');
        resetForm();
      } catch (error) {
        console.error('Error adding subject: ', error);
        toast.error('Failed to add subject. Please try again.');
      }
    },
  });

  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <h2 className="text-4xl font-semibold mb-6">Add Subject</h2>
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

          {/* Subject Input */}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Subject
          </button>
        </form>
      </section>
      <ToastContainer />
    </section>
  );
};

export default AddSubjects;
