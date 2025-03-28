/**
 * Configuración de temas y colores de la aplicación
 */
export const theme = {
  colors: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    primary: '#3fa9f5',  // Color de la barra de progreso
    accent: '#6b5df5',
    error: '#ff4444',
    text: '#e0e0e0',      // Color de texto
    textSecondary: 'rgba(255, 255, 255, 0.6)'
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px'
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '16px'
  },
  shadows: {
    card: '0 2px 4px rgba(0,0,0,0.2)'
  }
}

export type Theme = typeof theme