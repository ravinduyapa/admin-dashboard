import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, doc, setDoc } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase'; 
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../auth/Firebase'; 

const AddTeachers = () => {
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      birthDate: '',
      school: '',
      district: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: Yup.object({
      firstName: Yup.string()
        .max(15, 'Must be 15 characters or less')
        .required('Required'),
      lastName: Yup.string()
        .max(20, 'Must be 20 characters or less')
        .required('Required'),
      phoneNumber: Yup.string()
        .matches(/^[0-9]+$/, 'Must be only digits')
        .min(10, 'Must be exactly 10 digits')
        .max(10, 'Must be exactly 10 digits')
        .required('Required'),
      birthDate: Yup.date()
        .required('Required')
        .max(new Date(), 'Birthdate cannot be in the future'),
      school: Yup.string()
        .max(50, 'Must be 50 characters or less')
        .required('Required'),
      district: Yup.string()
        .max(50, 'Must be 50 characters or less')
        .required('Required'),
      password: Yup.string()
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const email = `${values.phoneNumber}@example.com`; 
        await createUserWithEmailAndPassword(auth, email, values.password);
        const teacherDoc = doc(collection(db, 'Teacher'), values.phoneNumber);
        await setDoc(teacherDoc, {
          firstName: values.firstName,
          lastName: values.lastName,
          birthDate: values.birthDate,
          school: values.school,
          district: values.district,
          password: values.password, 
          email: email, 
        });
        
        toast.success('Teacher added successfully!');
        resetForm(); 
      } catch (error) {
        console.error('Error adding document: ', error);
        toast.error('Failed to add teacher. Please try again.');
      }
    },
  });

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <h2 className="text-4xl font-semibold mb-6">Add Teacher</h2>
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4">
          {/* Left column fields */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.firstName && formik.errors.firstName && (
              <div className="text-red-600 text-sm">{formik.errors.firstName}</div>
            )}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.lastName && formik.errors.lastName && (
              <div className="text-red-600 text-sm">{formik.errors.lastName}</div>
            )}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium">Phone Number</label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber && (
              <div className="text-red-600 text-sm">{formik.errors.phoneNumber}</div>
            )}
          </div>

          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium">Birth Date</label>
            <input
              id="birthDate"
              name="birthDate"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.birthDate}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.birthDate && formik.errors.birthDate && (
              <div className="text-red-600 text-sm">{formik.errors.birthDate}</div>
            )}
          </div>

          {/* Right column fields */}
          <div>
            <label htmlFor="school" className="block text-sm font-medium">School</label>
            <input
              id="school"
              name="school"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.school}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.school && formik.errors.school && (
              <div className="text-red-600 text-sm">{formik.errors.school}</div>
            )}
          </div>

          <div>
            <label htmlFor="district" className="block text-sm font-medium">District</label>
            <input
              id="district"
              name="district"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.district}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.district && formik.errors.district && (
              <div className="text-red-600 text-sm">{formik.errors.district}</div>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm">{formik.errors.password}</div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <div className="text-red-600 text-sm">{formik.errors.confirmPassword}</div>
            )}
          </div>

          {/* Submit Button spans both columns */}
          <div className="col-span-2">
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 ">
              Add Teacher
            </button>
          </div>
        </form>
      </section>
      <ToastContainer />
    </section>
  );
};

export default AddTeachers;
