import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../auth/Firebase';
import { getAuth, deleteUser, signInWithEmailAndPassword } from 'firebase/auth';

const TeachersList = () => {
  const [teachers, setTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [districts, setDistricts] = useState([]);

  //Fetch Distrct
  useEffect(() => {
    const fetchDistricts = async () => {
      const districtList = [
        'Colombo',
        'Gampaha',
        'Kandy',
        'Matara',
        'Jaffna',
      ];
      setDistricts(districtList);
    };
    
    fetchDistricts();
  }, []);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch teachers from Firestore
  const fetchTeachers = async () => {
    try {
      const collectionName = 'Teacher';
      const querySnapshot = await getDocs(collection(db, collectionName));
      const teachersData = querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data(),
      }));

      setTeachers(teachersData);
      setFilteredTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers: ', error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle search input change
  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);

    if (value === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter((teacher) =>
        `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }

    // Reset to the first page when searching
    setCurrentPage(1);
  };

  // Handle edit button click
  const handleEditClick = (teacher) => {
    setSelectedTeacher(teacher);
    setIsModalOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = (teacher) => {
    setTeacherToDelete(teacher);
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
    if (teacherToDelete) {
      try {
        const email = `${teacherToDelete.id}@example.com`;
        await deleteAuthUser(email, teacherToDelete.password);
        await deleteDoc(doc(db, 'Teacher', teacherToDelete.id));
        fetchTeachers();
        setIsDeleteModalOpen(false);
        setTeacherToDelete(null);
      } catch (error) {
        console.error('Error deleting teacher:', error);
      }
    }
  };

  // Update teacher data
  const handleUpdate = async () => {
    if (selectedTeacher) {
      try {
        const teacherDoc = doc(db, 'Teacher', selectedTeacher.id); 
        await updateDoc(teacherDoc, {
          firstName: selectedTeacher.firstName,
          lastName: selectedTeacher.lastName,
          birth: selectedTeacher.birth,
          school: selectedTeacher.school,
          district: selectedTeacher.district,
        });
        setIsModalOpen(false);
        setSelectedTeacher(null);
        await fetchTeachers(); 
      } catch (error) {
        console.error('Error updating teacher: ', error);
      }
    }
  };

  // Handle input changes in the edit modal
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setSelectedTeacher({ ...selectedTeacher, [name]: value });
  };

  // Calculate the current teachers to display
  const indexOfLastTeacher = currentPage * itemsPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - itemsPerPage;
  const currentTeachers = filteredTeachers.slice(indexOfFirstTeacher, indexOfLastTeacher);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTeachers.length / itemsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Teachers List</h2>
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
                {filteredTeachers.map((teacher) => (
                  <li
                    key={teacher.id}
                    onClick={() => setSearchTerm(`${teacher.firstName} ${teacher.lastName}`)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-200"
                  >
                    {teacher.firstName} {teacher.lastName}
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
                <th className="px-6 py-3 border-b">Name</th>
                <th className="px-6 py-3 border-b">Birthdate</th>
                <th className="px-6 py-3 border-b">Phone Number</th>
                <th className="px-6 py-3 border-b">School</th>
                <th className="px-6 py-3 border-b">District</th>
                <th className="px-6 py-3 border-b">Action</th>
              </tr>
            </thead>
            <tbody>
              {currentTeachers.map((teacher, index) => (
                <tr key={teacher.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="px-6 py-4 border-b">{teacher.firstName} {teacher.lastName}</td>
                  <td className="px-6 py-4 border-b">{teacher.birth}</td>
                  <td className="px-6 py-4 border-b">{teacher.id}</td> 
                  <td className="px-6 py-4 border-b">{teacher.school}</td>
                  <td className="px-6 py-4 border-b">{teacher.district}</td>
                  <td className="px-6 py-4 border-b">
                    <button
                      onClick={() => handleEditClick(teacher)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(teacher)}
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

        {/* Pagination Controls - only show if there are more than itemsPerPage */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Previous
            </button>
            <span>{`Page ${currentPage} of ${totalPages}`}</span>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
            >
              Next
            </button>
          </div>
        )}
      </section>

      {/* Edit Teacher Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Teacher</h2>
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                name="firstName"
                value={selectedTeacher?.firstName || ''}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={selectedTeacher?.lastName || ''}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Birth Date</label>
              <input
                type="date"
                name="birth"
                value={selectedTeacher?.birth || ''}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-2">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={selectedTeacher?.id || ''}
                onChange={handleInputChange}
                readOnly
                className="border border-gray-300 p-2 w-full rounded"
              />
            </div>
            <div>
              <label className="block mb-2">School</label>
              <input
                type="text"
                name="school"
                value={selectedTeacher?.school || ''}
                onChange={handleInputChange}
                className="border border-gray-300 p-2 w-full rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">District</label>
               <select
                type="text"
                name="district"
                value={selectedTeacher.district}
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
            <div className="flex justify-start mt-4">
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

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Delete Teacher</h2>
            <p>Are you sure you want to delete {teacherToDelete?.firstName} {teacherToDelete?.lastName}?</p>
            <div className="flex justify-end mt-4">
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

export default TeachersList;
