/**
 * FINTERRA Color Palette
 * Design System Colors for consistent theming
 */

const Colors = {
  // ==================== PRIMARY COLORS ====================
  primary: '#6DE1D2',           // Turquoise Mint - Main brand color
  primaryDark: '#3FC9B8',       // Dark Teal - Hover states, accents
  primaryLight: '#A8EDE4',      // Light Turquoise - Subtle backgrounds

  // ==================== NEUTRAL COLORS ====================
  background: '#F9FAFB',        // Soft Gray - Main app background
  surface: '#FFFFFF',           // Pure White - Cards, containers
  
  // Text Colors
  textPrimary: '#1A1A1A',       // Rich Black - Headings, important text
  textSecondary: '#2D2D2D',     // Charcoal - Body text
  textTertiary: '#666666',      // Medium Gray - Captions, labels
  textPlaceholder: '#999999',   // Light Gray - Input placeholders
  
  // UI Elements
  border: '#D1D5DB',            // Light Gray - Borders, dividers
  disabled: '#E6E9EF',          // Disabled state background
  overlay: 'rgba(0, 0, 0, 0.4)', // Modal overlay

  // ==================== SEMANTIC COLORS ====================
  success: '#00C896',           // Emerald Green - Success, within budget
  warning: '#FFB84D',           // Warm Orange - Warning, approaching limit
  danger: '#FF6B6B',            // Soft Red - Error, over budget
  info: '#4D9FFF',              // Sky Blue - Informational messages

  // ==================== CATEGORY COLORS ====================
  // For expense categories
  categoryFood: '#FF6B6B',      // Red - Food & Drink
  categoryTransport: '#4D9FFF', // Blue - Transportation
  categoryShopping: '#FFB84D',  // Orange - Shopping
  categoryEntertainment: '#9B59B6', // Purple - Entertainment
  categoryHealth: '#00C896',    // Green - Health & Fitness
  categoryBills: '#666666',     // Gray - Bills & Utilities
  categoryOthers: '#6DE1D2',    // Turquoise - Others

  // ==================== GRADIENT COLORS ====================
  gradientStart: '#6DE1D2',     // Gradient start (turquoise)
  gradientEnd: '#3FC9B8',       // Gradient end (teal)

  // ==================== TRANSPARENCY VARIANTS ====================
  primaryOpacity10: 'rgba(109, 225, 210, 0.1)',
  primaryOpacity20: 'rgba(109, 225, 210, 0.2)',
  primaryOpacity30: 'rgba(109, 225, 210, 0.3)',
  
  blackOpacity10: 'rgba(0, 0, 0, 0.1)',
  blackOpacity20: 'rgba(0, 0, 0, 0.2)',
  blackOpacity50: 'rgba(0, 0, 0, 0.5)',
  
  whiteOpacity50: 'rgba(255, 255, 255, 0.5)',
  whiteOpacity80: 'rgba(255, 255, 255, 0.8)',
};

export default Colors;

// Named exports for convenience
export const {
  primary,
  primaryDark,
  primaryLight,
  background,
  surface,
  textPrimary,
  textSecondary,
  textTertiary,
  success,
  warning,
  danger,
  info,
} = Colors;