import './Modal.css';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="p-4 card" onClick={(e) => e.stopPropagation()}>
        {children}
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
