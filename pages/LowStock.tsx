import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { Printer, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LowStock: React.FC = () => {
  const { products } = useInventory();
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-red-50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-full text-red-600 shadow-sm">
               <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reporte de Stock Bajo</h1>
              <p className="text-red-700 font-medium">{lowStockProducts.length} productos requieren reposición inmediata</p>
            </div>
          </div>
          <div className="flex gap-3 print:hidden w-full sm:w-auto">
            <Link to="/" className="flex-1 sm:flex-none justify-center flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-white rounded-lg border border-transparent hover:border-gray-200 transition-colors">
              <ArrowLeft size={18} /> Volver
            </Link>
            <button 
              onClick={() => window.print()}
              className="flex-1 sm:flex-none justify-center flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-sm transition-colors"
            >
              <Printer size={18} /> Imprimir
            </button>
          </div>
        </div>

        <div className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-600 font-bold border-b-2 border-gray-200 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Producto</th>
                  <th className="px-6 py-4">Categoría</th>
                  <th className="px-6 py-4 text-center">Stock Actual</th>
                  <th className="px-6 py-4 text-center">Mínimo</th>
                  <th className="px-6 py-4 text-center">Faltante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockProducts.map(product => (
                  <tr key={product.id} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{product.sku}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-block px-2 py-1 rounded-md bg-gray-100 text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-bold bg-red-100 text-red-700 border border-red-200">
                        {product.currentStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-600 font-medium">{product.minStock}</td>
                    <td className="px-6 py-4 text-center text-red-600 font-bold bg-red-50/50">
                      -{product.minStock - product.currentStock}
                    </td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="p-3 bg-green-100 rounded-full text-green-600">
                          <AlertTriangle size={32} className="rotate-180" /> 
                        </div>
                        <p className="text-lg font-medium text-green-700">¡Todo en orden!</p>
                        <p className="text-sm">No hay productos con stock bajo actualmente.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
           Reporte generado el {new Date().toLocaleString()} - Outlet del Aseo
        </div>
      </div>
      
      {/* Estilos específicos para impresión */}
      <style>{`
        @media print {
          @page { margin: 1cm; size: landscape; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .min-h-screen { padding: 0; }
          .print\\:hidden { display: none !important; }
          .shadow-lg { box-shadow: none !important; }
          .rounded-xl { border-radius: 0 !important; }
          .overflow-hidden { overflow: visible !important; }
          .overflow-x-auto { overflow: visible !important; }
        }
      `}</style>
    </div>
  );
};

export default LowStock;