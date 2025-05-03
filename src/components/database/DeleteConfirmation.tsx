import React from 'react';

interface DeleteConfirmationProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded shadow-md">
                <h2 className="text-lg font-bold mb-4">Confirmar Exclusão</h2>
                <p>Você tem certeza que deseja excluir este banco de dados?</p>
                <div className="mt-4 flex justify-end">
                    <button className="mr-2 px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
                        Cancelar
                    </button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={onConfirm}>
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmation;