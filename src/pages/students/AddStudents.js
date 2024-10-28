import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { collection, doc, setDoc } from 'firebase/firestore'; 
import { db } from '../../auth/Firebase'; 
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'; 

const AddStudents = () => {
  const auth = getAuth(); 
  const [districts, setDistricts] = useState([]);

  useEffect(() => {
    const fetchDistricts = async () => {
      const districtList = [
        'Ampara',
        'Anuradhapura',
        'Badulla',
        'Batticaloa',
        'Colombo',
        'Galle',
        'Gampaha',
        'Hambantota',
        'Jaffna',
        'Kalutara',
        'Kandy',
        'Kegalle',
        'Kilinochchi',
        'Kurunegala',
        'Mannar',
        'Matale',
        'Matara',
        'Moneragala',
        'Nuwara Eliya',
        'Polonnaruwa',
        'Puttalam',
        'Ratnapura',
        'Trincomalee',
        'Vavuniya'
    ];    
      setDistricts(districtList);
    };
    
    fetchDistricts();
  }, []);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      birth: '',
      district: '',
      school: '',
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
      birth: Yup.date()
        .required('Required')
        .max(new Date(), 'Birthdate cannot be in the future'),
      district: Yup.string()
        .max(50, 'Must be 50 characters or less')
        .required('Required'),
      school: Yup.string()
        .max(50, 'Must be 50 characters or less')
        .required('Required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match') 
        .required('Required'),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        const email = `${values.phoneNumber}@example.com`; 
        
        await createUserWithEmailAndPassword(auth, email, values.password);
        const studentDoc = doc(collection(db, 'Student'), values.phoneNumber);
        await setDoc(studentDoc, {
          firstName: values.firstName,
          lastName: values.lastName,
          birth: values.birth,
          district: values.district,
          school: values.school,
          password: values.password,
          phoneNumber: values.phoneNumber, 
        });

        toast.success('Student added successfully!');
        resetForm(); 
      } catch (error) {
        console.error('Error adding student: ', error);
        toast.error('Failed to add student. Please try again.');
      }
    },
  });

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-6 md:p-10">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">Add Student</h2>
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
          <div className="flex flex-col">
            <label htmlFor="firstName" className="block text-sm font-medium">
              First Name
            </label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.firstName}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.firstName && formik.errors.firstName ? (
              <div className="text-red-600 text-sm">{formik.errors.firstName}</div>
            ) : null}
          </div>

          {/* Last Name */}
          <div className="flex flex-col">
            <label htmlFor="lastName" className="block text-sm font-medium">
              Last Name
            </label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.lastName}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.lastName && formik.errors.lastName ? (
              <div className="text-red-600 text-sm">{formik.errors.lastName}</div>
            ) : null}
          </div>

          {/* Phone Number */}
          <div className="flex flex-col">
            <label htmlFor="phoneNumber" className="block text-sm font-medium">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.phoneNumber}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
              <div className="text-red-600 text-sm">{formik.errors.phoneNumber}</div>
            ) : null}
          </div>

          {/* Birthdate */}
          <div className="flex flex-col">
            <label htmlFor="birth" className="block text-sm font-medium">
              Birthdate
            </label>
            <input
              id="birth"
              name="birth"
              type="date"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.birth}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.birth && formik.errors.birth ? (
              <div className="text-red-600 text-sm">{formik.errors.birth}</div>
            ) : null}
          </div>

           {/* District Dropdown */}
           <div className="flex flex-col">
              <label htmlFor="district" className="block text-sm font-medium">
                District
              </label>
              <select
                id="district"
                name="district"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.district}
                className="mt-1 p-2 block w-full border border-gray-300 rounded"
              >
                <option value="" label="Select district" />
                {districts.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
              {formik.touched.district && formik.errors.district ? (
                <div className="text-red-600 text-sm">{formik.errors.district}</div>
              ) : null}
          </div>


          {/* School */}
          <div className="flex flex-col">
            <label htmlFor="school" className="block text-sm font-medium">
              School
            </label>
            <input
              id="school"
              name="school"
              type="text"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.school}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.school && formik.errors.school ? (
              <div className="text-red-600 text-sm">{formik.errors.school}</div>
            ) : null}
          </div>

          {/* Password */}
          <div className="flex flex-col">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-600 text-sm">{formik.errors.password}</div>
            ) : null}
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.confirmPassword}
              className="mt-1 p-2 block w-full border border-gray-300 rounded"
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <div className="text-red-600 text-sm">{formik.errors.confirmPassword}</div>
            ) : null}
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              className=" bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add Student
            </button>
          </div>
        </form>
      </section>
      <ToastContainer />
    </section>
  );
};

export default AddStudents;
