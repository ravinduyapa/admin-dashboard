import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NavLink } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { collection, doc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../auth/Firebase';

const AddSubjects = () => {
  const [isAdvancedGrade, setIsAdvancedGrade] = useState(false);
  const [grades, setGrades] = useState([]);
  const [streams, setStreams] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradesCollectionRef = collection(db, 'Grades');
        const querySnapshot = await getDocs(gradesCollectionRef);
        const gradesList = querySnapshot.docs.map(doc => doc.id); 
        setGrades(gradesList);
      } catch (error) {
        console.error('Error fetching grades: ', error);
        toast.error('Failed to fetch grades. Please try again.');
      }
    };

    fetchGrades();
  }, []);

  const formik = useFormik({
    initialValues: {
      grade: '',
      stream: '',
      subject: '',
    },
    validate: (values) => {
      const errors = {};
      if (!values.grade) {
        errors.grade = 'Grade is required';
      }
      if (isAdvancedGrade && !values.stream) {
        errors.stream = 'Stream is required for Grade 12 and 13';
      }
      if (!values.subject) {
        errors.subject = 'Subject is required';
      }
      return errors;
    },
    onSubmit: async (values, { resetForm }) => {
      try {
        const formattedSubject =
          values.subject.charAt(0).toUpperCase() + values.subject.slice(1).toLowerCase();

        const subjectsCollectionRef = collection(db, 'subjects');
        const q = query(
          subjectsCollectionRef,
          where('subjectName', '==', formattedSubject),
          where('grade', '==', values.grade)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          toast.error(`The subject "${formattedSubject}" already exists for ${values.grade}!`);
          return;
        }

        const docRef = doc(
          subjectsCollectionRef,
          formattedSubject + '-' + values.grade + (values.stream ? `-${values.stream}` : '')
        );
        await setDoc(docRef, {
          subjectName: formattedSubject,
          grade: values.grade,
          stream: values.stream || null,
        });

        toast.success('Subject added successfully!');
        resetForm();
        setIsAdvancedGrade(false);
      } catch (error) {
        console.error('Error adding subject: ', error);
        toast.error('Failed to add subject. Please try again.');
      }
    },
  });

  const handleGradeChange = (e) => {
    const selectedGrade = e.target.value;
    formik.setFieldValue('grade', selectedGrade);

    if (selectedGrade === 'Grade 12' || selectedGrade === 'Grade 13') {
      setIsAdvancedGrade(true);
      setStreams([
        'PHYSICAL',
        'BIO',
        'COMMERCE',
        'ARTS',
        'TECHNOLOGY',
      ]); 
    } else {
      setIsAdvancedGrade(false);
      setStreams([]); 
      formik.setFieldValue('stream', ''); 
    }
  };

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Add Subject</h2>
          <NavLink to="/subject-list">
            <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Subject List
            </button>
          </NavLink>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="grade" className="block text-sm font-medium">
              Grade
            </label>
            <select
              id="grade"
              name="grade"
              onChange={handleGradeChange}
              onBlur={formik.handleBlur}
              value={formik.values.grade}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            >
              <option value="">Select Grade</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
            {formik.errors.grade && formik.touched.grade && (
              <div className="text-red-600 text-sm">{formik.errors.grade}</div>
            )}
          </div>

          {isAdvancedGrade && (
            <div>
              <label htmlFor="stream" className="block text-sm font-medium">
                Stream
              </label>
              <select
                id="stream"
                name="stream"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.stream}
                className="mt-1 p-2 block w-full border border-gray-300 rounded"
              >
                <option value="">Select Stream</option>
                {streams.map((stream) => (
                  <option key={stream} value={stream}>
                    {stream}
                  </option>
                ))}
              </select>
              {formik.errors.stream && formik.touched.stream && (
                <div className="text-red-600 text-sm">{formik.errors.stream}</div>
              )}
            </div>
          )}

          <div>
            <label htmlFor="subject" className="block text-sm font-medium">
              Subject
            </label>
            <input
              id="subject"
              name="subject"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.subject}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.errors.subject && formik.touched.subject && (
              <div className="text-red-600 text-sm">{formik.errors.subject}</div>
            )}
          </div>

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
