import { useState, useEffect } from 'react';
import useDollarStore from '../stores/dollarStore';
import * as XLSX from 'xlsx';

const Orders = () => {
  const { dolarPrice } = useDollarStore();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders')) || [];
    setOrders(storedOrders);
    setFilteredOrders(storedOrders);
  }, []);

  useEffect(() => {
    let filtered = orders;

    if (filterDate) {
      filtered = orders.filter(order => order.date.startsWith(filterDate));
    }

    // Ordenar pedidos desde la fecha más reciente a la más antigua
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredOrders(filtered);
  }, [filterDate, orders]);

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
                <div key={index} className="order-card">
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
                    </div>
                    <div className="order-number">
                      <div className="order-sequence">Pedido #{order.id}</div>
                    </div>
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
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;
