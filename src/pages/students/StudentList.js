import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/Firebase';

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    const fetchStudents = async () => {
      const querySnapshot = await getDocs(collection(db, 'Student'));
      const studentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
      setFilteredStudents(studentsData);
    };

    fetchStudents();
  }, []);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter((student) =>
        student.id.toLowerCase().includes(value.toLowerCase())
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

  const handleDeleteConfirm = async () => {
    if (studentToDelete) {
      await deleteDoc(doc(db, 'Student', studentToDelete.id));
      setStudents(students.filter((student) => student.id !== studentToDelete.id));
      setFilteredStudents(filteredStudents.filter((student) => student.id !== studentToDelete.id));
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault(); 
    const studentDoc = doc(db, 'Student', selectedStudent.id);
    await updateDoc(studentDoc, {
      birthDate: selectedStudent.birthDate,
      phoneNumber: selectedStudent.phoneNumber, 
      school: selectedStudent.school,
      district: selectedStudent.district,
    });
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedStudent({ ...selectedStudent, [name]: value });
  };

  // Calculate the number of pages
  const totalPages = Math.ceil(filteredStudents.length / rowsPerPage);

  // Get current rows to display
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
              placeholder="Search by phone number"
              value={searchTerm}
              onChange={handleSearchChange}
              className="px-4 py-2 border border-teal-600 rounded-lg shadow-sm w-72"
            />
            {searchTerm && (
              <ul className="absolute bg-white border border-gray-300 mt-1 rounded-lg shadow-lg w-72 max-h-48 overflow-y-auto z-10">
                {filteredStudents.map((student) => (
                  <li
                    key={student.id}
                    onClick={() => setSearchTerm(student.id)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    {student.id}
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
                <th className="px-6 py-3 border-b text-left">Phone Number</th>
                <th className="px-6 py-3 border-b text-left">Birthdate</th>
                <th className="px-6 py-3 border-b text-left">School</th>
                <th className="px-6 py-3 border-b text-left">District</th>
                <th className="px-6 py-3 border-b text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.map((student, index) => (
                <tr
                  key={student.id}
                  className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                >  
                  <td className="px-6 py-4 border-b">{student.id}</td>
                  <td className="px-6 py-4 border-b">{student.birthDate}</td>
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
              <label className="block text-gray-700 font-bold mb-2">Birthdate</label>
              <input
                type="date"
                name="birthDate"
                value={selectedStudent.birthDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={selectedStudent.phoneNumber}
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
              <input
                type="text"
                name="district"
                value={selectedStudent.district}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Student</h2>
            <p>Are you sure you want to delete this student?</p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
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
