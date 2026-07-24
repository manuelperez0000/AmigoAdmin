import './Modal.css';

const Modal = ({ isOpen, onClose, children, fullScreen }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={fullScreen ? 'p-4 modal-fullscreen' : 'p-4 card'}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
      </div>
    </div>
  );
};

export default Modal;
