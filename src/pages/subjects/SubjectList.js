import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../auth/Firebase';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const SubjectList = () => {
  const [subjects, setSubjects] = useState([]);
  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterGrade, setFilterGrade] = useState(''); 
  const [deleteSubjectId, setDeleteSubjectId] = useState(null);
  const itemsPerPage = 8;

  const navigate = useNavigate();

  // Fetch subjects from Firestore
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjectsCollection = collection(db, 'subjects');
        const subjectSnapshot = await getDocs(subjectsCollection);
        const subjectList = subjectSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSubjects(subjectList);
      } catch (error) {
        console.error('Error fetching subjects: ', error);
      }
    };

    fetchSubjects();
  }, []);

  // Handle editing a subject
  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setNewSubjectName(subject.subjectName);
    setNewGrade(subject.grade);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, 'subjects', editingSubject.id);
      await updateDoc(docRef, {
        subjectName: newSubjectName,
        grade: newGrade
      });
      toast.success('Subject updated successfully!');
      setEditingSubject(null);
      setSubjects(subjects.map(sub =>
        sub.id === editingSubject.id ? { ...sub, subjectName: newSubjectName, grade: newGrade } : sub
      ));
    } catch (error) {
      console.error('Error updating subject: ', error);
      toast.error('Failed to update subject.');
    }
  };

  // Handle deleting a subject
  const handleDelete = async () => {
    if (deleteSubjectId) {
      try {
        const docRef = doc(db, 'subjects', deleteSubjectId);
        await deleteDoc(docRef);
        setSubjects(subjects.filter(sub => sub.id !== deleteSubjectId));
        toast.success('Subject deleted successfully!');
        setDeleteSubjectId(null);
      } catch (error) {
        console.error('Error deleting subject: ', error);
        toast.error('Failed to delete subject.');
      }
    }
  };

  // Generate grades 1 to 13
  const grades = Array.from({ length: 13 }, (_, i) => `Grade ${i + 1}`);

  // Pagination logic
  const indexOfLastSubject = currentPage * itemsPerPage;
  const indexOfFirstSubject = indexOfLastSubject - itemsPerPage;

  // Filter subjects based on input grade
  const filteredSubjects = filterGrade
    ? subjects.filter(subject => subject.grade === filterGrade)
    : subjects;

  // Current subjects for the current page
  const currentSubjects = filteredSubjects.slice(indexOfFirstSubject, indexOfLastSubject);
  const totalPages = Math.ceil(filteredSubjects.length / itemsPerPage);

  return (
    <section className="flex w-full h-screen">
      <Sidebar />
      <section className="flex-1 p-10">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-semibold">Subject List</h2>
          <button 
            onClick={() => navigate('/add-subjects')} 
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Subject
          </button>
        </div>

       {/* Filter by Grade Input */}
        <div className="mb-4">
            <select
                value={filterGrade}
                onChange={(e) => {
                setFilterGrade(e.target.value);
                setCurrentPage(1); 
                }}
                className="border p-2 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
                ))}
            </select>
        </div>

        <table className="min-w-full bg-white border border-gray-200">
          <thead className="bg-blue-600 text-white">
            <tr>
              <th className="border-b p-2 text-center">Grade</th>
              <th className="border-b p-2 text-center">Subject</th>
              <th className="border-b p-2 text-center">Actions</th>
            </tr>
          </thead>
            <tbody>
                {currentSubjects.map((subject, index) => (
                    <tr key={subject.id} className={index % 2 === 0 ? 'bg-gray-100' : 'bg-gray-50'}>
                    <td className="border p-2 text-center">
                        {editingSubject?.id === subject.id ? (
                        <select
                            value={newGrade}
                            onChange={(e) => setNewGrade(e.target.value)}
                            className="border p-1 rounded"
                        >
                            <option value="">Select Grade</option>
                            {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                            ))}
                        </select>
                        ) : (
                        subject.grade
                        )}
                    </td>
                    <td className="border p-2 text-center">
                        {editingSubject?.id === subject.id ? (
                        <input 
                            type="text" 
                            value={newSubjectName} 
                            onChange={(e) => setNewSubjectName(e.target.value)} 
                            className="border p-1 rounded"
                        />
                        ) : (
                        subject.subjectName
                        )}
                    </td>
                    <td className="border p-2 text-center">
                        {editingSubject?.id === subject.id ? (
                        <>
                            <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded mr-2">Save</button>
                            <button onClick={() => setEditingSubject(null)} className="bg-gray-500 text-white px-2 py-1 rounded">Cancel</button>
                        </>
                        ) : (
                        <>
                            <button onClick={() => handleEdit(subject)} className="bg-blue-500 text-white px-2 py-1 rounded mr-2">Edit</button>
                            <button onClick={() => setDeleteSubjectId(subject.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                        </>
                        )}
                    </td>
                    </tr>
                ))}
            </tbody>
        </table>
        
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

        {/* Delete Confirmation Modal */}
        {deleteSubjectId && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md">
              <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
              <p>Do you want to delete this subject?</p>
              <div className="flex justify-end mt-4">
                <button onClick={() => setDeleteSubjectId(null)} className="bg-gray-500 text-white px-4 py-2 rounded mr-2">Cancel</button>
                <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer />
      </section>
    </section>
  );
};

export default SubjectList;