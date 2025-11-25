import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, StockMovement, MovementType } from '../types';

interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

interface InventoryContextType {
  products: Product[];
  movements: StockMovement[];
  notifications: Notification[];
  showFinancials: boolean;
  profileImage: string | null;
  toggleFinancials: () => void;
  addProduct: (product: Omit<Product, 'id' | 'lastUpdated'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  registerMovement: (productId: string, type: MovementType, quantity: number, reason: string) => boolean;
  getLowStockProducts: () => Product[];
  exportData: () => string;
  importData: (jsonData: string) => boolean;
  removeNotification: (id: number) => void;
  updateProfileImage: (url: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Base de datos inicial cargada desde el PDF proporcionado
const SAMPLE_PRODUCTS: Product[] = [
  { id: 'p1', sku: 'SKU-001', name: 'Care UP toallas húmedas adulto', description: '60 un', category: 'Cuidado Adulto', currentStock: 21, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p2', sku: 'SKU-002', name: 'Mascarilla Souni', description: '-', category: 'Salud / Botiquín', currentStock: 2, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p3', sku: 'SKU-003', name: 'destapador de cañería', description: '1 L', category: 'Limpieza Hogar', currentStock: 1, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p4', sku: 'SKU-004', name: 'Guante Nitrilo', description: 'Talla S/M', category: 'Limpieza Hogar', currentStock: 9, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p5', sku: 'SKU-005', name: 'Alcohol desinfectante', description: '1 L', category: 'Salud / Botiquín', currentStock: 1, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p6', sku: 'SKU-006', name: 'Alcohol desinfectante', description: '250 ml', category: 'Salud / Botiquín', currentStock: 4, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p7', sku: 'SKU-007', name: 'Clean Sing Beaver', description: '500 ml', category: 'Limpieza Hogar', currentStock: 2, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p8', sku: 'SKU-008', name: 'Fiorella protectores diarios', description: '200 un', category: 'Higiene Femenina', currentStock: 5, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p9', sku: 'SKU-009', name: 'Care Free protección largos', description: '40 un', category: 'Higiene Femenina', currentStock: 10, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p10', sku: 'SKU-010', name: 'Kotex protector', description: '40 un', category: 'Higiene Femenina', currentStock: 9, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p11', sku: 'SKU-011', name: 'Lady Soft toallas femeninas', description: '8 un', category: 'Higiene Femenina', currentStock: 27, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p12', sku: 'SKU-012', name: 'Lady Soft tela suave', description: '8 un', category: 'Higiene Femenina', currentStock: 10, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p13', sku: 'SKU-013', name: 'Lady Soft nocturna', description: '14 un', category: 'Higiene Femenina', currentStock: 8, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p14', sku: 'SKU-014', name: 'Lady Soft ultra delgada', description: '16 un', category: 'Higiene Femenina', currentStock: 11, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p15', sku: 'SKU-015', name: 'Lady Soft ultra delgada', description: '8 un', category: 'Higiene Femenina', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p16', sku: 'SKU-016', name: 'Algodón Swiss Beauty', description: '100 un', category: 'Cuidado Personal', currentStock: 4, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p17', sku: 'SKU-017', name: 'Cera Crema Brillina', description: '360 ml', category: 'Limpieza Hogar', currentStock: 18, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p18', sku: 'SKU-018', name: 'Babysec toallas húmedas agua 99%', description: '70 un', category: 'Bebé', currentStock: 24, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p19', sku: 'SKU-019', name: 'Care UP toallitas húmedas Souni', description: '-', category: 'Cuidado Personal', currentStock: 30, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p20', sku: 'SKU-020', name: 'Virutilla piso', description: '-', category: 'Limpieza Hogar', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p21', sku: 'SKU-021', name: 'Granadina', description: '750 cc', category: 'Otros', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p22', sku: 'SKU-022', name: 'Mascarilla para niños', description: '50 un', category: 'Salud / Botiquín', currentStock: 5, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p23', sku: 'SKU-023', name: 'Glade Automático Ambiental', description: '-', category: 'Aromatizante', currentStock: 1, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p24', sku: 'SKU-024', name: 'Tanax', description: '100 g', category: 'Insecticida', currentStock: 5, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p25', sku: 'SKU-025', name: 'Papel Films', description: '-', category: 'Cocina', currentStock: 28, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p26', sku: 'SKU-026', name: 'Bolsas Basura', description: '80x110', category: 'Limpieza Hogar', currentStock: 80, minStock: 20, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p27', sku: 'SKU-027', name: 'Lavaloza Virginia', description: '1 L', category: 'Limpieza Hogar', currentStock: 8, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p28', sku: 'SKU-028', name: 'Shampoo Ballerina', description: '750 ml', category: 'Cuidado Capilar', currentStock: 27, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p29', sku: 'SKU-029', name: 'Paños Amarillo', description: '-', category: 'Limpieza Hogar', currentStock: 200, minStock: 20, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p30', sku: 'SKU-030', name: 'Ariel', description: '400 g', category: 'Detergente', currentStock: 24, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p31', sku: 'SKU-031', name: 'Betún Pasta de zapato', description: '-', category: 'Calzado', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p32', sku: 'SKU-032', name: 'Simons Pantalla Solar', description: '-', category: 'Cuidado Personal', currentStock: 22, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p33', sku: 'SKU-033', name: 'Pila Eveready', description: '-', category: 'Otros', currentStock: 60, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p34', sku: 'SKU-034', name: 'Encendedor Ronson', description: '-', category: 'Otros', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p35', sku: 'SKU-035', name: 'Encendedor Ronson bioplástico', description: '-', category: 'Otros', currentStock: 7, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p36', sku: 'SKU-036', name: 'Shampoo Tío Nacho anti caída', description: '-', category: 'Cuidado Capilar', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p37', sku: 'SKU-037', name: 'Shampoo Fructis', description: '-', category: 'Cuidado Capilar', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p38', sku: 'SKU-038', name: 'Shampoo Dove', description: '-', category: 'Cuidado Capilar', currentStock: 8, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p39', sku: 'SKU-039', name: 'Shampoo Linic', description: '-', category: 'Cuidado Capilar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p40', sku: 'SKU-040', name: 'Shampoo Biokerasse', description: '-', category: 'Cuidado Capilar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p41', sku: 'SKU-041', name: 'Shampoo Garnier Fructis', description: '-', category: 'Cuidado Capilar', currentStock: 1, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p42', sku: 'SKU-042', name: 'Shampoo L\'Oréal Elvive', description: '-', category: 'Cuidado Capilar', currentStock: 18, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p43', sku: 'SKU-043', name: 'Shampoo Sedal', description: '-', category: 'Cuidado Capilar', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p44', sku: 'SKU-044', name: 'Shampoo Pantene', description: '-', category: 'Cuidado Capilar', currentStock: 17, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p45', sku: 'SKU-045', name: 'Shampoo Head & Shoulders', description: '-', category: 'Cuidado Capilar', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p46', sku: 'SKU-046', name: 'Shampoo Baby Lee Kids', description: '-', category: 'Bebé', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p47', sku: 'SKU-047', name: 'Shampoo Babyland', description: '410 ml', category: 'Bebé', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p48', sku: 'SKU-048', name: 'Pasta dental Colgate Kids', description: '-', category: 'Higiene Bucal', currentStock: 1, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p49', sku: 'SKU-049', name: 'Pasta dental Aquafresh niño', description: '-', category: 'Higiene Bucal', currentStock: 1, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p50', sku: 'SKU-050', name: 'Aquafresh active white', description: '-', category: 'Higiene Bucal', currentStock: 1, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p51', sku: 'SKU-051', name: 'Pepsodent xtra whitening', description: '-', category: 'Higiene Bucal', currentStock: 1, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p52', sku: 'SKU-052', name: 'Colgate luminous white', description: '-', category: 'Higiene Bucal', currentStock: 2, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p53', sku: 'SKU-053', name: 'Axe', description: '-', category: 'Desodorante', currentStock: 23, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p54', sku: 'SKU-054', name: 'Rexona barra', description: '-', category: 'Desodorante', currentStock: 7, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p55', sku: 'SKU-055', name: 'Old Spice', description: '-', category: 'Desodorante', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p56', sku: 'SKU-056', name: 'Old Spice barra', description: '-', category: 'Desodorante', currentStock: 2, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p57', sku: 'SKU-057', name: 'Etiquet', description: '-', category: 'Desodorante', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p58', sku: 'SKU-058', name: 'Speed Stick', description: '-', category: 'Desodorante', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p59', sku: 'SKU-059', name: 'Rexona', description: '-', category: 'Desodorante', currentStock: 8, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p60', sku: 'SKU-060', name: 'Nivea', description: '-', category: 'Desodorante', currentStock: 24, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p61', sku: 'SKU-061', name: 'Gillette barra', description: '-', category: 'Desodorante', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p62', sku: 'SKU-062', name: 'Dove', description: '-', category: 'Cuidado Personal', currentStock: 8, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p63', sku: 'SKU-063', name: 'Perfume Gold Deluxe', description: '-', category: 'Perfumería', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p64', sku: 'SKU-064', name: 'Colonia Inglesa', description: '-', category: 'Perfumería', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p65', sku: 'SKU-065', name: 'Gillette crema shave foam', description: '-', category: 'Afeitado', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p66', sku: 'SKU-066', name: 'Pétalos de Algodón', description: '80 un', category: 'Cuidado Personal', currentStock: 17, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p67', sku: 'SKU-067', name: 'Fósforos Copihue', description: '-', category: 'Otros', currentStock: 20, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p68', sku: 'SKU-068', name: 'Mata Moscas', description: '-', category: 'Insecticida', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p69', sku: 'SKU-069', name: 'Silicona car silicone team', description: '480 cm', category: 'Automóvil', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p70', sku: 'SKU-070', name: 'Winnex Ambiental', description: '250 ml', category: 'Aromatizante', currentStock: 41, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p71', sku: 'SKU-071', name: 'Ammens Desodorante para pies', description: '165 g', category: 'Cuidado Personal', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p72', sku: 'SKU-072', name: 'Shampoo Babyland Kids', description: '410 ml', category: 'Bebé', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p73', sku: 'SKU-073', name: 'Babyland Acondicionador', description: '410 ml', category: 'Bebé', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p74', sku: 'SKU-074', name: 'Babyland Bálsamo', description: '410 ml', category: 'Bebé', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p75', sku: 'SKU-075', name: 'Old Spice Desodorante', description: '150 ml', category: 'Desodorante', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p76', sku: 'SKU-076', name: 'Rexona Sogen barra', description: '-', category: 'Desodorante', currentStock: 9, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p77', sku: 'SKU-077', name: 'Nivea Men Desodorante', description: '150 ml', category: 'Desodorante', currentStock: 2, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p78', sku: 'SKU-078', name: 'Dove Men Care', description: '150 ml', category: 'Cuidado Personal', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p79', sku: 'SKU-079', name: 'Speed Stick Desodorante', description: '-', category: 'Desodorante', currentStock: 20, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p80', sku: 'SKU-080', name: 'Speed Stick Barra', description: '50 g', category: 'Desodorante', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p81', sku: 'SKU-081', name: 'Nivea Men', description: '150 ml', category: 'Cuidado Personal', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p82', sku: 'SKU-082', name: 'Nivea Men Black White', description: '150 ml', category: 'Desodorante', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p83', sku: 'SKU-083', name: 'Head Shoulders', description: '375 ml', category: 'Cuidado Capilar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p84', sku: 'SKU-084', name: 'Raid', description: '360 cc', category: 'Insecticida', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p85', sku: 'SKU-085', name: 'Shampoo Aceite de Argan', description: '500 gr', category: 'Cuidado Capilar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p86', sku: 'SKU-086', name: 'Deo pies Mujer Desodorante', description: '126 ml', category: 'Cuidado Personal', currentStock: 9, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p87', sku: 'SKU-087', name: 'Limpiador desinfectante Igenix', description: '900 ml', category: 'Limpieza Hogar', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p88', sku: 'SKU-088', name: 'Downy Suavizante', description: '1 L', category: 'Lavandería', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p89', sku: 'SKU-089', name: 'Poet Limpia piso', description: '900 ml', category: 'Limpieza Hogar', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p90', sku: 'SKU-090', name: 'Clorinda', description: '500 ml', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p91', sku: 'SKU-091', name: 'Clorox quita manchas', description: '370 g', category: 'Lavandería', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p92', sku: 'SKU-092', name: 'Desodorante Ambiental Winnex', description: '250 ml', category: 'Aromatizante', currentStock: 34, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p93', sku: 'SKU-093', name: 'Bio Fresco en polvo', description: '2.5 kg', category: 'Detergente', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p94', sku: 'SKU-094', name: 'Sapolio Ambiental', description: '360 ml', category: 'Aromatizante', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p95', sku: 'SKU-095', name: 'Poet Ambiental', description: '360 ml', category: 'Aromatizante', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p96', sku: 'SKU-096', name: 'Glade Ambiental', description: '305 g', category: 'Aromatizante', currentStock: 2, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p97', sku: 'SKU-097', name: 'Glade Ambiental', description: '360 cm', category: 'Aromatizante', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p98', sku: 'SKU-098', name: 'Aroom Ambiental', description: '225 g', category: 'Aromatizante', currentStock: 24, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p99', sku: 'SKU-099', name: 'Vanish', description: '300 ml', category: 'Lavandería', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p100', sku: 'SKU-100', name: 'Omo Ultra Power líquido', description: '500 ml', category: 'Detergente', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p101', sku: 'SKU-101', name: 'Omo piel sensible líquido', description: '500 ml', category: 'Detergente', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p102', sku: 'SKU-102', name: 'Rinso líquido', description: '500 ml', category: 'Detergente', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p103', sku: 'SKU-103', name: 'Glade Ambiental Repuesto', description: '175 g', category: 'Aromatizante', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p104', sku: 'SKU-104', name: 'Pure Air Wick Aromatizante Ambiental', description: '250 ml', category: 'Aromatizante', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p105', sku: 'SKU-105', name: 'Vais Aromatizante telas', description: '500 ml', category: 'Aromatizante', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p106', sku: 'SKU-106', name: 'Igenix toallas Húmedas', description: '50 un', category: 'Limpieza Hogar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p107', sku: 'SKU-107', name: 'Igenix toallas Húmedas Desinfectante', description: '40 un', category: 'Limpieza Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p108', sku: 'SKU-108', name: 'Igenix Desinfectante Ambiental', description: '250 ml', category: 'Limpieza Hogar', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p109', sku: 'SKU-109', name: 'Lysoform', description: '360 cm', category: 'Limpieza Hogar', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p110', sku: 'SKU-110', name: 'Lysoform Desinfectante', description: '238 g', category: 'Limpieza Hogar', currentStock: 36, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p111', sku: 'SKU-111', name: 'Bio', description: '3 L', category: 'Detergente', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p112', sku: 'SKU-112', name: 'Rommel Detergente Bebé', description: '3 L', category: 'Detergente', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p113', sku: 'SKU-113', name: 'Rommel Detergente', description: '3 L', category: 'Detergente', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p114', sku: 'SKU-114', name: 'Omo Ultra Power', description: '800 g', category: 'Detergente', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p115', sku: 'SKU-115', name: 'Omo Ultra Power', description: '400 g', category: 'Detergente', currentStock: 17, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p116', sku: 'SKU-116', name: 'Ariel Doble Power', description: '400 g', category: 'Detergente', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p117', sku: 'SKU-117', name: 'Omo concentrado', description: '400 g', category: 'Detergente', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p118', sku: 'SKU-118', name: 'Ariel concentrado líquido', description: '1.8 L', category: 'Detergente', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p119', sku: 'SKU-119', name: 'Fuzol Suavizante', description: '1 L', category: 'Lavandería', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p120', sku: 'SKU-120', name: 'Soft Suavizante', description: '1 L', category: 'Lavandería', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p121', sku: 'SKU-121', name: 'Downy Suavizante', description: '500 ml', category: 'Lavandería', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p122', sku: 'SKU-122', name: 'Downy Suavizante', description: '450 ml', category: 'Lavandería', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p123', sku: 'SKU-123', name: 'Winnex Removedor Manchas', description: '500 grs', category: 'Lavandería', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p124', sku: 'SKU-124', name: 'Jabón Popeye', description: '17 g', category: 'Lavandería', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p125', sku: 'SKU-125', name: 'Detergente líquido Popeye', description: '800 ml', category: 'Detergente', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p126', sku: 'SKU-126', name: 'Limpia piso Excell', description: '900 ml', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p127', sku: 'SKU-127', name: 'Removedor de cera', description: '1 L', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p128', sku: 'SKU-128', name: 'Sapolio limpia inodoro', description: '500 ml', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p129', sku: 'SKU-129', name: 'Virginia Cera Líquida', description: '400 ml', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p130', sku: 'SKU-130', name: 'Excell limpiador piso flotante', description: '900 ml', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p131', sku: 'SKU-131', name: 'Excell Removedor', description: '900 ml', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p132', sku: 'SKU-132', name: 'Excell Abrillantador', description: '900 ml', category: 'Limpieza Hogar', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p133', sku: 'SKU-133', name: 'Detergente de Ropa Virginia', description: '2.5 kg', category: 'Detergente', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p134', sku: 'SKU-134', name: 'Bio Winnex Detergente', description: '2.5 kg', category: 'Detergente', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p135', sku: 'SKU-135', name: 'Guantes domésticos látex Brillex', description: '-', category: 'Limpieza Hogar', currentStock: 28, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p136', sku: 'SKU-136', name: 'Rommel Cloro De Ropa', description: '1 L', category: 'Lavandería', currentStock: 14, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p137', sku: 'SKU-137', name: 'Clorox Ropa', description: '930 g', category: 'Lavandería', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p138', sku: 'SKU-138', name: 'Clorinda Ropa color', description: '930 g', category: 'Lavandería', currentStock: 3, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p139', sku: 'SKU-139', name: 'Raid Max', description: '381 g', category: 'Insecticida', currentStock: 11, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p140', sku: 'SKU-140', name: 'Esponja microfibra', description: '-', category: 'Limpieza Hogar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p141', sku: 'SKU-141', name: 'Escobilla de Ropa', description: '-', category: 'Lavandería', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p142', sku: 'SKU-142', name: 'Escobilla de ropa con mango', description: '-', category: 'Lavandería', currentStock: 14, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p143', sku: 'SKU-143', name: 'Swan Papel higiénico 6 Rollos', description: '-', category: 'Papel Higiénico', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p144', sku: 'SKU-144', name: 'Confort 4 Rollos', description: '100 mts', category: 'Papel Higiénico', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p145', sku: 'SKU-145', name: 'Ovella 4 Rollos', description: '50 mts', category: 'Papel Higiénico', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p146', sku: 'SKU-146', name: 'Swan Premium 4 Rollos', description: '50 mts', category: 'Papel Higiénico', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p147', sku: 'SKU-147', name: 'Colgador de Ropa', description: '-', category: 'Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p148', sku: 'SKU-148', name: 'Basurero pequeño', description: '-', category: 'Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p149', sku: 'SKU-149', name: 'Cotidian G', description: '20 un', category: 'Cuidado Adulto', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p150', sku: 'SKU-150', name: 'Cotidian M', description: '-', category: 'Cuidado Adulto', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p151', sku: 'SKU-151', name: 'Cotidian Pants', description: '16 un', category: 'Cuidado Adulto', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p152', sku: 'SKU-152', name: 'Cotidian Plus G', description: '20 un', category: 'Cuidado Adulto', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p153', sku: 'SKU-153', name: 'Cotidian G', description: '8 un', category: 'Cuidado Adulto', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p154', sku: 'SKU-154', name: 'Pampers XXG y XG', description: '16 un', category: 'Bebé', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p155', sku: 'SKU-155', name: 'Bebisec M y P', description: '20 un', category: 'Bebé', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p156', sku: 'SKU-156', name: 'Care UP protector de cama', description: '-', category: 'Cuidado Adulto', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p157', sku: 'SKU-157', name: 'Win Plus Sabanillas', description: '8 un', category: 'Cuidado Adulto', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p158', sku: 'SKU-158', name: 'Care UP Apósito Multiuso', description: '20 un', category: 'Cuidado Adulto', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p159', sku: 'SKU-159', name: 'Win toallas Húmeda para Adulto', description: '95 un', category: 'Cuidado Adulto', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p160', sku: 'SKU-160', name: 'Detergente + Suavizante Green', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 29, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p161', sku: 'SKU-161', name: 'Detergente Líquido Brik\'s', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p162', sku: 'SKU-162', name: 'Detergente Omo Aloe Vera Soft', description: '2.7 Kg', category: 'Limpieza Hogar', currentStock: 14, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p163', sku: 'SKU-163', name: 'Detergente Omo Ultra Power', description: '2.7 Kg', category: 'Limpieza Hogar', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p164', sku: 'SKU-164', name: 'Lavado Inteligente RO', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p165', sku: 'SKU-165', name: 'Suavizante Brik\'s Ropa', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p166', sku: 'SKU-166', name: 'Suavizante Fuzol', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p167', sku: 'SKU-167', name: 'Cloro Gel Brik\'s', description: '5 Kg', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p168', sku: 'SKU-168', name: 'Cloro Gel Clorinda', description: '2 Kg', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p169', sku: 'SKU-169', name: 'Clorox Antihongos', description: '500 ml', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p170', sku: 'SKU-170', name: 'Lavaloza Brik\'s', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p171', sku: 'SKU-171', name: 'Lavaloza Brik\'s', description: '2 Lts', category: 'Limpieza Hogar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p172', sku: 'SKU-172', name: 'Lavaloza Brik\'s Pomelo', description: '2 Lts', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p173', sku: 'SKU-173', name: 'Lavaloza Virginia', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p174', sku: 'SKU-174', name: 'Lavaloza Excell', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p175', sku: 'SKU-175', name: 'Lavaloza Fuzol', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p176', sku: 'SKU-176', name: 'Lavaloza Quix', description: '1.5 Lts / 750ml', category: 'Limpieza Hogar', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p177', sku: 'SKU-177', name: 'Lavaloza Quix', description: '500 ml', category: 'Limpieza Hogar', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p178', sku: 'SKU-178', name: 'Lavaloza Quix Azul', description: '300 ml', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p179', sku: 'SKU-179', name: 'Lavaloza Win', description: '1.5 Lts', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p180', sku: 'SKU-180', name: 'Lavaloza Win', description: '750 ml', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p181', sku: 'SKU-181', name: 'Lavaloza Magistral', description: '500 ml', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p182', sku: 'SKU-182', name: 'Lavaloza Disama', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p183', sku: 'SKU-183', name: 'Desengrasante Industrial Disama', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p184', sku: 'SKU-184', name: 'Desengrasante Disama', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p185', sku: 'SKU-185', name: 'Desengrasante Brik\'s', description: '500 cc', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p186', sku: 'SKU-186', name: 'Limpia Pisos Brik\'s', description: '2 Lts', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p187', sku: 'SKU-187', name: 'Limpiavidrios', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p188', sku: 'SKU-188', name: 'Limpiavidrios Brik\'s', description: '500 ml', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p189', sku: 'SKU-189', name: 'Limpiavidrios Virutex (y Recarga)', description: '500 ml', category: 'Limpieza Hogar', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p190', sku: 'SKU-190', name: 'Limpiavidrios Romel', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p191', sku: 'SKU-191', name: 'Cera Líquida Autobril Virginia', description: '1 Lt / 400ml', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p192', sku: 'SKU-192', name: 'Cera Brillina', description: '340 ml', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p193', sku: 'SKU-193', name: 'Limpiahornos Virginia', description: '400 cc', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p194', sku: 'SKU-194', name: 'Lustramuebles Virginia', description: '360 cc / 250ml', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p195', sku: 'SKU-195', name: 'Limpiador Abrasivo Winnex', description: '-', category: 'Limpieza Hogar', currentStock: 32, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p196', sku: 'SKU-196', name: 'Limpiador Crema Winnex', description: '750 gr', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p197', sku: 'SKU-197', name: 'Cif Crema', description: '750 gr', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p198', sku: 'SKU-198', name: 'Excell Limpiador + Abrillantador', description: '900 ml', category: 'Limpieza Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p199', sku: 'SKU-199', name: 'Excell Abrillantador Piso Flotante', description: '900 ml', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p200', sku: 'SKU-200', name: 'Eliminador de Sarro Disama', description: '1 Lt', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p201', sku: 'SKU-201', name: 'Quitamanchas Líquido Virutex', description: '300 ml', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p202', sku: 'SKU-202', name: 'Soda Cáustica', description: 'Envase', category: 'Limpieza Hogar', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p203', sku: 'SKU-203', name: 'Jabón Mecánico', description: '5 Lts', category: 'Limpieza Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p204', sku: 'SKU-204', name: 'Pato Purific', description: '360', category: 'Limpieza Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p205', sku: 'SKU-205', name: 'Pastilla para Estanque (x3)', description: 'Pack', category: 'Limpieza Hogar', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p206', sku: 'SKU-206', name: 'Pastillas Estanque Teddy', description: '3x2', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p207', sku: 'SKU-207', name: 'Pastilla Inodoro', description: '2 uds', category: 'Limpieza Hogar', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p208', sku: 'SKU-208', name: 'Sopapo', description: '-', category: 'Limpieza Hogar', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p209', sku: 'SKU-209', name: 'Bolsas de Basura', description: '50x70', category: 'Limpieza Hogar', currentStock: 43, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p210', sku: 'SKU-210', name: 'Bolsas de Basura', description: '70x90', category: 'Limpieza Hogar', currentStock: 23, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p211', sku: 'SKU-211', name: 'Bolsas de Basura', description: '80x100', category: 'Limpieza Hogar', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p212', sku: 'SKU-212', name: 'Bolsas de Basura', description: '105x150', category: 'Limpieza Hogar', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p213', sku: 'SKU-213', name: 'Bolsas de Basura', description: '45x55', category: 'Limpieza Hogar', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p214', sku: 'SKU-214', name: 'Guantes Limpieza Aseo', description: '-', category: 'Limpieza Hogar', currentStock: 20, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p215', sku: 'SKU-215', name: 'Esponjas de paquete', description: '4 un', category: 'Limpieza Hogar', currentStock: 40, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p216', sku: 'SKU-216', name: 'Esponjas individuales', description: '-', category: 'Limpieza Hogar', currentStock: 70, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p217', sku: 'SKU-217', name: 'Paño Esponja', description: '18x20 cm', category: 'Limpieza Hogar', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p218', sku: 'SKU-218', name: 'Virutilla de olla', description: 'Unidad', category: 'Limpieza Hogar', currentStock: 60, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p219', sku: 'SKU-219', name: 'Brillex Trapero Húmedo', description: '7 uds', category: 'Limpieza Hogar', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p220', sku: 'SKU-220', name: 'Traperos (Amarillo/Blanco/Azul)', description: '-', category: 'Limpieza Hogar', currentStock: 45, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p221', sku: 'SKU-221', name: 'Mopa Repuestos', description: '-', category: 'Limpieza Hogar', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p222', sku: 'SKU-222', name: 'Mopa Plana 360 Ultra Clean', description: '-', category: 'Limpieza Hogar', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p223', sku: 'SKU-223', name: 'Escobillón Azul Virutex', description: '-', category: 'Limpieza Hogar', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p224', sku: 'SKU-224', name: 'Escobas Aileda Multiusos', description: '-', category: 'Limpieza Hogar', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p225', sku: 'SKU-225', name: 'Escobas Lava Mas', description: '-', category: 'Limpieza Hogar', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p226', sku: 'SKU-226', name: 'Palas Plásticas Negras', description: '-', category: 'Limpieza Hogar', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p227', sku: 'SKU-227', name: 'Perros de Ropa (Madera/Plástico)', description: '-', category: 'Limpieza Hogar', currentStock: 11, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p228', sku: 'SKU-228', name: 'Shampoo Elvive', description: 'Rojo/Blanco/Morado', category: 'Cuidado Personal', currentStock: 45, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p229', sku: 'SKU-229', name: 'Shampoo Pantene', description: 'Rojo/Verde/Naranja', category: 'Cuidado Personal', currentStock: 20, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p230', sku: 'SKU-230', name: 'Shampoo Ballerina', description: '900 ml', category: 'Cuidado Personal', currentStock: 39, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p231', sku: 'SKU-231', name: 'Acondicionador Ballerina', description: '900 ml', category: 'Cuidado Personal', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p232', sku: 'SKU-232', name: 'Jabón Líquido Ballerina', description: '900 ml', category: 'Cuidado Personal', currentStock: 33, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p233', sku: 'SKU-233', name: 'Jabón Ballerina', description: '350 ml', category: 'Cuidado Personal', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p234', sku: 'SKU-234', name: 'Shampoo Family / Babyland', description: '-', category: 'Cuidado Personal', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p235', sku: 'SKU-235', name: 'Shampoo Kids Rojo', description: '410 ml', category: 'Cuidado Personal', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p236', sku: 'SKU-236', name: 'Shampoo Fructis (Coco/Verde)', description: '-', category: 'Cuidado Personal', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p237', sku: 'SKU-237', name: 'Acondicionador Garnier Fructis', description: '350 ml', category: 'Cuidado Personal', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p238', sku: 'SKU-238', name: 'Kids Baby Lee Acondicionador', description: '-', category: 'Cuidado Personal', currentStock: 40, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p239', sku: 'SKU-239', name: 'Head & Shoulders (Limpieza/Manz)', description: '-', category: 'Cuidado Personal', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p240', sku: 'SKU-240', name: 'Jabón Le Sancy Barra', description: '-', category: 'Cuidado Personal', currentStock: 26, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p241', sku: 'SKU-241', name: 'Jabón Lux Barra', description: '-', category: 'Cuidado Personal', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p242', sku: 'SKU-242', name: 'Jabón Dove Barra', description: '-', category: 'Cuidado Personal', currentStock: 24, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p243', sku: 'SKU-243', name: 'Jabón Glicerina Simonds', description: '750 ml', category: 'Cuidado Personal', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p244', sku: 'SKU-244', name: 'Alcohol Gel', description: '5 Lts', category: 'Cuidado Personal', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p245', sku: 'SKU-245', name: 'Alcohol Desinfectante', description: '250 ml', category: 'Cuidado Personal', currentStock: 4, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p246', sku: 'SKU-246', name: 'Pasta Dental Colgate', description: '75ml / 150ml', category: 'Cuidado Personal', currentStock: 32, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p247', sku: 'SKU-247', name: 'Pasta Dental Colgate', description: '3x2 / Packs', category: 'Cuidado Personal', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p248', sku: 'SKU-248', name: 'Pasta Dental Aquafresh', description: 'Pack 3 / 160g', category: 'Cuidado Personal', currentStock: 13, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p249', sku: 'SKU-249', name: 'Pasta Dental Pepsodent', description: 'Pack 3x2 / 84ml', category: 'Cuidado Personal', currentStock: 5, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p250', sku: 'SKU-250', name: 'Cepillo Dental (Varios)', description: '-', category: 'Cuidado Personal', currentStock: 10, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p251', sku: 'SKU-251', name: 'Desodorante Axe', description: '-', category: 'Cuidado Personal', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p252', sku: 'SKU-252', name: 'Desodorante Rexona (Barra/Clinical)', description: '-', category: 'Cuidado Personal', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p253', sku: 'SKU-253', name: 'Desodorante Old Spice (Barra/Aerosol)', description: '-', category: 'Cuidado Personal', currentStock: 17, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p254', sku: 'SKU-254', name: 'Desodorante Lady Speed Stick', description: 'Barra/Aerosol', category: 'Cuidado Personal', currentStock: 33, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p255', sku: 'SKU-255', name: 'Desodorante Nivea (Mujer/Men)', description: 'Aerosol/Barra', category: 'Cuidado Personal', currentStock: 20, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p256', sku: 'SKU-256', name: 'Desodorante Dove Aerosol', description: '-', category: 'Cuidado Personal', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p257', sku: 'SKU-257', name: 'Protector Solar Leblon', description: '190 g', category: 'Cuidado Personal', currentStock: 11, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p258', sku: 'SKU-258', name: 'Crema Nivea / Teatric', description: '300 ml', category: 'Cuidado Personal', currentStock: 14, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p259', sku: 'SKU-259', name: 'Listerine', description: '1 Lt / 180ml', category: 'Cuidado Personal', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p260', sku: 'SKU-260', name: 'Cotidian Premium Adulto', description: '20 ud', category: 'Cuidado Personal', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p261', sku: 'SKU-261', name: 'Cotidian (Verde/Rojo/Azul/Pants)', description: 'Talla G/XG', category: 'Cuidado Personal', currentStock: 10, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p262', sku: 'SKU-262', name: 'Algodón SwissBeauty', description: '100 un', category: 'Cuidado Personal', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p263', sku: 'SKU-263', name: 'Papel Higiénico Swan', description: '24 Rollos', category: 'Papel / Desechables', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p264', sku: 'SKU-264', name: 'Papel Higiénico Swan Premium', description: '24x25 mts', category: 'Papel / Desechables', currentStock: 16, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p265', sku: 'SKU-265', name: 'Papel Higiénico Swan Rendidor', description: '4 Rollos', category: 'Papel / Desechables', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p266', sku: 'SKU-266', name: 'Papel Higiénico Elite', description: '50 mts', category: 'Papel / Desechables', currentStock: 25, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p267', sku: 'SKU-267', name: 'Papel Higiénico Confort', description: '100 mts', category: 'Papel / Desechables', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p268', sku: 'SKU-268', name: 'Papel Higiénico Confort', description: '50 mts', category: 'Papel / Desechables', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p269', sku: 'SKU-269', name: 'Papel Hig. Industrial (Ecom/Rendipel)', description: '6 Rollos', category: 'Papel / Desechables', currentStock: 26, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p270', sku: 'SKU-270', name: 'Toalla de Papel Swan', description: '70 mts', category: 'Papel / Desechables', currentStock: 2, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p271', sku: 'SKU-271', name: 'Toalla Papel Swan', description: '100 mts', category: 'Papel / Desechables', currentStock: 4, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p272', sku: 'SKU-272', name: 'Toalla Nova Gigante', description: '-', category: 'Papel / Desechables', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p273', sku: 'SKU-273', name: 'Toalla Papel Rendipel', description: '250 mts', category: 'Papel / Desechables', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p274', sku: 'SKU-274', name: 'Toalla Papel Prepicada', description: '4 Unidades', category: 'Papel / Desechables', currentStock: 8, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p275', sku: 'SKU-275', name: 'Toalla Elite', description: '2 un 20mts', category: 'Papel / Desechables', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p276', sku: 'SKU-276', name: 'Toallitas Húmedas Care Up', description: '50/90 uds', category: 'Papel / Desechables', currentStock: 22, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p277', sku: 'SKU-277', name: 'Toallas Desinfectantes', description: '80 uds', category: 'Papel / Desechables', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p278', sku: 'SKU-278', name: 'Toallitas Húmedas Antibacteriales', description: '50 uds', category: 'Papel / Desechables', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p279', sku: 'SKU-279', name: 'Pañuelos Desechables Elite/CareUp', description: 'Pack/10un', category: 'Papel / Desechables', currentStock: 18, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p280', sku: 'SKU-280', name: 'Servilletas Swan', description: '300 un', category: 'Papel / Desechables', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p281', sku: 'SKU-281', name: 'Servilletas Elite', description: 'Paquete', category: 'Papel / Desechables', currentStock: 6, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p282', sku: 'SKU-282', name: 'Aromatizante Arom', description: 'Spray', category: 'Aromatizante', currentStock: 9, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p283', sku: 'SKU-283', name: 'Aromatizante Vehículo Pino', description: '-', category: 'Aromatizante', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p284', sku: 'SKU-284', name: 'Desodorante Ambiental Winnex', description: '1 Lt', category: 'Aromatizante', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p285', sku: 'SKU-285', name: 'Ambientador Sapolio', description: '360 ml', category: 'Aromatizante', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p286', sku: 'SKU-286', name: 'Glade Automático / Enchufe', description: '-', category: 'Aromatizante', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p287', sku: 'SKU-287', name: 'Air Wick Enchufe', description: '-', category: 'Aromatizante', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p288', sku: 'SKU-288', name: 'Tanax Polvo', description: '100 gr', category: 'Insecticidas', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p289', sku: 'SKU-289', name: 'Raid Max / Mata Arañas', description: '360 / 222gr', category: 'Insecticidas', currentStock: 19, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p290', sku: 'SKU-290', name: 'Killer Insecticida', description: '-', category: 'Insecticidas', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p291', sku: 'SKU-291', name: 'Klerat Pellet', description: '50 gr', category: 'Insecticidas', currentStock: 25, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p292', sku: 'SKU-292', name: 'Matamoscas', description: '-', category: 'Insecticidas', currentStock: 37, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p293', sku: 'SKU-293', name: 'Repelente de Insectos', description: '200 ml', category: 'Insecticidas', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p294', sku: 'SKU-294', name: 'Shampoo Automotriz (Disama)', description: '5 Lts / 1 Lt', category: 'Automóvil', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p295', sku: 'SKU-295', name: 'Silicona Líquida (Disama/Team)', description: '5 Lts / 1 Lt', category: 'Automóvil', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p296', sku: 'SKU-296', name: 'Silicona Team', description: '480 cm3', category: 'Automóvil', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p297', sku: 'SKU-297', name: 'Renovador de Goma/Neumáticos', description: '5 Lts / 1 Lt', category: 'Automóvil', currentStock: 10, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p298', sku: 'SKU-298', name: 'Agua Verde Aquacol', description: '5 Lts', category: 'Automóvil', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p299', sku: 'SKU-299', name: 'Pilas Energizer Max AA', description: '1 un', category: 'Otros', currentStock: 46, minStock: 10, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p300', sku: 'SKU-300', name: 'Pilas Duracell', description: 'D2', category: 'Otros', currentStock: 3, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p301', sku: 'SKU-301', name: 'Ronson Gas Universal', description: '150 ml', category: 'Otros', currentStock: 1, minStock: 1, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p302', sku: 'SKU-302', name: 'Nenegloss Pomada', description: '-', category: 'Salud / Botiquín', currentStock: 15, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p303', sku: 'SKU-303', name: 'Guateros Hot Water Bottle', description: '2 Lts', category: 'Hogar', currentStock: 7, minStock: 2, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p304', sku: 'SKU-304', name: 'Cepillo para Vasos Aileda', description: '-', category: 'Hogar', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p305', sku: 'SKU-305', name: 'Film Plástico / Aluminio', description: '-', category: 'Cocina', currentStock: 12, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() },
  { id: 'p306', sku: 'SKU-306', name: 'Fósforos Copihue', description: 'Pack', category: 'Hogar', currentStock: 18, minStock: 5, purchasePrice: 0, salePrice: 0, lastUpdated: new Date().toISOString() }
];

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [showFinancials, setShowFinancials] = useState(true);

  const [products, setProducts] = useState<Product[]>(() => {
    try {
      // Usamos 'v4' para forzar la recarga con los nuevos datos del PDF
      const saved = localStorage.getItem('inventory_products_v4');
      return saved ? JSON.parse(saved) : SAMPLE_PRODUCTS;
    } catch (e) {
      return SAMPLE_PRODUCTS;
    }
  });

  const [movements, setMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('inventory_movements_v4');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    try {
      return localStorage.getItem('outlet_profile_image');
    } catch (e) {
      return null;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    localStorage.setItem('inventory_products_v4', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('inventory_movements_v4', JSON.stringify(movements));
  }, [movements]);

  const toggleFinancials = () => {
    setShowFinancials(prev => !prev);
  };
  
  const updateProfileImage = (url: string) => {
    setProfileImage(url);
    localStorage.setItem('outlet_profile_image', url);
    showNotification('Imagen de perfil actualizada', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { message, type, id }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addProduct = (productData: Omit<Product, 'id' | 'lastUpdated'>) => {
    const newProduct: Product = {
      ...productData,
      id: crypto.randomUUID(),
      lastUpdated: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);
    showNotification(`Producto "${newProduct.name}" agregado`, 'success');
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates, lastUpdated: new Date().toISOString() } : p));
    showNotification('Producto actualizado correctamente', 'success');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotification('Producto eliminado', 'info');
  };

  const registerMovement = (productId: string, type: MovementType, quantity: number, reason: string): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) {
      showNotification('Error: Producto no encontrado', 'error');
      return false;
    }

    if (quantity <= 0) {
      showNotification('La cantidad debe ser mayor a 0', 'error');
      return false;
    }

    let newStock = product.currentStock;
    if (type === MovementType.ENTRY) newStock += quantity;
    if (type === MovementType.EXIT) {
      if (product.currentStock < quantity) {
        showNotification(`Error: Stock insuficiente. Disponible: ${product.currentStock}`, 'error');
        return false;
      }
      newStock = Math.max(0, newStock - quantity);
    }
    if (type === MovementType.ADJUSTMENT) newStock = quantity;

    setProducts(prev => prev.map(p => p.id === productId ? { ...p, currentStock: newStock, lastUpdated: new Date().toISOString() } : p));

    const movement: StockMovement = {
      id: crypto.randomUUID(),
      productId,
      productName: product.name,
      type,
      quantity,
      date: new Date().toISOString(),
      reason
    };

    setMovements(prev => [movement, ...prev]);
    showNotification(`Movimiento registrado: ${type === MovementType.ENTRY ? '+' : type === MovementType.EXIT ? '-' : '='}${quantity} ${product.name}`, 'success');
    return true;
  };

