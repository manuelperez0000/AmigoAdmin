import { useState } from 'react';
import Modal from '../components/Modal';
import IconPicker from '../components/IconPicker';
import useDollarStore from '../stores/dollarStore';
import * as XLSX from 'xlsx';

const Products = () => {
    const { dolarPrice } = useDollarStore();

    const [products, setProducts] = useState(() => {
        const savedProducts = localStorage.getItem('products');
        return savedProducts ? JSON.parse(savedProducts) : [];
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editItem, setEditItem] = useState({ name: '', price: '', icon: '' });

    const handleEdit = (product) => {
        setEditingProduct(product);
        setEditItem({ name: product.name, price: product.price, icon: product.icon });
        setIsEditModalOpen(true);
    };

    const handleDelete = (productId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
            const updatedProducts = products.filter(product => product.id !== productId);
            setProducts(updatedProducts);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
        }
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditItem((prev) => ({ ...prev, [name]: value }));
    };

    const handleEditSelectIcon = (icon) => {
        setEditItem((prev) => ({ ...prev, icon }));
    };

    const handleUpdateItem = (e) => {
        e.preventDefault();
        if (editItem.name && editItem.price && editItem.icon) {
            const updatedProducts = products.map(product =>
                product.id === editingProduct.id
                    ? { ...product, name: editItem.name, price: parseFloat(editItem.price), icon: editItem.icon }
                    : product
            );
            setProducts(updatedProducts);
            localStorage.setItem('products', JSON.stringify(updatedProducts));
            setIsEditModalOpen(false);
            setEditingProduct(null);
            setEditItem({ name: '', price: '', icon: '' });
        }
    };

    const exportToExcel = () => {
        if (products.length === 0) {
            alert('No hay productos para exportar');
            return;
        }

        // Crear datos para el Excel
        const excelData = [];

        // Agregar encabezado
        excelData.push(['Icono', 'Nombre del Producto', 'Precio USD', 'Precio Bs.', 'Fecha de Creación']);

        // Agregar datos de cada producto
        products.forEach((product) => {
            excelData.push([
                product.icon,
                product.name,
                product.price.toFixed(2),
                (product.price * dolarPrice).toFixed(2),
                new Date(product.createdAt || Date.now()).toLocaleDateString()
            ]);
        });

        // Crear hoja de Excel
        const ws = XLSX.utils.aoa_to_sheet(excelData);

        // Configurar anchos de columna
        const colWidths = [
            { wch: 10 }, // Icono
            { wch: 25 }, // Nombre
            { wch: 15 }, // Precio USD
            { wch: 15 }, // Precio Bs
            { wch: 15 }  // Fecha
        ];
        ws['!cols'] = colWidths;

        // Crear libro de Excel
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');

        // Generar nombre del archivo con fecha actual
        const today = new Date().toISOString().split('T')[0];
        const fileName = `productos_${today}.xlsx`;

        // Descargar archivo
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="products-list-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Lista de Productos</h2>
                <button
                    onClick={exportToExcel}
                    className="export-button"
                    title="Exportar productos a Excel"
                    disabled={products.length === 0}
                    style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #28a745, #20c997)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        cursor: products.length === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
                        opacity: products.length === 0 ? 0.6 : 1
                    }}
                >
                    📊 Exportar Excel
                </button>
            </div>
            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Icono</th>
                            <th>Nombre</th>
                            <th>Precio USD</th>
                            <th>Precio Bs</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product.id}>
                                <td style={{ fontSize: '1.5rem' }}>{product.icon}</td>
                                <td>{product.name}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>Bs {(product.price * dolarPrice).toFixed(2)}</td>
                                <td>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => handleEdit(product)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                <form onSubmit={handleUpdateItem}>
                    <h2>Editar Producto</h2>
                    <input
                        type="text"
                        name="name"
                        value={editItem.name}
                        onChange={handleEditInputChange}
                        placeholder="Nombre del producto"
                        required
                    />
                    <input
                        type="number"
                        name="price"
                        value={editItem.price}
                        onChange={handleEditInputChange}
                        placeholder="Precio"
                        step="0.01"
                        required
                    />
                    <IconPicker onSelectIcon={handleEditSelectIcon} />
                    <button type="submit">Actualizar Producto</button>
                </form>
            </Modal>
        </div>
    );
};

export default Products;
