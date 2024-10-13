import React from 'react';

const Modal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h3 className="text-xl font-bold mb-4">Confirm Action</h3>
        <p className="mb-6">Do you want to reset your password?</p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-900 px-4 py-2 mr-4 rounded hover:bg-gray-400"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-900 text-white px-4 py-2 rounded  hover:bg-blue-400"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
