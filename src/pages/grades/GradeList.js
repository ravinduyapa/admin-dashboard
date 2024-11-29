import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { db, storage } from '../../auth/Firebase'; 
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Modal from 'react-modal';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; 

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [gradeToEdit, setGradeToEdit] = useState(null);
  const [newGradeName, setNewGradeName] = useState('');
  const [newGradeImage, setNewGradeImage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null); 

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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

  const openEditModal = (grade) => {
    setGradeToEdit(grade);
    setNewGradeName(grade.id); 
    setNewGradeImage(grade.gradeImg || ''); 
    setSelectedImage(null); 
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setGradeToEdit(null);
  };

  const handleEdit = async () => {
    if (gradeToEdit) {
      try {
        let imageUrl = newGradeImage;

        // If there's a new image selected, upload it to Firebase Storage
        if (selectedImage) {
          const imageRef = ref(storage, `grades/${selectedImage.name}`);
          await uploadBytes(imageRef, selectedImage);
          imageUrl = await getDownloadURL(imageRef); 
        }

        const gradeDoc = doc(db, 'Grades', gradeToEdit.id);
        await updateDoc(gradeDoc, {
          id: newGradeName,
        });

        if (imageUrl) {
          const yearDoc = doc(db, 'Years', gradeToEdit.id);
          await updateDoc(yearDoc, { gradeImg: imageUrl });
        }

        setGrades((prevGrades) =>
          prevGrades.map((grade) =>
            grade.id === gradeToEdit.id ? { ...grade, id: newGradeName, gradeImg: imageUrl } : grade
          )
        );

        closeEditModal();
      } catch (error) {
        console.error('Error updating grade:', error);
      }
    }
  };

  // Pagination logic
  const indexOfLastGrade = currentPage * itemsPerPage;
  const indexOfFirstGrade = indexOfLastGrade - itemsPerPage;
  const currentGrades = grades.slice(indexOfFirstGrade, indexOfLastGrade);
  const totalPages = Math.ceil(grades.length / itemsPerPage);

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
              {currentGrades.map((grade, index) => (
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
                      onClick={() => openEditModal(grade)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 mr-2"
                    >
                      Edit
                    </button>
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

        {/* Pagination Controls */}
        <div className="flex justify-between items-center mt-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1} 
            className={`bg-gray-300 text-gray-700 px-4 py-2 rounded ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages} 
            className={`bg-gray-300 text-gray-700 px-4 py-2 rounded ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onRequestClose={closeEditModal}
          contentLabel="Edit Grade"
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Edit Grade</h2>
            <div>
              <label htmlFor="gradeName" className="block mb-2">Grade Name</label>
              <input
                type="text"
                id="gradeName"
                value={newGradeName}
                onChange={(e) => setNewGradeName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded mb-4"
              />
            </div>
            <div>
              <label htmlFor="gradeImage" className="block mb-2">Grade Image</label>
              <input
                type="file"
                id="gradeImage"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files[0])}
                className="mb-4"
              />
              {newGradeImage && !selectedImage && (
                <div className="mb-4">
                  <img
                    src={newGradeImage}
                    alt=""
                    className="w-32 h-32 object-cover"
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleEdit} 
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2"
              >
                Save Changes
              </button>
              <button 
                onClick={closeEditModal} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Grade"
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this grade?</h2>
            <div className="flex justify-end">
              <button 
                onClick={handleDelete} 
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 mr-2"
              >
                Yes, Delete
              </button>
              <button 
                onClick={closeDeleteModal} 
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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
