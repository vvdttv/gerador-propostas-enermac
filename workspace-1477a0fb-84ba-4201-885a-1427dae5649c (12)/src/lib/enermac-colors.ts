// Cores da marca Enermac
// Azul, Laranja e Branco

export const CORES = {
  // Cores principais
  AZUL_PRINCIPAL: '#1976D2',
  AZUL_ESCURO: '#1565C0',
  AZUL_CLARO: '#42A5F5',
  AZUL_BACKGROUND: '#E3F2FD',
  
  LARANJA_PRINCIPAL: '#FF6D00',
  LARANJA_ESCURO: '#E65100',
  LARANJA_CLARO: '#FF9800',
  LARANJA_BACKGROUND: '#FFF3E0',
  
  // Neutros
  BRANCO: '#FFFFFF',
  CINZA_TEXTO: '#424242',
  CINZA_CLARO: '#F5F5F5',
  CINZA_BORDA: '#E0E0E0',
} as const;

// Classes Tailwind correspondentes
export const TAILWIND_COLORS = {
  azul: {
    bg: 'bg-blue-50',
    bgDark: 'bg-blue-100',
    border: 'border-blue-200',
    text: 'text-blue-700',
    textDark: 'text-blue-800',
    accent: 'text-blue-600',
  },
  laranja: {
    bg: 'bg-orange-50',
    bgDark: 'bg-orange-100',
    border: 'border-orange-200',
    text: 'text-orange-700',
    textDark: 'text-orange-800',
    accent: 'text-orange-600',
  },
} as const;
