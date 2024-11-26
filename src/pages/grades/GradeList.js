import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { db } from '../../auth/Firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import Modal from 'react-modal';

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        const gradesCollection = collection(db, 'Grades');
        const gradesSnapshot = await getDocs(gradesCollection);
        const gradesData = gradesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const yearsCollection = collection(db, 'Years');
        const yearsSnapshot = await getDocs(yearsCollection);
        const yearsData = yearsSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});

        // Combine data and ensure the grade image URL is fetched correctly
        const combinedData = gradesData.map((grade) => {
          const gradeImage = yearsData[grade.id] ? yearsData[grade.id].gradeImg : null;
          return {
            ...grade,
            gradeImg: gradeImage,
          };
        });

        setGrades(combinedData);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchGrades();
  }, []);

  const openDeleteModal = (grade) => {
    setGradeToDelete(grade);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setGradeToDelete(null);
  };

  const handleDelete = async () => {
    if (gradeToDelete) {
      try {
        await deleteDoc(doc(db, 'Grades', gradeToDelete.id));
        const yearDoc = doc(db, 'Years', gradeToDelete.id);
        await deleteDoc(yearDoc);
        setGrades(grades.filter((grade) => grade.id !== gradeToDelete.id));
        closeDeleteModal();
      } catch (error) {
        console.error('Error deleting grade:', error);
      }
    }
  };

  return (
    <section className="w-full flex h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Grades List</h2>
          <Link
            to="/add-grade"
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Grade
          </Link>
        </div>
        <div className="overflow-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-6 py-3 border-b text-left">Grade</th>
                <th className="px-6 py-3 border-b text-left">Grade Image</th>
                <th className="px-6 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr
                  key={grade.id}
                  className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}
                >
                  <td className="border-b p-4">{grade.id}</td>
                  <td className="border-b p-4">
                    {grade.gradeImg ? (
                      <img
                        src={grade.gradeImg}
                        alt={`Grade ${grade.id}`}
                        className="w-16 h-16"
                      />
                    ) : (
                      'No image available'
                    )}
                  </td>
                  <td className="border-b p-4">
                    <button
                      onClick={() => openDeleteModal(grade)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Confirmation"
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to delete this grade?
            </h2>
            <p>{gradeToDelete?.id}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={closeDeleteModal}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </section>
    </section>
  );
};

export default GradeList;
