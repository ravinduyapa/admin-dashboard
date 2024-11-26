import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, doc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { db, storage } from '../../auth/Firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const AddLessons = () => {
  const [subjectImageFile, setSubjectImageFile] = useState(null);
  const [subjects, setSubjects] = useState([]);

  // Fetch subjects by grade
  const fetchSubjects = async (grade) => {
    try {
      const q = query(collection(db, 'subjects'), where('grade', '==', grade));
      const querySnapshot = await getDocs(q);
      const subjectsList = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log(`Subject: ${data.subjectName}, Stream: ${data.stream}`); 
        return {
          subjectName: data.subjectName,
          stream: data.stream,
        };
      });
      setSubjects(subjectsList);
    } catch (error) {
      console.error('Error fetching subjects: ', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      grade: '',
      subject: '',
      stream: '', 
      lessonName: '',
    },
    validationSchema: Yup.object({
      grade: Yup.string().required('Grade is required'),
      subject: Yup.string().required('Subject is required'),
      lessonName: Yup.string().max(100, 'Must be 100 characters or less').required('Lesson name is required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const docRef = doc(collection(db, values.grade), values.subject);
        const docSnap = await getDoc(docRef);
        let existingLessonList = docSnap.exists() ? docSnap.data().lessonList || [] : [];
        let subjectImageUrl = docSnap.exists() ? docSnap.data().subjectImage : '';

        if (!docSnap.exists() && !subjectImageFile) {
          toast.error('Subject image is required for the first lesson.');
          return;
        }

        if (!docSnap.exists()) {
          const subjectImageRef = ref(storage, `subjects/${subjectImageFile.name}`);
          const snapshot = await uploadBytes(subjectImageRef, subjectImageFile);
          subjectImageUrl = await getDownloadURL(snapshot.ref);
        }

        existingLessonList.push(values.lessonName);

        await setDoc(docRef, {
          lessonList: existingLessonList,
          subjectName: values.subject,
          subjectImage: subjectImageUrl,
          stream: values.stream, 
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

  useEffect(() => {
    if (formik.values.grade) fetchSubjects(formik.values.grade);
  }, [formik.values.grade]);

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <h2 className="text-4xl font-semibold mb-6">Add Lesson Name</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-4">
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
              {Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`).map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            {formik.touched.grade && formik.errors.grade ? (
              <div className="text-red-600 text-sm">{formik.errors.grade}</div>
            ) : null}
          </div>
          <div>
            <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
            <select
              id="subject"
              name="subject"
              onChange={(e) => {
                const selectedSubject = subjects.find(
                  (subject) => subject.subjectName === e.target.value
                );
                formik.setFieldValue('subject', selectedSubject?.subjectName || '');
                formik.setFieldValue('stream', selectedSubject?.stream || ''); 
              }}
              onBlur={formik.handleBlur}
              value={formik.values.subject}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
              disabled={!formik.values.grade}
            >
              <option value="">Select Subject</option>
              {subjects.map((subject) => (
                <option key={subject.subjectName} value={subject.subjectName}>
                  {subject.subjectName}
                </option>
              ))}
            </select>
            {formik.touched.subject && formik.errors.subject ? (
              <div className="text-red-600 text-sm">{formik.errors.subject}</div>
            ) : null}
            {formik.values.stream && (
              <p className="text-sm text-gray-600 mt-1">Selected Stream: {formik.values.stream}</p>
            )}
          </div>
          <div>
            <label htmlFor="subjectImage" className="block text-sm font-medium">Subject Image</label>
            <input
              id="subjectImage"
              name="subjectImage"
              type="file"
              accept="image/*"
              onChange={(event) => setSubjectImageFile(event.currentTarget.files[0])}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
          </div>
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
