import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { MovementType } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle, FileBarChart, Calendar, ArrowDownLeft, ArrowUpRight, Filter, Download, Printer } from 'lucide-react';

type ReportPeriod = 'daily' | 'weekly' | 'biweekly' | 'monthly';

const Reports: React.FC = () => {
  const { products, movements } = useInventory();
  const [period, setPeriod] = useState<ReportPeriod>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // --- LOGIC: TIME-BASED REPORTS ---

  const getDateRange = (dateStr: string, period: ReportPeriod) => {
    const date = new Date(dateStr);
    // Adjust to local midnight to avoid timezone issues with string splitting
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    let start = new Date(startOfDay);
    let end = new Date(startOfDay);

    switch (period) {
      case 'daily':
        end.setHours(23, 59, 59, 999);
        break;
      case 'weekly':
        // Monday as start of week
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      case 'biweekly':
        if (date.getDate() <= 15) {
          start.setDate(1);
          end.setDate(15);
        } else {
          start.setDate(16);
          end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of month
        }
        end.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        start.setDate(1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        end.setHours(23, 59, 59, 999);
        break;
    }
    return { start, end };
  };

  const { start, end } = useMemo(() => getDateRange(selectedDate, period), [selectedDate, period]);

  const filteredMovements = useMemo(() => {
    return movements.filter(m => {
      const moveDate = new Date(m.date);
      return moveDate >= start && moveDate <= end;
    });
  }, [movements, start, end]);

  const stats = useMemo(() => {
    let entries = 0;
    let exits = 0;
    let itemsIn = 0;
    let itemsOut = 0;

    filteredMovements.forEach(m => {
      if (m.type === MovementType.ENTRY) {
        entries++;
        itemsIn += m.quantity;
      } else if (m.type === MovementType.EXIT) {
        exits++;
        itemsOut += m.quantity;
      }
    });

    return { entries, exits, itemsIn, itemsOut, total: filteredMovements.length };
  }, [filteredMovements]);

  const handleExportReport = () => {
    if (filteredMovements.length === 0) return;
    const headers = ['Fecha', 'Hora', 'Producto', 'Tipo', 'Cantidad', 'Razón'];
    const rows = filteredMovements.map(m => [
      new Date(m.date).toLocaleDateString(),
      new Date(m.date).toLocaleTimeString(),
      m.productName,
      m.type === 'ENTRY' ? 'Entrada' : 'Salida',
      m.quantity,
      m.reason
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_${period}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- LOGIC: BEST SELLERS (HISTORICAL) ---
  const salesMap = new Map<string, number>();
  movements.forEach(m => {
    if (m.type === MovementType.EXIT) {
      const current = salesMap.get(m.productId) || 0;
      salesMap.set(m.productId, current + m.quantity);
    }
  });

  const productsWithSales = products.map(p => ({
    ...p,
    soldQuantity: salesMap.get(p.id) || 0
  }));

  const bestSellers = [...productsWithSales]
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .filter(p => p.soldQuantity > 0)
    .slice(0, 15);

  const slowMovers = [...productsWithSales]
    .sort((a, b) => {
        if (a.soldQuantity !== b.soldQuantity) {
            return a.soldQuantity - b.soldQuantity;
        }
        return b.currentStock - a.currentStock;
    })
    .slice(0, 15);

  const lowStockProducts = products
    .filter(p => p.currentStock <= p.minStock)
    .sort((a, b) => (a.currentStock - a.minStock) - (b.currentStock - b.minStock));

  return (
    <div className="space-y-8 animate-fade-in-up pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileBarChart className="text-blue-600" /> Centro de Reportes
          </h1>
          <p className="text-gray-500">Genera reportes temporales y analiza el rendimiento histórico.</p>
        </div>
      </div>

      {/* --- TIME BASED REPORT GENERATOR --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 text-white p-6">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
            <Calendar className="text-blue-400" /> Generador de Reportes por Periodo
          </h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-end">
             <div className="w-full md:w-auto">
               <label className="block text-xs text-gray-400 mb-1">Tipo de Reporte</label>
               <div className="flex bg-gray-800 rounded-lg p-1">
                 {(['daily', 'weekly', 'biweekly', 'monthly'] as ReportPeriod[]).map((t) => (
                   <button
                     key={t}
                     onClick={() => setPeriod(t)}
                     className={`px-3 py-1.5 rounded-md text-sm capitalize transition-colors ${
                       period === t ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-gray-700'
                     }`}
                   >
                     {t === 'daily' ? 'Diario' : t === 'weekly' ? 'Semanal' : t === 'biweekly' ? 'Quincenal' : 'Mensual'}
                   </button>
                 ))}
               </div>
             </div>

             <div className="w-full md:w-auto">
               <label className="block text-xs text-gray-400 mb-1">Fecha de Referencia</label>
               <input 
                 type="date" 
                 value={selectedDate}
                 onChange={(e) => setSelectedDate(e.target.value)}
                 className="bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none"
               />
             </div>

             <div className="w-full md:w-auto text-xs text-gray-400 pb-2">
               Periodo: <span className="text-white font-mono">{start.toLocaleDateString()}</span> al <span className="text-white font-mono">{end.toLocaleDateString()}</span>
             </div>
          </div>
        </div>

        {/* STATS SUMMARY FOR SELECTED PERIOD */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b border-gray-200">
           <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 uppercase font-bold">Total Movimientos</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
           </div>
           <div className="bg-white p-4 rounded-lg border border-green-100 shadow-sm">
              <p className="text-xs text-green-600 uppercase font-bold">Unidades Entrantes</p>
              <div className="flex items-end gap-2">
                 <p className="text-2xl font-bold text-gray-800">{stats.itemsIn}</p>
                 <span className="text-xs text-green-500 mb-1">({stats.entries} regs)</span>
              </div>
           </div>
           <div className="bg-white p-4 rounded-lg border border-red-100 shadow-sm">
              <p className="text-xs text-red-600 uppercase font-bold">Unidades Salientes</p>
              <div className="flex items-end gap-2">
                 <p className="text-2xl font-bold text-gray-800">{stats.itemsOut}</p>
                 <span className="text-xs text-red-500 mb-1">({stats.exits} regs)</span>
              </div>
           </div>
           <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm flex flex-col justify-center gap-2">
              <button onClick={handleExportReport} disabled={stats.total === 0} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white text-sm py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors">
                <Download size={16} /> Exportar CSV
              </button>
              <button onClick={() => window.print()} disabled={stats.total === 0} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 text-sm py-2 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors">
                <Printer size={16} /> Imprimir
              </button>
           </div>
        </div>

        {/* DETAILED TABLE FOR PERIOD */}
        <div className="max-h-[400px] overflow-y-auto">
           <table className="w-full text-left text-sm">
             <thead className="bg-white sticky top-0 z-10 shadow-sm text-gray-500 font-medium">
               <tr>
                 <th className="px-6 py-3">Fecha / Hora</th>
                 <th className="px-6 py-3">Producto</th>
                 <th className="px-6 py-3">Tipo</th>
                 <th className="px-6 py-3 text-right">Cantidad</th>
                 <th className="px-6 py-3">Razón</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {filteredMovements.length > 0 ? (
                 filteredMovements.map(m => (
                   <tr key={m.id} className="hover:bg-gray-50">
                     <td className="px-6 py-3 text-gray-500">
                       {new Date(m.date).toLocaleDateString()} <span className="text-xs text-gray-400">{new Date(m.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                     </td>
                     <td className="px-6 py-3 font-medium text-gray-900">{m.productName}</td>
                     <td className="px-6 py-3">
                        {m.type === 'ENTRY' ? (
                          <span className="text-green-600 flex items-center gap-1 text-xs font-bold"><ArrowDownLeft size={12}/> Entrada</span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1 text-xs font-bold"><ArrowUpRight size={12}/> Salida</span>
                        )}
                     </td>
                     <td className={`px-6 py-3 text-right font-bold ${m.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}`}>
                       {m.quantity}
                     </td>
                     <td className="px-6 py-3 text-gray-500 italic text-xs">{m.reason}</td>
                   </tr>
                 ))
               ) : (
                 <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                     No hay movimientos registrados en este periodo.
                   </td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <div className="border-t border-gray-200 my-8"></div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-4">Análisis Histórico General</h2>

      {/* Grid for Top Selling and Slow Movers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TOP 15 BEST SELLERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 bg-green-50 flex items-center gap-2">
             <div className="p-2 bg-green-100 text-green-700 rounded-lg">
               <TrendingUp size={20} />
             </div>
             <div>
               <h2 className="font-bold text-gray-800">Top 15 Más Vendidos</h2>
               <p className="text-xs text-gray-500">Productos con mayor rotación histórica</p>
             </div>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">Vendidos</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bestSellers.map((p, index) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs w-10">{index + 1}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{p.soldQuantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500">{p.currentStock}</td>
                  </tr>
                ))}
                {bestSellers.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                      No hay registros de ventas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP 15 SLOW MOVERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
          <div className="p-5 border-b border-gray-100 bg-orange-50 flex items-center gap-2">
             <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
               <TrendingDown size={20} />
             </div>
             <div>
               <h2 className="font-bold text-gray-800">Top 15 Menos Movimiento</h2>
               <p className="text-xs text-gray-500">Productos con menos ventas (Prioridad: Alto Stock)</p>
             </div>
          </div>
          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 text-right">Vendidos</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {slowMovers.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{p.category}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-400">{p.soldQuantity}</td>
                    <td className="px-4 py-3 text-right text-gray-800 font-medium">{p.currentStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* LOW STOCK FULL LIST */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-200 bg-red-50 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-100 text-red-600 rounded-lg">
               <AlertTriangle size={24} />
             </div>
             <div>
                <h2 className="text-xl font-bold text-gray-900">Alerta de Stock Bajo</h2>
                <p className="text-red-700 text-sm font-medium">Lista completa de productos por debajo del mínimo</p>
             </div>
          </div>
          <button onClick={() => window.print()} className="hidden sm:block text-sm bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600">
            Imprimir Lista
          </button>
        </div>
        
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-xs sticky top-0">
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
                <tr key={product.id} className="hover:bg-red-50 transition-colors">
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
                  <td className="px-6 py-4 text-center text-red-600 font-bold bg-red-50">
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
      
      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none; }
          .overflow-y-auto { overflow: visible !important; max-height: none !important; }
        }
      `}</style>
    </div>
  );
};

export default Reports;