import React, { useState, useMemo } from 'react';
import { useInventory } from '../context/InventoryContext';
import { Lock, Unlock, DollarSign, TrendingUp, Wallet, ArrowRight, Calendar, PieChart, Download, ArrowDownLeft, ArrowUpRight, FileText, Table, ChevronLeft, ChevronRight } from 'lucide-react';
import { MovementType } from '../types';

type FinancePeriod = 'monthly' | 'biweekly' | 'quarterly' | 'semiannual' | 'annual';

const Finance: React.FC = () => {
  const { products, movements } = useInventory();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Daily Register Pagination State (0 = current 30 days, 1 = previous 30 days)
  const [viewOffset, setViewOffset] = useState(0);

  // Reporting State
  const [reportPeriod, setReportPeriod] = useState<FinancePeriod>('monthly');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'outletase12345') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Contraseña incorrecta');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const formatMoney = (amount: number) => {
    return `$${amount.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // --- 1. DAILY REGISTER LOGIC (PAGINATED) ---
  const dailyRegister = useMemo(() => {
    const days = [];
    const today = new Date();
    
    const pageSize = 30;
    const startDay = viewOffset * pageSize;
    const endDay = startDay + pageSize;
    
    // Generate days based on offset
    for (let i = startDay; i < endDay; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Filter movements for this specific day
      const dayMovements = movements.filter(m => m.date.startsWith(dateStr));
      
      let income = 0;
      let cost = 0;
      let restock = 0;

      dayMovements.forEach(m => {
        const product = products.find(p => p.id === m.productId);
        const price = product ? product.salePrice : 0;
        const purchasePrice = product ? product.purchasePrice : 0;

        if (m.type === MovementType.EXIT) {
          income += m.quantity * price;
          cost += m.quantity * purchasePrice;
        } else if (m.type === MovementType.ENTRY) {
          restock += m.quantity * purchasePrice;
        }
      });

      days.push({
        date: dateStr,
        displayDate: d.toLocaleDateString(),
        income,
        cost,
        profit: income - cost,
        restock,
        movements: dayMovements.length
      });
    }
    return days;
  }, [movements, products, viewOffset]);

  const exportDailyRegister = () => {
    const periodName = viewOffset === 0 ? "actual" : "anterior";
    const headers = ['Fecha', 'Ventas (Ingresos)', 'Costo de Venta', 'Utilidad Diaria', 'Gasto Reposicion', 'Movimientos'];
    const rows = dailyRegister.map(d => [
      d.date,
      d.income,
      d.cost,
      d.profit,
      d.restock,
      d.movements
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
        + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `registro_diario_${periodName}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- 2. HISTORICAL REPORT CALCULATIONS ---
  const reportStats = useMemo(() => {
    const date = new Date(selectedDate);
    // Adjust to local midnight
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    let start = new Date(startOfDay);
    let end = new Date(startOfDay);

    // Determine Date Range
    switch (reportPeriod) {
      case 'monthly':
        start.setDate(1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0); // Last day of month
        break;
      case 'biweekly':
        if (date.getDate() <= 15) {
          start.setDate(1);
          end.setDate(15);
        } else {
          start.setDate(16);
          end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        }
        break;
      case 'quarterly':
        const quarter = Math.floor(date.getMonth() / 3);
        start = new Date(date.getFullYear(), quarter * 3, 1);
        end = new Date(date.getFullYear(), start.getMonth() + 3, 0);
        break;
      case 'semiannual':
        const semester = date.getMonth() < 6 ? 0 : 6;
        start = new Date(date.getFullYear(), semester, 1);
        end = new Date(date.getFullYear(), start.getMonth() + 6, 0);
        break;
      case 'annual':
        start = new Date(date.getFullYear(), 0, 1);
        end = new Date(date.getFullYear(), 11, 31);
        break;
    }
    // Set end of day
    end.setHours(23, 59, 59, 999);

    // Filter Movements
    const periodMovements = movements.filter(m => {
      const mDate = new Date(m.date);
      return mDate >= start && mDate <= end;
    });

    let salesRevenue = 0;
    let cogs = 0; // Cost of Goods Sold
    let restockingCost = 0;

    periodMovements.forEach(m => {
      const product = products.find(p => p.id === m.productId);
      if (product) {
        if (m.type === MovementType.EXIT) {
          salesRevenue += m.quantity * product.salePrice;
          cogs += m.quantity * product.purchasePrice;
        } else if (m.type === MovementType.ENTRY) {
          restockingCost += m.quantity * product.purchasePrice;
        }
      }
    });

    const netProfit = salesRevenue - cogs;
    const periodMargin = salesRevenue > 0 ? ((netProfit / salesRevenue) * 100).toFixed(1) : '0';

    return { 
      start, 
      end, 
      salesRevenue, 
      cogs, 
      netProfit, 
      periodMargin, 
      restockingCost,
      movementCount: periodMovements.length 
    };
  }, [products, movements, reportPeriod, selectedDate]);

  // --- 3. CURRENT INVENTORY VALUE CALCULATIONS ---
  const currentInventoryStats = useMemo(() => {
    const totalCost = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
    const totalSale = products.reduce((acc, p) => acc + (p.currentStock * p.salePrice), 0);
    const totalProfit = totalSale - totalCost;
    const margin = totalSale > 0 ? ((totalProfit / totalSale) * 100).toFixed(1) : '0';
    return { totalCost, totalSale, totalProfit, margin };
  }, [products]);


  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 max-w-md w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
          <p className="text-gray-500 mb-6">Esta sección contiene información financiera sensible. Por favor ingrese la contraseña de administrador.</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm font-medium animate-pulse">{error}</p>}
            <button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              Desbloquear <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-fade-in-up pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="text-blue-600" /> Finanzas y Utilidad
          </h1>
          <p className="text-gray-500">Gestión financiera integral y reportes de desempeño.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <Lock size={18} />
          Bloquear Pantalla
        </button>
      </div>

      {/* --- SECTION 1: DAILY MOVEMENTS REGISTER --- */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
             <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
               <FileText className="text-blue-600" size={20} />
               Registro Diario
             </h2>
             <div className="flex items-center gap-2 mt-2">
                <button 
                  onClick={() => setViewOffset(1)}
                  disabled={viewOffset === 1}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Periodo Anterior (30-60 días)"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-gray-600 min-w-[140px] text-center">
                   {viewOffset === 0 ? "Últimos 30 días" : "30 días anteriores"}
                </span>
                <button 
                  onClick={() => setViewOffset(0)}
                  disabled={viewOffset === 0}
                  className="p-1 rounded hover:bg-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Periodo Actual"
                >
                  <ChevronRight size={20} />
                </button>
             </div>
          </div>
          <button 
            onClick={exportDailyRegister}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm font-medium"
          >
            <Download size={16} />
            Descargar {viewOffset === 0 ? "Este Periodo" : "Periodo Anterior"}
          </button>
        </div>
        
        <div className="max-h-[350px] overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-100 text-gray-600 font-bold sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">Fecha</th>
                <th className="px-6 py-3 text-right">Ventas</th>
                <th className="px-6 py-3 text-right hidden sm:table-cell">Costos (COGS)</th>
                <th className="px-6 py-3 text-right">Utilidad</th>
                <th className="px-6 py-3 text-right hidden sm:table-cell text-gray-400">Reposición</th>
                <th className="px-6 py-3 text-center">Movs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyRegister.map((day, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 font-medium text-gray-700">{day.displayDate}</td>
                  <td className="px-6 py-3 text-right font-medium text-blue-700">{formatMoney(day.income)}</td>
                  <td className="px-6 py-3 text-right hidden sm:table-cell text-gray-500">{formatMoney(day.cost)}</td>
                  <td className={`px-6 py-3 text-right font-bold ${day.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatMoney(day.profit)}
                  </td>
                  <td className="px-6 py-3 text-right hidden sm:table-cell text-purple-400">{formatMoney(day.restock)}</td>
                  <td className="px-6 py-3 text-center text-xs text-gray-400 bg-gray-50">{day.movements}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-100 font-bold border-t-2 border-gray-200">
              <tr>
                <td className="px-6 py-3">TOTAL ({viewOffset === 0 ? "Actual" : "Anterior"})</td>
                <td className="px-6 py-3 text-right">{formatMoney(dailyRegister.reduce((a,b) => a + b.income, 0))}</td>
                <td className="px-6 py-3 text-right hidden sm:table-cell">{formatMoney(dailyRegister.reduce((a,b) => a + b.cost, 0))}</td>
                <td className="px-6 py-3 text-right text-green-700">{formatMoney(dailyRegister.reduce((a,b) => a + b.profit, 0))}</td>
                <td className="px-6 py-3 text-right hidden sm:table-cell">{formatMoney(dailyRegister.reduce((a,b) => a + b.restock, 0))}</td>
                <td className="px-6 py-3 text-center">{dailyRegister.reduce((a,b) => a + b.movements, 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* --- SECTION 2: PERFORMANCE REPORTS --- */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-blue-600" size={20} />
              Reporte de Desempeño Financiero
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Resultados reales basados en movimientos dentro del periodo seleccionado.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2 rounded-lg border border-gray-200 shadow-sm w-full sm:w-auto">
             <div className="flex flex-wrap gap-1 bg-gray-100 rounded-md p-1 w-full sm:w-auto justify-center">
               {(['monthly', 'biweekly', 'quarterly', 'semiannual', 'annual'] as FinancePeriod[]).map(p => (
                 <button 
                   key={p}
                   onClick={() => setReportPeriod(p)}
                   className={`px-3 py-1 text-xs rounded transition-all capitalize ${reportPeriod === p ? 'bg-white text-blue-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'}`}
                 >
                   {p === 'monthly' ? 'Mensual' : p === 'biweekly' ? 'Quincenal' : p === 'quarterly' ? 'Trimestral' : p === 'semiannual' ? 'Semestral' : 'Anual'}
                 </button>
               ))}
             </div>
             <input 
               type="date" 
               value={selectedDate}
               onChange={(e) => setSelectedDate(e.target.value)}
               className="text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer w-full sm:w-auto text-center"
             />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
           <div className="bg-blue-50 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
              <span className="text-sm font-bold text-blue-800 uppercase tracking-wide">
                Periodo: {reportStats.start.toLocaleDateString()} - {reportStats.end.toLocaleDateString()}
              </span>
              <span className="text-xs text-blue-600 bg-white px-2 py-1 rounded border border-blue-100">
                {reportStats.movementCount} movimientos
              </span>
           </div>
           
           <div className="p-6">
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
               {/* SALES */}
               <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <ArrowUpRight size={14} className="text-blue-500" /> Ventas Reales (Ingresos)
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{formatMoney(reportStats.salesRevenue)}</p>
                  <p className="text-xs text-gray-400">Total facturado en caja</p>
               </div>

               {/* COGS */}
               <div className="space-y-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <PieChart size={14} className="text-orange-500" /> Costo de lo Vendido
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{formatMoney(reportStats.cogs)}</p>
                  <p className="text-xs text-gray-400">Valor de reposición de lo vendido</p>
               </div>

               {/* NET PROFIT */}
               <div className="space-y-1 bg-green-50 p-4 rounded-lg border border-green-100 -m-4 sm:m-0">
                  <p className="text-sm text-green-700 flex items-center gap-1 font-medium">
                    <DollarSign size={14} className="text-green-600" /> Utilidad Neta Real
                  </p>
                  <p className={`text-3xl font-bold ${reportStats.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                    {formatMoney(reportStats.netProfit)}
                  </p>
                  <p className="text-xs text-green-600 font-bold">{reportStats.periodMargin}% Margen Real</p>
               </div>

               {/* RESTOCK */}
               <div className="space-y-1 pl-0 lg:pl-6 lg:border-l border-gray-100">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <ArrowDownLeft size={14} className="text-purple-500" /> Inversión (Compras)
                  </p>
                  <p className="text-3xl font-bold text-gray-900">{formatMoney(reportStats.restockingCost)}</p>
                  <p className="text-xs text-gray-400">Salida de dinero por compras</p>
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* --- SECTION 3: CURRENT INVENTORY VALUE (MOVED TO BOTTOM) --- */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 opacity-75">
          <Table className="text-gray-400" size={20} />
          Valorización Estática del Inventario (Foto Actual)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-90 hover:opacity-100 transition-opacity">
          {/* Cost Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative">
              <p className="text-sm font-medium text-gray-500 mb-1">Inversión Total Acumulada</p>
              <h3 className="text-2xl font-bold text-gray-700">{formatMoney(currentInventoryStats.totalCost)}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span>Capital total invertido en bodega hoy</span>
              </div>
            </div>
          </div>

          {/* Sale Card */}
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative">
              <p className="text-sm font-medium text-gray-500 mb-1">Potencial de Venta Total</p>
              <h3 className="text-2xl font-bold text-gray-700">{formatMoney(currentInventoryStats.totalSale)}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                <span>Si se vendiera todo hoy</span>
              </div>
            </div>
          </div>

          {/* Profit Card */}
          <div className="bg-gray-100 p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="relative">
              <p className="text-sm font-medium text-gray-500 mb-1">Utilidad Proyectada Total</p>
              <h3 className="text-2xl font-bold text-gray-800">{formatMoney(currentInventoryStats.totalProfit)}</h3>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <span className="font-bold">{currentInventoryStats.margin}%</span>
                <span>Margen Global Promedio</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finance;