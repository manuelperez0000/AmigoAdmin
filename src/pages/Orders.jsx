import { useState, useEffect } from 'react';
import useDollarStore from '../stores/dollarStore';
import * as XLSX from 'xlsx';
import Modal from '../components/Modal';
import ProductButton from '../components/ProductButton';
import IconPicker from '../components/IconPicker';

const Orders = () => {
  const { dolarPrice } = useDollarStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editItems, setEditItems] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
  const [selectedProductQty, setSelectedProductQty] = useState(1);
  const [manualName, setManualName] = useState('');
  const [manualPrice, setManualPrice] = useState(0);
  const [manualIcon, setManualIcon] = useState('');

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(storedOrders);
    setFilteredOrders(storedOrders);
  }, []);

  // Update filteredOrders when filterDate or orders change
  useEffect(() => {
    let filtered = orders.slice();
    if (filterDate) {
      filtered = filtered.filter(order => {
        if (!order.date) return false;
        const d = new Date(order.date);
        if (isNaN(d)) return false;
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const orderDateStr = `${y}-${m}-${day}`;
        return orderDateStr === filterDate;
      });
    }
    // Ordenar pedidos desde la fecha más reciente a la más antigua
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    setFilteredOrders(filtered);
  }, [filterDate, orders]);

  const deleteOrder = (orderId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta orden?')) return;
    const updated = orders.filter(o => o.id !== orderId);
    setOrders(updated);
    setFilteredOrders(prev => prev.filter(o => o.id !== orderId));
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const toggleAnulado = (orderId) => {
    const updated = orders.map(o => {
      if (o.id === orderId) {
        return { ...o, anulado: !o.anulado };
      }
      return o;
    });

    setOrders(updated);
    // Also update filteredOrders to reflect the change immediately
    setFilteredOrders(prev => prev.map(p => (p.id === orderId ? { ...p, anulado: !p.anulado } : p)));
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  const handleSelectProduct = (product) => {
    setSelectedProductToAdd(product);
    setSelectedProductQty(1);
  };

  const confirmAddSelectedProduct = () => {
    if (!selectedProductToAdd) return;
    const newItem = {
      id: selectedProductToAdd.id || `p-${Date.now()}`,
      name: selectedProductToAdd.name,
      price: Number(selectedProductToAdd.price) || 0,
      quantity: Number(selectedProductQty) || 1,
      icon: selectedProductToAdd.icon
    };
    setEditItems(prev => [...prev, newItem]);
    setIsProductModalOpen(false);
    setSelectedProductToAdd(null);
    setSelectedProductQty(1);
  };

  const handleManualAdd = () => {
    if (!manualName) return;
    const newItem = {
      id: `m-${Date.now()}`,
      name: manualName,
      price: Number(manualPrice) || 0,
      quantity: Number(selectedProductQty) || 1,
      icon: manualIcon
    };
    setEditItems(prev => [...prev, newItem]);
    setIsProductModalOpen(false);
    setManualName('');
    setManualPrice(0);
    setManualIcon('');
    setSelectedProductQty(1);
  };

  const startEdit = (order) => {
    setEditingOrderId(order.id);
    // clone items to edit
    setEditItems(order.items.map(it => ({ ...it })));
    setIsEditModalOpen(true);
  };

  const cancelEdit = () => {
    setEditingOrderId(null);
    setEditItems([]);
  };

  const handleItemChange = (index, field, value) => {
    setEditItems(prev => {
      const copy = prev.map(it => ({ ...it }));
      if (field === 'quantity') copy[index].quantity = parseInt(value || 0, 10);
      else if (field === 'price') copy[index].price = parseFloat(value || 0);
      else copy[index][field] = value;
      return copy;
    });
  };

  const addEmptyItem = () => {
    // open product modal instead of free-form add
    setSelectedProductToAdd(null);
    setSelectedProductQty(1);
    // load available products
    const saved = localStorage.getItem('products');
    setAvailableProducts(saved ? JSON.parse(saved) : []);
    setIsProductModalOpen(true);
  };

  const removeEditItem = (index) => {
    setEditItems(prev => prev.filter((_, i) => i !== index));
  };

  const saveEdit = (order) => {
    const dolarRate = order.dolarRate || dolarPrice || 1;
    const sanitizedItems = editItems.map(it => ({
      id: it.id || `itm-${Date.now()}-${Math.random()}`,
      name: it.name || 'Sin nombre',
      price: Number(it.price) || 0,
      quantity: Number(it.quantity) || 0
    }));

    const newTotalBs = sanitizedItems.reduce((s, it) => s + (it.price * it.quantity * dolarRate), 0);
    const updated = orders.map(o => {
      if (o.id === order.id) {
        return { ...o, items: sanitizedItems, total: newTotalBs };
      }
      return o;
    });
    setOrders(updated);
    setFilteredOrders(prev => prev.map(p => (p.id === order.id ? { ...p, items: sanitizedItems, total: newTotalBs } : p)));
    localStorage.setItem('orders', JSON.stringify(updated));
    setIsEditModalOpen(false);
    setEditingOrderId(null);
    setEditItems([]);
  };


  const exportToExcel = () => {
    if (filteredOrders.length === 0) {
      alert('No hay pedidos para exportar');
      return;
    }

    // Crear datos para el Excel (manteniendo números como números)
    const excelData = [];

    // Agregar encabezado
    excelData.push(['Fecha del Pedido', 'Producto', 'Cantidad', 'Precio Unitario ($)', 'Precio Unitario (Bs.)', 'Total Producto ($)', 'Total Producto (Bs.)']);

    // Agregar datos de cada pedido
    filteredOrders.forEach((order, orderIndex) => {
      // Usar la tasa guardada del pedido o la actual si no está disponible
      const orderDolarRate = order.dolarRate || dolarPrice;

      order.items.forEach((item) => {
        excelData.push([
          new Date(order.date).toLocaleString(),
          item.name,
          item.quantity,
          item.price, // Número sin formatear
          item.price * orderDolarRate, // Número sin formatear
          item.price * item.quantity, // Número sin formatear
          item.price * item.quantity * orderDolarRate // Número sin formatear
        ]);
      });

      // Agregar fila de total del pedido
      excelData.push([
        `TOTAL PEDIDO ${orderIndex + 1}`,
        '',
        '',
        '',
        '',
        order.total / orderDolarRate, // Número sin formatear
        order.total // Número sin formatear
      ]);

      // Agregar fila con la tasa del dólar del pedido
      excelData.push([
        `TASA DEL DÓLAR: Bs. ${orderDolarRate}`,
        '',
        '',
        '',
        '',
        '',
        ''
      ]);

      // Agregar fila vacía para separar pedidos
      excelData.push(['', '', '', '', '', '', '']);
    });

    // Crear hoja de Excel
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Configurar formato de número para columnas numéricas (3-6 son precios y totales)
    const numberColumns = [3, 4, 5, 6]; // Columnas D, E, F, G (índice basado en 0)
    numberColumns.forEach(colIndex => {
      const colLetter = String.fromCharCode(65 + colIndex); // Convertir índice a letra de columna
      for (let row = 1; row <= excelData.length; row++) {
        const cellRef = `${colLetter}${row}`;
        if (ws[cellRef] && typeof ws[cellRef].v === 'number') {
          ws[cellRef].t = 'n'; // Tipo número
          ws[cellRef].z = '#,##0.00'; // Formato con coma como separador decimal
        }
      }
    });

    // Configurar anchos de columna
    const colWidths = [
      { wch: 20 }, // Fecha
      { wch: 25 }, // Producto
      { wch: 10 }, // Cantidad
      { wch: 15 }, // Precio Unitario ($)
      { wch: 15 }, // Precio Unitario (Bs.)
      { wch: 15 }, // Total Producto ($)
      { wch: 15 }  // Total Producto (Bs.)
    ];
    ws['!cols'] = colWidths;

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Pedidos_${filterDate}`);

    // Generar nombre del archivo
    const fileName = `pedidos_${filterDate || 'todos'}.xlsx`;

    // Descargar archivo
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="orders-container">
      <div className="orders-header-section">
        <div className="orders-controls">
          <div className="title-section">
            <h2 className="orders-title">📋 Gestión de Pedidos</h2>
            <p className="orders-subtitle">Visualiza y exporta tus pedidos diarios</p>
          </div>

          <div className="controls-section">
            <div className="date-input-group">
              <label htmlFor="filterDate" className="date-label">
                📅 Filtrar por fecha:
              </label>
              <input
                id="filterDate"
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="date-input"
              />
            </div>

            <button
              onClick={exportToExcel}
              className="export-button"
              title="Exportar pedidos a Excel"
              disabled={filteredOrders.length === 0}
            >
              📊 Exportar Excel
            </button>
          </div>
        </div>
      </div>

      <div className="orders-content">
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <h3>No hay pedidos para mostrar</h3>
            <p>Selecciona una fecha para ver los pedidos de ese día</p>
          </div>
        ) : (
          <div className="orders-summary">
            <div className="orders-count">
              <span className="count-badge">
                {filteredOrders.length} pedido{filteredOrders.length !== 1 ? 's' : ''} encontrado{filteredOrders.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="orders-list">
              {filteredOrders.map((order, index) => (
                <div
                  key={order.id || index}
                  className={`order-card ${order.anulado ? 'order-anulado' : ''}`}
                  style={{ background: order.anulado ? '#fff8c4' : 'transparent' }}
                >
                  <div className="order-header">
                    <div className="order-info">
                      <h3 className="order-total">
                        Total: ${((order.total / (order.dolarRate || dolarPrice)) || 0).toFixed(2)} - Bs. {order.total.toFixed(2)}
                      </h3>
                      <p className="order-date">
                        📅 {new Date(order.date).toLocaleString()}
                      </p>
                      <p className="order-dolar-rate">
                        💱 Tasa del dólar: Bs. {order.dolarRate ? order.dolarRate.toFixed(2) : 'No disponible'}
                      </p>
                      {order.anulado && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: 6,
                          padding: '2px 6px',
                          fontSize: 12,
                          background: '#f9d976',
                          color: '#333',
                          borderRadius: 4
                        }}>Anulado</span>
                      )}
                    </div>
                    <div className="order-number">
                      <div className="order-sequence">Pedido #{order.id}</div>
                    </div>

              
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '0 12px 12px' }}>
                    <button
                      onClick={() => toggleAnulado(order.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #ccc',
                        background: order.anulado ? '#e6f7ff' : '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      {order.anulado ? 'Reestablecer' : 'Anular'}
                    </button>

                    <button
                      onClick={() => startEdit(order)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #4a90e2',
                        background: '#fff',
                        color: '#0b5ed7',
                        cursor: 'pointer'
                      }}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deleteOrder(order.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: 6,
                        border: '1px solid #dc3545',
                        background: '#fff',
                        color: '#dc3545',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4
                      }}
                      title="Eliminar orden"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </div>

                  


                  <h4 className="items-title">Productos:</h4>
                  <div className="items-list">
                    {order.items.map(item => (
                      <div key={item.id} className="item-card">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-quantity">Cantidad: {item.quantity}</span>
                        </div>
                        <div className="item-prices">
                          <span className="item-price-usd">
                            ${(item.price * item.quantity).toFixed(2)} USD
                          </span>
                          <span className="item-price-bs">
                            Bs. {(item.price * item.quantity * dolarPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              ))}
            </div>
            {/* Edit order modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); cancelEdit(); }}>
              <div style={{ minWidth: 500 }}>
                <h3>Editar Pedido #{editingOrderId}</h3>
                {(() => {
                  const currentOrder = orders.find(o => o.id === editingOrderId);
                  if (!currentOrder) return <div>No se encontró el pedido</div>;
                  return (
                    <div>
                      <div style={{ marginTop: 8 }}>
                        {editItems.map((it, i) => (
                          <div key={it.id || i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                            <div style={{ fontSize: 20 }}>{it.icon || '📦'}</div>
                            <div style={{ flex: 2 }}>
                              <div style={{ fontWeight: 600 }}>{it.name}</div>
                              <div style={{ fontSize: 12, color: '#666' }}>${Number(it.price).toFixed(2)}</div>
                            </div>
                            <input type="number" value={it.quantity} onChange={(e) => handleItemChange(i, 'quantity', e.target.value)} style={{ width: 90, padding: 6 }} />
                            <button onClick={() => removeEditItem(i)} style={{ padding: '6px 8px' }}>Eliminar</button>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button onClick={addEmptyItem} style={{ padding: '6px 10px' }}>Agregar producto</button>
                        <div style={{ flex: 1 }} />
                        <button onClick={() => saveEdit(currentOrder)} style={{ padding: '6px 10px', background: '#198754', color: '#fff', borderRadius: 6 }}>Guardar</button>
                        <button onClick={() => { setIsEditModalOpen(false); cancelEdit(); }} style={{ padding: '6px 10px', borderRadius: 6 }}>Cancelar</button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </Modal>

            {/* Product selection modal */}
            <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)}>
              <div style={{ maxWidth: 700 }}>
                <h3>Seleccionar producto</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {availableProducts.length === 0 ? (
                    <div style={{ width: '100%' }}>
                      <div>No hay productos guardados. Agrega uno manualmente:</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
                        <input type="text" placeholder="Nombre" value={manualName} onChange={(e) => setManualName(e.target.value)} style={{ flex: 2, padding: 6 }} />
                        <input type="number" placeholder="Precio USD" value={manualPrice} onChange={(e) => setManualPrice(e.target.value)} style={{ width: 140, padding: 6 }} />
                        <input type="number" min={1} value={selectedProductQty} onChange={(e) => setSelectedProductQty(Number(e.target.value))} style={{ width: 90, padding: 6 }} />
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <IconPicker newItem={{ icon: manualIcon }} onSelectIcon={(icon) => setManualIcon(icon)} />
                      </div>
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <button onClick={handleManualAdd} style={{ padding: '6px 10px', background: '#0d6efd', color: '#fff', borderRadius: 6 }}>Agregar manual</button>
                        <button onClick={() => setIsProductModalOpen(false)} style={{ padding: '6px 10px' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    availableProducts.map(p => (
                      <ProductButton key={p.id} product={p} onAddToCart={handleSelectProduct} />
                    ))
                  )}
                </div>

                {selectedProductToAdd && (
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <div style={{ fontSize: 24 }}>{selectedProductToAdd.icon}</div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{selectedProductToAdd.name}</div>
                        <div>${Number(selectedProductToAdd.price).toFixed(2)}</div>
                      </div>
                    </div>

                    <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label>Cantidad:</label>
                      <input type="number" min={1} value={selectedProductQty} onChange={(e) => setSelectedProductQty(Number(e.target.value))} style={{ width: 90, padding: 6 }} />
                      <div style={{ flex: 1 }} />
                      <button onClick={confirmAddSelectedProduct} style={{ padding: '6px 10px', background: '#0d6efd', color: '#fff', borderRadius: 6 }}>Agregar</button>
                    </div>
                  </div>
                )}
              </div>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
