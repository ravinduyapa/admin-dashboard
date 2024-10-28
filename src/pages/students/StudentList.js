import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/Firebase';
import { getAuth, deleteUser, signInWithEmailAndPassword } from 'firebase/auth';


const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
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
  
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const querySnapshot = await getDocs(collection(db, 'Student'));
    const studentsData = querySnapshot.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      };
    });
    setStudents(studentsData);
    setFilteredStudents(studentsData);
  };
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
    setCurrentPage(1);
  };

  const handleEditClick = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
  };

  // Delete user from Firebase Authentication
  const deleteAuthUser = async (email, password) => {
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await deleteUser(userCredential.user);
    } catch (error) {
      console.error('Error deleting user from Firebase Auth:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      try {
        const email = `${studentToDelete.id}@example.com`;
        await deleteAuthUser(email, studentToDelete.password);
        await deleteDoc(doc(db, 'Student', studentToDelete.id));
        fetchStudents();
        setIsDeleteModalOpen(false);
        setStudentToDelete(null);
      } catch (error) {
        console.error('Error deleting student:', error);
      }
    }
  };
  

  const handleUpdate = async (event) => {
    event.preventDefault();
    const studentDoc = doc(db, 'Student', selectedStudent.id);
    await updateDoc(studentDoc, {
      firstName: selectedStudent.firstName,
      lastName: selectedStudent.lastName,
      birth: selectedStudent.birth,
      school: selectedStudent.school,
      district: selectedStudent.district,
    });
    setIsModalOpen(false);
    setSelectedStudent(null);
    fetchStudents(); 
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedStudent({ ...selectedStudent, [name]: value });
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);
  const indexOfLastStudent = currentPage * rowsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - rowsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Students List</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by full name"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-teal-600 rounded-lg shadow-sm w-72"
            />
            {searchTerm && (
              <ul className="absolute bg-white border border-gray-300 mt-1 rounded-lg shadow-lg w-72 max-h-48 overflow-y-auto z-10">
                {filteredStudents.map((student) => (
                  <li
                    key={student.id}
                    onClick={() => setSearchTerm(`${student.firstName} ${student.lastName}`)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    {student.firstName} {student.lastName}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 border-b text-left">Name</th>
                <th className="px-6 py-3 border-b text-left">Birthdate</th>
                <th className="px-6 py-3 border-b text-left">Phone Number</th>
                <th className="px-6 py-3 border-b text-left">School</th>
                <th className="px-6 py-3 border-b text-left">District</th>
                <th className="px-6 py-3 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr key={student.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="px-6 py-4 border-b">{student.firstName} {student.lastName}</td>
                  <td className="px-6 py-4 border-b">{student.birth}</td>
                  <td className="px-6 py-4 border-b">{student.id}</td>
                  <td className="px-6 py-4 border-b">{student.school}</td>
                  <td className="px-6 py-4 border-b">{student.district}</td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => handleEditClick(student)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(student)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="self-center">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Student</h2>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={selectedStudent.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={selectedStudent.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Birth Date</label>
              <input
                type="date"
                name="birth"
                value={selectedStudent.birth}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={selectedStudent.id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">School</label>
              <input
                type="text"
                name="school"
                value={selectedStudent.school}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">District</label>
               <select
                type="text"
                name="district"
                value={selectedStudent.district}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              >
                <option value="" label="Select district" />
                {districts.map((district, index) => (
                  <option key={index} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p>Are you sure you want to delete this student?</p>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default StudentList;