  const getLowStockProducts = () => products.filter(p => p.currentStock <= p.minStock);

  const exportData = () => {
    const backupData = {
      products,
      movements,
      profileImage,
      timestamp: new Date().toISOString(),
      version: 'v4'
    };
    return JSON.stringify(backupData);
  };

  const importData = (jsonData: string) => {
    try {
      const data = JSON.parse(jsonData);
      let success = false;

      if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
        success = true;
      }
      if (data.movements && Array.isArray(data.movements)) {
        setMovements(data.movements);
        success = true;
      }
      
      // Restaurar Imagen de Perfil
      if (data.profileImage) {
        setProfileImage(data.profileImage);
        localStorage.setItem('outlet_profile_image', data.profileImage);
      }

      if (success) {
        showNotification('Base de datos restaurada exitosamente', 'success');
      } else {
        showNotification('El archivo no contiene datos válidos', 'error');
      }
      return success;
    } catch (e) {
      console.error("Error importing data", e);
      showNotification('Error al importar archivo', 'error');
      return false;
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      movements,
      notifications,
      showFinancials,
      profileImage,
      toggleFinancials,
      addProduct,
      updateProduct,
      deleteProduct,
      registerMovement,
      getLowStockProducts,
      exportData,
      importData,
      removeNotification,
      updateProfileImage
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) throw new Error("useInventory must be used within an InventoryProvider");
  return context;
};