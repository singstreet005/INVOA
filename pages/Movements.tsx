import React from 'react';
import { useInventory } from '../context/InventoryContext';
import { MovementType } from '../types';
import { ArrowDownLeft, ArrowUpRight, ArrowRight, FileDown } from 'lucide-react';

const Movements: React.FC = () => {
  const { movements } = useInventory();

  const exportToCSV = () => {
    if (movements.length === 0) return;
    const headers = ['Fecha', 'Producto', 'Tipo', 'Cantidad', 'Razón'];
    const rows = movements.map(m => [
      new Date(m.date).toLocaleString(),
      m.productName,
      m.type,
      m.quantity,
      m.reason
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "movimientos_inventario.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
        <button 
          onClick={exportToCSV}
          disabled={movements.length === 0}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 border border-gray-300 px-4 py-2 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          <FileDown size={18} />
          Exportar CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3">Tipo</th>
                <th className="px-6 py-3">Producto</th>
                <th className="px-6 py-3 text-right">Cantidad</th>
                <th className="px-6 py-3">Razón</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map(m => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(m.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(m.date).toLocaleTimeString()}</span>
                  </td>
                  <td className="px-6 py-4">
                     {m.type === MovementType.ENTRY ? (
                       <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-1 rounded text-xs font-medium">
                         <ArrowDownLeft size={14} /> Entrada
                       </span>
                     ) : m.type === MovementType.EXIT ? (
                       <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-1 rounded text-xs font-medium">
                         <ArrowUpRight size={14} /> Salida
                       </span>
                     ) : (
                       <span className="inline-flex items-center gap-1 text-gray-700 bg-gray-50 px-2 py-1 rounded text-xs font-medium">
                         <ArrowRight size={14} /> Ajuste
                       </span>
                     )}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.productName}</td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    m.type === MovementType.ENTRY ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {m.type === MovementType.ENTRY ? '+' : '-'}{m.quantity}
                  </td>
                  <td className="px-6 py-4 text-gray-500 italic">{m.reason}</td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No hay movimientos registrados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Movements;
