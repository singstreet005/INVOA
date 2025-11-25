import React, { ReactNode, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ArrowRightLeft, Settings, Menu, X, CheckCircle, AlertCircle, Info, Eye, EyeOff, Store, Wallet, FileBarChart, Camera, Upload } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

interface LayoutProps {
  children: ReactNode;
}

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-600 text-white shadow-md'
          : 'text-gray-600 hover:bg-gray-100'
      }`
    }
  >
    <Icon size={20} />
    <span className="font-medium">{label}</span>
  </NavLink>
);

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error' | 'info', onClose: () => void }) => {
  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';
  const Icon = type === 'success' ? CheckCircle : type === 'error' ? AlertCircle : Info;

  return (
    <div className={`${bg} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-[300px] animate-fade-in-up`}>
      <Icon size={20} />
      <span className="flex-1 font-medium text-sm">{message}</span>
      <button onClick={onClose} className="hover:opacity-75"><X size={16} /></button>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  
  const { notifications, removeNotification, showFinancials, toggleFinancials, profileImage, updateProfileImage } = useInventory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert("La imagen es demasiado grande. Por favor usa una imagen menor a 2MB.");
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfileImage = () => {
    if (tempImageUrl) {
      updateProfileImage(tempImageUrl);
      setIsProfileModalOpen(false);
      setTempImageUrl('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Notifications Layer */}
      <div className="fixed bottom-4 right-4 z-[60] space-y-2 flex flex-col items-end pointer-events-none">
        {notifications.map(n => (
          <div key={n.id} className="pointer-events-auto">
            <Toast message={n.message} type={n.type} onClose={() => removeNotification(n.id)} />
          </div>
        ))}
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <div className="h-10 w-10 bg-blue-600 rounded-lg mr-3 flex items-center justify-center shrink-0">
            <Store className="text-white" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-gray-800 leading-tight">Outlet del Aseo</span>
            <span className="text-xs text-gray-500">Inventario Local</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-gray-500"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/inventory" icon={Package} label="Inventario" />
          <SidebarItem to="/movements" icon={ArrowRightLeft} label="Movimientos" />
          <SidebarItem to="/finance" icon={Wallet} label="Finanzas" />
          <SidebarItem to="/reports" icon={FileBarChart} label="Reportes" />
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 text-gray-400 text-xs">
             <Settings size={14} />
             <span>Datos guardados localmente</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-30">
          <button 
            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center ml-auto space-x-4">
             {/* Financial Toggle (for Inventory Table) */}
             <button 
                onClick={toggleFinancials}
                title={showFinancials ? "Ocultar montos" : "Mostrar montos"}
                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center"
             >
                {showFinancials ? <Eye size={20} /> : <EyeOff size={20} />}
             </button>

             {/* Profile Image Trigger */}
             <button 
               onClick={() => setIsProfileModalOpen(true)}
               className="relative group w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center overflow-hidden border border-gray-200 hover:border-blue-500 transition-all"
               title="Cambiar imagen de perfil"
             >
               {profileImage ? (
                 <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-white font-bold text-xs">OA</span>
               )}
               <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center">
                 <Camera size={12} className="text-white" />
               </div>
             </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Profile Image Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-fade-in-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-gray-900">Imagen de Perfil</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Sube una imagen desde tu dispositivo para usarla como avatar.
            </p>

            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Seleccionar archivo</label>
                  
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-1 text-sm text-gray-500"><span className="font-semibold">Click para subir</span></p>
                          <p className="text-xs text-gray-500">PNG, JPG (Max 2MB)</p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
               </div>

               {tempImageUrl && (
                 <div className="flex flex-col items-center my-2">
                   <p className="text-xs text-gray-500 mb-2">Vista previa:</p>
                   <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-blue-100 shadow-sm">
                      <img src={tempImageUrl} alt="Preview" className="w-full h-full object-cover" />
                   </div>
                 </div>
               )}

               <button 
                 onClick={handleSaveProfileImage}
                 disabled={!tempImageUrl}
                 className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 Guardar Imagen
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;