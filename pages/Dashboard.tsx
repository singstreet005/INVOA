import React, { useEffect, useState, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, AlertTriangle, Package, Sparkles, Download, Upload, ShieldCheck, Laptop } from 'lucide-react';
import { analyzeInventoryHealth } from '../services/geminiService';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, color, subtext, blurValue, onClick, className }: any) => (
  <div 
    onClick={onClick}
    className={`bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all ${
      onClick ? 'cursor-pointer transform hover:scale-[1.02]' : ''
    } ${className || ''}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className={`text-2xl font-bold text-gray-900 mt-1 ${blurValue ? 'blur-sm select-none' : ''}`}>
          {blurValue ? '999,999' : value}
        </h3>
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    {subtext && <p className="text-xs text-gray-400 mt-4">{subtext}</p>}
  </div>
);

const Dashboard: React.FC = () => {
  const { products, exportData, importData } = useInventory();
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const totalStock = products.reduce((acc, p) => acc + p.currentStock, 0);
  const lowStockProducts = products.filter(p => p.currentStock <= p.minStock);

  // Data for charts
  const categoryData = Object.values(products.reduce((acc: any, p) => {
    acc[p.category] = acc[p.category] || { name: p.category, value: 0 };
    acc[p.category].value += p.currentStock;
    return acc;
  }, {}));

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const handleAiAnalysis = async () => {
    setAnalyzing(true);
    const result = await analyzeInventoryHealth(products);
    setAiAnalysis(result);
    setAnalyzing(false);
  };

  const handleExportBackup = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `outlet-aseo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset
  };

  const goToReports = () => {
    navigate('/reports');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Resumen general de Outlet del Aseo</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleAiAnalysis}
            disabled={analyzing}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            <Sparkles size={18} />
            {analyzing ? 'Analizando...' : 'Análisis IA'}
          </button>
        </div>
      </div>

       {/* Persistence Banner */}
      <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
        <Laptop className="text-blue-600 mt-0.5 shrink-0" size={20} />
        <div>
           <h4 className="text-blue-900 font-medium text-sm">Modo de Funcionamiento Local</h4>
           <p className="text-blue-800 text-xs mt-1">
             Los datos se guardan automáticamente en este dispositivo.
           </p>
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl relative">
          <h3 className="text-indigo-900 font-semibold mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-600" />
            Insights de Gemini AI
          </h3>
          <div className="prose prose-indigo prose-sm max-w-none text-indigo-800 whitespace-pre-line">
            {aiAnalysis}
          </div>
          <button 
            onClick={() => setAiAnalysis('')} 
            className="absolute top-2 right-2 text-indigo-400 hover:text-indigo-600"
          >
            ×
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total Productos" 
          value={products.length} 
          icon={Package} 
          color="bg-blue-500" 
          subtext="Items únicos"
        />
        <StatCard 
          title="Stock Total" 
          value={totalStock} 
          icon={TrendingUp} 
          color="bg-green-500" 
          subtext="Unidades en almacén"
        />
        <StatCard 
          title="Stock Bajo" 
          value={lowStockProducts.length} 
          icon={AlertTriangle} 
          color="bg-red-500" 
          subtext={lowStockProducts.length > 0 ? "Click para ver reporte detallado" : "Todo en orden"}
          onClick={goToReports}
        />
      </div>

      {/* Backup & Restore Section */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white flex flex-col sm:flex-row items-center justify-between shadow-lg">
        <div className="flex items-center gap-4 mb-4 sm:mb-0">
          <div className="p-3 bg-white/10 rounded-full">
            <ShieldCheck size={24} className="text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Gestión de Datos</h3>
            <p className="text-gray-400 text-sm">Respalda tu inventario o restaura una copia de seguridad.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportBackup}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={18} />
            Respaldar
          </button>
          <button 
            onClick={handleImportClick}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload size={18} />
            Restaurar
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept=".json"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-semibold mb-6">Stock por Categoría</h3>
          <div className="h-64">
             {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                    Sin datos para mostrar
                </div>
             )}
          </div>
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {categoryData.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600">{entry.name} ({entry.value})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex justify-between items-center">
            <span>Productos con Poco Stock</span>
            <button onClick={goToReports} className="text-xs text-blue-600 hover:underline">
               Ver reporte completo
            </button>
          </h3>
          <div className="overflow-x-auto flex-1 max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium sticky top-0 bg-gray-50 shadow-sm z-10">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Producto</th>
                  <th className="px-4 py-3">Actual</th>
                  <th className="px-4 py-3 rounded-tr-lg">Mínimo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lowStockProducts.slice(0, 15).map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{product.name}</td>
                    <td className="px-4 py-3 text-red-600 font-bold">{product.currentStock}</td>
                    <td className="px-4 py-3 text-gray-500">{product.minStock}</td>
                  </tr>
                ))}
                {lowStockProducts.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                      No hay alertas de stock bajo
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;