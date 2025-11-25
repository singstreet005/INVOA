import React, { useState } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Product, MovementType } from '../types';
import { Plus, Search, Edit2, Trash2, ArrowUpRight, ArrowDownLeft, X, Sparkles, AlertCircle, TrendingUp } from 'lucide-react';
import { generateProductDescription } from '../services/geminiService';

const Inventory: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, registerMovement, showFinancials } = useInventory();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProductForMovement, setSelectedProductForMovement] = useState<Product | null>(null);

  // Form States
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', sku: '', category: '', currentStock: 0, minStock: 5, purchasePrice: 0, salePrice: 0, description: ''
  });
  const [movementData, setMovementData] = useState({
    type: MovementType.ENTRY,
    quantity: 1,
    reason: ''
  });
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', category: '', currentStock: 0, minStock: 5, purchasePrice: 0, salePrice: 0, description: '' });
    }
    setIsModalOpen(true);
  };

  const handleAiFill = async () => {
    if (!formData.name || !formData.category) {
      alert("Por favor ingresa nombre y categoría primero.");
      return;
    }
    setIsGeneratingAi(true);
    const desc = await generateProductDescription(formData.name, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGeneratingAi(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData as Omit<Product, 'id' | 'lastUpdated'>);
    }
    setIsModalOpen(false);
  };

  const handleMovementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductForMovement) {
      const success = registerMovement(
        selectedProductForMovement.id, 
        movementData.type, 
        movementData.quantity, 
        movementData.reason || 'Manual Adjustment'
      );
      if (success) {
        setIsMovementModalOpen(false);
        setSelectedProductForMovement(null);
      }
    }
  };

  const openMovementModal = (product: Product, type: MovementType) => {
    setSelectedProductForMovement(product);
    setMovementData({ type, quantity: 1, reason: '' });
    setIsMovementModalOpen(true);
  };

  // Calculate predicted stock for movement modal
  const getPredictedStock = () => {
    if (!selectedProductForMovement) return 0;
    const current = selectedProductForMovement.currentStock;
    const qty = movementData.quantity || 0;
    if (movementData.type === MovementType.ENTRY) return current + qty;
    if (movementData.type === MovementType.EXIT) return current - qty;
    return qty;
  };

  const predictedStock = getPredictedStock();
  const isNegativePrediction = predictedStock < 0;

  // Format currency
  const formatMoney = (amount: number) => {
    if (!showFinancials) return '****';
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Inventario</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre, SKU o categoría..." 
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span className="text-sm text-gray-500 hidden sm:block">
            Mostrando {filteredProducts.length} productos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">SKU</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3">Categoría</th>
                {/* Reordered columns as requested */}
                <th className="px-6 py-3 text-center">Stock</th>
                <th className="px-6 py-3 text-right">Acciones</th>
                <th className="px-6 py-3 text-right">Compra</th>
                <th className="px-6 py-3 text-right">Venta</th>
                <th className="px-6 py-3 text-right">Utilidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => {
                const profit = product.salePrice - product.purchasePrice;
                const profitPercent = product.purchasePrice > 0 ? ((profit / product.purchasePrice) * 100).toFixed(0) : '0';
                
                return (
                  <tr key={product.id} className="hover:bg-gray-50 group">
                    <td className="px-6 py-4 font-mono text-xs text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[200px]">{product.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {product.category}
                      </span>
                    </td>
                    
                    {/* Stock Column Moved Here */}
                    <td className="px-6 py-4 text-center">
                      <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        product.currentStock <= product.minStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {product.currentStock}
                      </div>
                    </td>

                    {/* Actions Column Moved Here */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button title="Entrada" onClick={() => openMovementModal(product, MovementType.ENTRY)} className="p-1.5 text-green-600 hover:bg-green-50 rounded"><ArrowDownLeft size={16} /></button>
                        <button title="Salida" onClick={() => openMovementModal(product, MovementType.EXIT)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><ArrowUpRight size={16} /></button>
                        <button title="Editar" onClick={() => handleOpenModal(product)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
                        <button title="Eliminar" onClick={() => { if(confirm('¿Seguro?')) deleteProduct(product.id) }} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                      </div>
                    </td>

                    {/* Financial Columns Moved to End */}
                    <td className="px-6 py-4 text-right font-medium text-gray-600">{formatMoney(product.purchasePrice)}</td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">{formatMoney(product.salePrice)}</td>
                    <td className="px-6 py-4 text-right">
                       <div className={`flex flex-col items-end ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         <span className="font-bold">{formatMoney(profit)}</span>
                         {showFinancials && <span className="text-xs opacity-75">{profitPercent}%</span>}
                       </div>
                    </td>
                  </tr>
                );
              })}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input required type="text" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input required type="text" list="categories" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                <datalist id="categories">
                  <option value="Limpieza" />
                  <option value="Papelería" />
                  <option value="Higiene" />
                </datalist>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                   <span>Descripción / Medida</span>
                   <button type="button" onClick={handleAiFill} disabled={isGeneratingAi} className="text-xs text-purple-600 flex items-center gap-1 hover:underline disabled:opacity-50">
                     <Sparkles size={12} /> {isGeneratingAi ? 'Generando...' : 'Generar con IA'}
                   </button>
                </label>
                <textarea className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none h-20" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              </div>
              
              {/* Sección de Precios */}
              <div className="md:col-span-2 grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Compra (Costo)</label>
                    <input required type="number" step="1" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.purchasePrice} onChange={e => setFormData({...formData, purchasePrice: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio Venta</label>
                    <input required type="number" step="1" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.salePrice} onChange={e => setFormData({...formData, salePrice: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="col-span-2 flex items-center justify-between text-sm pt-2 border-t border-gray-200">
                   <span className="text-gray-500">Utilidad estimada por unidad:</span>
                   <span className="font-bold text-green-600">
                     ${((formData.salePrice || 0) - (formData.purchasePrice || 0)).toLocaleString()}
                   </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Inicial</label>
                <input required type="number" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                <input required type="number" min="0" className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.minStock} onChange={e => setFormData({...formData, minStock: parseInt(e.target.value) || 0})} />
              </div>
              
              <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Movement Modal */}
      {isMovementModalOpen && selectedProductForMovement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full animate-fade-in-up">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 {movementData.type === MovementType.ENTRY ? <ArrowDownLeft className="text-green-600"/> : <ArrowUpRight className="text-red-600"/>}
                 {movementData.type === MovementType.ENTRY ? 'Registrar Entrada' : 'Registrar Salida'}
              </h2>
              <button onClick={() => setIsMovementModalOpen(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{selectedProductForMovement.name}</p>
              <div className="flex justify-between items-center mt-1">
                 <span className="text-xs text-gray-500">Stock Actual:</span>
                 <span className="font-mono font-bold text-gray-700">{selectedProductForMovement.currentStock}</span>
              </div>
            </div>
            <form onSubmit={handleMovementSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad a {movementData.type === MovementType.ENTRY ? 'ingresar' : 'retirar'}</label>
                <input autoFocus required type="number" min="1" className="w-full border rounded-lg p-3 text-lg font-semibold text-center focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={movementData.quantity} onChange={e => setMovementData({...movementData, quantity: parseInt(e.target.value) || 0})} />
              </div>
              
              {/* Calculation Preview */}
              <div className={`p-3 rounded-lg flex justify-between items-center border ${isNegativePrediction ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                <span className="text-sm text-gray-600">Stock Resultante:</span>
                <span className={`font-bold font-mono ${isNegativePrediction ? 'text-red-600' : 'text-gray-900'}`}>
                  {predictedStock}
                </span>
              </div>
              
              {isNegativePrediction && (
                 <div className="flex items-start gap-2 text-xs text-red-600">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>No puedes retirar más de lo existente.</span>
                 </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razón / Nota (Opcional)</label>
                <input type="text" placeholder="Ej. Venta, Merma, Reposición..." className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={movementData.reason} onChange={e => setMovementData({...movementData, reason: e.target.value})} />
              </div>
              
              <button 
                type="submit" 
                disabled={isNegativePrediction || movementData.quantity <= 0}
                className={`w-full py-3 rounded-lg text-white font-medium shadow-sm transition-all ${
                movementData.type === MovementType.ENTRY 
                    ? 'bg-green-600 hover:bg-green-700 hover:shadow-green-200' 
                    : 'bg-red-600 hover:bg-red-700 hover:shadow-red-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}>
                Confirmar {movementData.type === MovementType.ENTRY ? 'Entrada' : 'Salida'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;