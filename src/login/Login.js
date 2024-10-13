import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

const Login = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: '', 
      password: '',
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Username is required'), 
      password: Yup.string().required('Password is required'),
    }),
    onSubmit: (values) => {
      const { username, password } = values;

      // Check if the hardcoded username and password match
      if (username === 'admin' && password === 'adminadmin') {
        sessionStorage.setItem('authToken', 'dummy-token');
        sessionStorage.setItem('userId', 'admin');

        toast.success('Login successful!');
        navigate('/dashboard'); 
      } else {
        toast.error('Login failed. Please check your credentials.');
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-4xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={formik.handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 font-semibold">Username</label>
            <input
              id="username"
              name="username"
              type="text" 
              className={`mt-1 p-2 w-full border ${
                formik.touched.username && formik.errors.username ? 'border-red-500' : 'border-gray-300'
              } rounded`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.username}
            />
            {formik.touched.username && formik.errors.username ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.username}</div>
            ) : null}
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-semibold">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              className={`mt-1 p-2 w-full border ${
                formik.touched.password && formik.errors.password ? 'border-red-500' : 'border-gray-300'
              } rounded`}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
            ) : null}
          </div>

          <div className="flex justify-center mb-4">
            <button type="submit" className="bg-blue-900 text-white px-4 py-2 rounded hover:bg-blue-400">
              Login
            </button>
          </div>
        </form>
      </div>

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default Login;
