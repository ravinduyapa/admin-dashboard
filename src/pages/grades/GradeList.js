import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { db } from '../../auth/Firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Modal from 'react-modal';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import storage functions

const GradeList = () => {
  const [grades, setGrades] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState({ id: '', streams: [], gradeImg: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [gradeToDelete, setGradeToDelete] = useState(null);
  const [newImage, setNewImage] = useState(null); // State to hold the new image

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

        const combinedData = gradesData.map(grade => ({
          ...grade,
          gradeImg: yearsData[grade.id] ? yearsData[grade.id].gradeImg : null,
        }));

        setGrades(combinedData);
      } catch (error) {
        console.error('Error fetching grades:', error);
      }
    };

    fetchGrades();
  }, []);

  const openEditModal = (grade) => {
    setSelectedGrade(grade);
    setIsEditModalOpen(true);
    setNewImage(null); // Reset the new image when opening the modal
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedGrade({ id: '', streams: [], gradeImg: '' });
    setNewImage(null); // Reset to initial state
  };

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

  const handleEditSubmit = async (event) => {
    event.preventDefault();

    try {
      // Update the grade data in Firestore
      const gradeRef = doc(db, 'Grades', selectedGrade.id);
      
      // If a new image is uploaded, handle the upload
      if (newImage) {
        const storage = getStorage();
        const imageRef = ref(storage, `grades/${selectedGrade.id}/${newImage.name}`);
        await uploadBytes(imageRef, newImage);
        const imageUrl = await getDownloadURL(imageRef);
        await updateDoc(gradeRef, {
          streams: selectedGrade.streams,
          gradeImg: imageUrl,
        });
        setSelectedGrade({ ...selectedGrade, gradeImg: imageUrl }); 
      } else {
        await updateDoc(gradeRef, {
          streams: selectedGrade.streams,
        });
      }

      closeEditModal();
    } catch (error) {
      console.error('Error updating grade:', error);
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
                <th className="px-6 py-3 border-b text-left">Streams</th>
                <th className="px-6 py-3 border-b text-left">Grade Image</th>
                <th className="px-6 py-3 border-b text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((grade, index) => (
                <tr key={grade.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-white'}>
                  <td className="border-b p-4">{grade.id}</td>
                  <td className="border-b p-4">
                    {grade.streams && grade.streams.length > 0
                      ? grade.streams.join(', ')
                      : 'No streams available'}
                  </td>
                  <td className="border-b p-4">
                    {grade.gradeImg ? (
                      <img src={grade.gradeImg} alt={`Grade ${grade.id}`} className="w-16 h-16" />
                    ) : (
                      'No image available'
                    )}
                  </td>
                  <td className="border-b p-4">
                    <button
                      onClick={() => openEditModal(grade)}
                      className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(grade)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
            <h2 className="text-2xl font-semibold mb-4">Edit Grade</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Grade ID:</label>
                <input
                  type="text"
                  value={selectedGrade.id}
                  readOnly
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Streams:</label>
                <input
                  type="text"
                  value={selectedGrade.streams.join(', ')}
                  onChange={(e) => setSelectedGrade({ ...selectedGrade, streams: e.target.value.split(', ') })}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                  placeholder="Enter streams separated by commas"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Current Grade Image:</label>
                {selectedGrade.gradeImg ? (
                  <img src={selectedGrade.gradeImg} alt={`Current Grade ${selectedGrade.id}`} className="w-16 h-16 mb-2" />
                ) : (
                  'No image available'
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Change Grade Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewImage(e.target.files[0])}
                  className="mt-1 p-2 border border-gray-300 rounded-md w-full"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Grade</button>
                <button type="button" onClick={closeEditModal} className="bg-gray-500 text-white px-4 py-2 rounded">Close</button>
              </div>
            </form>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onRequestClose={closeDeleteModal}
          contentLabel="Delete Confirmation"
          className="modal"
          overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
        >
          <div className="bg-white p-6 rounded shadow-md w-96">
            <h2 className="text-lg font-semibold mb-4">Are you sure you want to delete this grade?</h2>
            <p>{gradeToDelete?.id}</p>
            <div className="flex justify-end space-x-2 mt-4">
              <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">
                Yes, Delete
              </button>
              <button onClick={closeDeleteModal} className="bg-gray-500 text-white px-4 py-2 rounded">
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
