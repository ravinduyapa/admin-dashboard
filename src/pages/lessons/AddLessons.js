import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, addDoc } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase';

const AddLessons = () => {
  const formik = useFormik({
    initialValues: {
      grade: '',
      subject: '',
      lessonName: '',
      description: '',
      link: '',
    },
    validationSchema: Yup.object({
      grade: Yup.string().required('Grade is required'),
      subject: Yup.string().required('Subject is required'),
      lessonName: Yup.string().max(100, 'Must be 100 characters or less').required('Lesson name is required'),
      description: Yup.string(),
      link: Yup.string().url('Invalid URL'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        // Add a new document to the "lessons" collection
        await addDoc(collection(db, 'lessons'), {
          grade: values.grade,
          subject: values.subject,
          lessonName: values.lessonName,
          description: values.description,
          link: values.link,
        });
        toast.success('Lesson added successfully!');
        resetForm();
      } catch (error) {
        console.error('Error adding document: ', error);
        toast.error('Failed to add lesson. Please try again.');
      }
    },
  });

  const subjects = [
    'Sinhala',
    'English',
    'Maths',
    'Science',
    'Buddhism',
    'History',
    'Tamil',
    'ICT',
    'Civic',
    'Health',
    'Geography',
    'Art',
    'Dancing',
    'Drama',
    'Western Music',
    'Eastern Music',
    'English Literature',
    'Sinhala Literature',
    'Media',
  ];

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

          {/* Select Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
            <select
              id="subject"
              name="subject"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.subject}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            {formik.touched.subject && formik.errors.subject ? (
              <div className="text-red-600 text-sm">{formik.errors.subject}</div>
            ) : null}
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

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">Description</label>
            <textarea
              id="description"
              name="description"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.description}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.description && formik.errors.description ? (
              <div className="text-red-600 text-sm">{formik.errors.description}</div>
            ) : null}
          </div>

          {/* Link */}
          <div>
            <label htmlFor="link" className="block text-sm font-medium">Link</label>
            <input
              id="link"
              name="link"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.link}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.link && formik.errors.link ? (
              <div className="text-red-600 text-sm">{formik.errors.link}</div>
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