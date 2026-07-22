import { useEffect, useState } from 'react';
import Modal from '../components/Modal';

const STORAGE_KEY = 'inventory_items';

const Inventary = () => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  const openModal = () => {
    setNewName('');
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const addItem = () => {
    if (!newName.trim()) return;
    const item = { id: Date.now(), name: newName.trim(), qty: 1, checked: false };
    setItems((prev) => [item, ...prev]);
    closeModal();
  };

  const updateItem = (id, changes) => setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));

  const removeItem = (id) => {
    if (!window.confirm('¿Eliminar este item?')) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  return (
    <div className="container inventary-container separacion-top">
      <div className="row inventary-header align-items-center">
        <div className="col">
          <h1>Inventary</h1>
        </div>
        <div className="col-auto">
          <button className="btn btn-primary add-button" onClick={openModal}>
            Agregar item
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal}>
        <h2>Agregar Item</h2>
        <input
          className="form-control input"
          placeholder="Nombre"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <div className="modal-actions">
          <button className="btn btn-primary save-button" onClick={addItem}>
            Guardar
          </button>
          <button className="btn btn-secondary cancel-button" onClick={closeModal}>
            Cancelar
          </button>
        </div>
      </Modal>

      <div className="inventary-list">
        {items.length === 0 ? (
          <p>No hay items</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="inventary-item d-flex justify-content-between align-items-center">
              <div className="left d-flex align-items-center">
                <input
                  type="checkbox"
                  checked={!!item.checked}
                  onChange={(e) => updateItem(item.id, { checked: e.target.checked })}
                />
                <div className="name ms-2">{item.name}</div>
              </div>
              <div className="right d-flex align-items-center">
                <input
                  className="form-control qty-input me-2"
                  type="number"
                  min="0"
                  value={item.qty}
                  onChange={(e) => updateItem(item.id, { qty: Math.max(0, parseInt(e.target.value || '0')) })}
                />
                <button className="btn btn-link p-0 trash-button" onClick={() => removeItem(item.id)} aria-label="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1 -2 2H8a2 2 0 0 1 -2 -2L5 6m3 0V4a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Inventary;