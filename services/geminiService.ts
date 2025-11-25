import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateProductDescription = async (name: string, category: string): Promise<string> => {
  if (!ai) return "Servicios de IA no disponibles (Falta API Key).";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Escribe una descripción de producto corta y profesional (máximo 2 oraciones) en español para un producto llamado "${name}" de la categoría "${category}".`,
    });
    return response.text || "No se generó descripción.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Falló al generar descripción.";
  }
};

export const analyzeInventoryHealth = async (products: Product[]): Promise<string> => {
  if (!ai) return "Servicios de IA no disponibles (Falta API Key).";

  // Create a lightweight summary to send to LLM to avoid token limits with 300+ products
  const lowStock = products.filter(p => p.currentStock <= p.minStock).map(p => p.name);
  const totalValue = products.reduce((acc, p) => acc + (p.currentStock * p.purchasePrice), 0);
  
  const summary = `
    Total Productos: ${products.length}
    Valor Total: $${totalValue.toFixed(2)}
    Items con Stock Bajo (${lowStock.length}): ${lowStock.slice(0, 10).join(', ')} ${lowStock.length > 10 ? '...' : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analiza este resumen de inventario y proporciona 3 puntos clave breves y accionables en español para el gerente de almacén para optimizar los niveles de stock y la eficiencia. Enfócate en la gestión de riesgos y oportunidades de compra.
      
      Datos:
      ${summary}`,
    });
    return response.text || "Análisis no disponible.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Falló al analizar el inventario.";
  }
};