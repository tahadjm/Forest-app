/**
 * Adventure Park Design System
 * This file defines the core design tokens used throughout the application
 */

export const theme = {
  // Color palette
  colors: {
    // Primary colors
    primary: {
      50: "#fff8e6",
      100: "#ffefc4",
      200: "#ffe49d",
      300: "#ffd976",
      400: "#ffcf4f",
      500: "#ffc529", // Primary brand color
      600: "#e6a800",
      700: "#cc9500",
      800: "#b38200",
      900: "#996e00",
    },
    // Secondary colors - forest greens
    secondary: {
      50: "#e6f5e6",
      100: "#c4e8c4",
      200: "#9dd89d",
      300: "#76c976",
      400: "#4fb94f",
      500: "#29a329", // Secondary brand color
      600: "#008a00",
      700: "#007000",
      800: "#005700",
      900: "#003d00",
    },
    // Accent colors - adventure blue
    accent: {
      50: "#e6f1ff",
      100: "#c4dfff",
      200: "#9dcdff",
      300: "#76baff",
      400: "#4fa8ff",
      500: "#2996ff", // Accent brand color
      600: "#0077e6",
      700: "#0062cc",
      800: "#004db3",
      900: "#003899",
    },
    // Neutral colors
    neutral: {
      50: "#f9f9f9",
      100: "#f0f0f0",
      200: "#e4e4e4",
      300: "#d1d1d1",
      400: "#b4b4b4",
      500: "#919191",
      600: "#6d6d6d",
      700: "#484848",
      800: "#2c2c2c",
      900: "#1a1a1a",
    },
    // Semantic colors
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },

  // Typography
  typography: {
    fontFamily: {
      sans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: "Montserrat, Inter, system-ui, sans-serif",
    },
    fontSize: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      "2xl": "1.5rem",
      "3xl": "1.875rem",
      "4xl": "2.25rem",
      "5xl": "3rem",
      "6xl": "3.75rem",
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // Spacing
  spacing: {
    px: "1px",
    0: "0",
    0.5: "0.125rem",
    1: "0.25rem",
    1.5: "0.375rem",
    2: "0.5rem",
    2.5: "0.625rem",
    3: "0.75rem",
    3.5: "0.875rem",
    4: "1rem",
    5: "1.25rem",
    6: "1.5rem",
    7: "1.75rem",
    8: "2rem",
    9: "2.25rem",
    10: "2.5rem",
    11: "2.75rem",
    12: "3rem",
    14: "3.5rem",
    16: "4rem",
    20: "5rem",
    24: "6rem",
    28: "7rem",
    32: "8rem",
    36: "9rem",
    40: "10rem",
    44: "11rem",
    48: "12rem",
    52: "13rem",
    56: "14rem",
    60: "15rem",
    64: "16rem",
    72: "18rem",
    80: "20rem",
    96: "24rem",
  },

  // Breakpoints
  breakpoints: {
    xs: "480px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },

  // Border radius
  borderRadius: {
    none: "0",
    sm: "0.125rem",
    DEFAULT: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px",
  },

  // Shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
    none: "none",
  },

  // Z-index
  zIndex: {
    0: "0",
    10: "10",
    20: "20",
    30: "30",
    40: "40",
    50: "50",
    auto: "auto",
  },

  // Transitions
  transitions: {
    DEFAULT: "150ms cubic-bezier(0.4, 0, 0.2, 1)",
    fast: "100ms cubic-bezier(0.4, 0, 0.2, 1)",
    slow: "300ms cubic-bezier(0.4, 0, 0.2, 1)",
  },
}

// Component-specific design tokens
export const componentTokens = {
  // Button variants
  button: {
    // Base styles for all buttons
    base: {
      fontWeight: theme.typography.fontWeight.medium,
      borderRadius: theme.borderRadius.md,
      transition: theme.transitions.DEFAULT,
    },
    // Size variants
    sizes: {
      sm: {
        fontSize: theme.typography.fontSize.sm,
        padding: `${theme.spacing[1.5]} ${theme.spacing[3]}`,
        height: theme.spacing[8],
      },
      md: {
        fontSize: theme.typography.fontSize.base,
        padding: `${theme.spacing[2]} ${theme.spacing[4]}`,
        height: theme.spacing[10],
      },
      lg: {
        fontSize: theme.typography.fontSize.lg,
        padding: `${theme.spacing[2.5]} ${theme.spacing[5]}`,
        height: theme.spacing[12],
      },
    },
    // Style variants
    variants: {
      primary: {
        backgroundColor: theme.colors.primary[500],
        color: theme.colors.neutral[900],
        hoverBg: theme.colors.primary[600],
        activeBg: theme.colors.primary[700],
        focusRing: theme.colors.primary[300],
      },
      secondary: {
        backgroundColor: theme.colors.secondary[500],
        color: "white",
        hoverBg: theme.colors.secondary[600],
        activeBg: theme.colors.secondary[700],
        focusRing: theme.colors.secondary[300],
      },
      accent: {
        backgroundColor: theme.colors.accent[500],
        color: "white",
        hoverBg: theme.colors.accent[600],
        activeBg: theme.colors.accent[700],
        focusRing: theme.colors.accent[300],
      },
      outline: {
        backgroundColor: "transparent",
        color: theme.colors.neutral[800],
        border: `1px solid ${theme.colors.neutral[300]}`,
        hoverBg: theme.colors.neutral[100],
        activeBg: theme.colors.neutral[200],
        focusRing: theme.colors.neutral[300],
      },
      ghost: {
        backgroundColor: "transparent",
        color: theme.colors.neutral[800],
        hoverBg: theme.colors.neutral[100],
        activeBg: theme.colors.neutral[200],
        focusRing: theme.colors.neutral[300],
      },
      danger: {
        backgroundColor: theme.colors.error,
        color: "white",
        hoverBg: "#dc2626", // Darker red
        activeBg: "#b91c1c", // Even darker red
        focusRing: "#fca5a5", // Light red
      },
    },
  },

  // Card styles
  card: {
    base: {
      backgroundColor: "white",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.md,
      border: `1px solid ${theme.colors.neutral[200]}`,
    },
    variants: {
      elevated: {
        boxShadow: theme.shadows.lg,
      },
      outlined: {
        boxShadow: "none",
        border: `1px solid ${theme.colors.neutral[300]}`,
      },
      filled: {
        backgroundColor: theme.colors.neutral[100],
        boxShadow: "none",
        border: "none",
      },
    },
  },

  // Form elements
  form: {
    input: {
      base: {
        backgroundColor: "white",
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.neutral[300]}`,
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        fontSize: theme.typography.fontSize.base,
        lineHeight: "1.5",
        transition: theme.transitions.DEFAULT,
      },
      focus: {
        borderColor: theme.colors.primary[500],
        boxShadow: `0 0 0 2px ${theme.colors.primary[200]}`,
      },
      error: {
        borderColor: theme.colors.error,
        boxShadow: `0 0 0 2px ${theme.colors.error}20`,
      },
      disabled: {
        backgroundColor: theme.colors.neutral[100],
        color: theme.colors.neutral[500],
        cursor: "not-allowed",
      },
    },
    label: {
      base: {
        fontSize: theme.typography.fontSize.sm,
        fontWeight: theme.typography.fontWeight.medium,
        color: theme.colors.neutral[700],
        marginBottom: theme.spacing[1.5],
      },
    },
    select: {
      base: {
        backgroundColor: "white",
        borderRadius: theme.borderRadius.md,
        border: `1px solid ${theme.colors.neutral[300]}`,
        padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
        paddingRight: theme.spacing[8], // Space for the dropdown icon
        fontSize: theme.typography.fontSize.base,
        lineHeight: "1.5",
        transition: theme.transitions.DEFAULT,
      },
    },
    checkbox: {
      base: {
        borderRadius: theme.borderRadius.sm,
        border: `1px solid ${theme.colors.neutral[300]}`,
        width: theme.spacing[4],
        height: theme.spacing[4],
        transition: theme.transitions.DEFAULT,
      },
      checked: {
        backgroundColor: theme.colors.primary[500],
        borderColor: theme.colors.primary[500],
      },
    },
  },

  // Navigation
  navigation: {
    sidebar: {
      base: {
        backgroundColor: "white",
        borderRight: `1px solid ${theme.colors.neutral[200]}`,
        width: "240px",
        transition: theme.transitions.DEFAULT,
      },
      item: {
        base: {
          padding: `${theme.spacing[2]} ${theme.spacing[3]}`,
          borderRadius: theme.borderRadius.md,
          color: theme.colors.neutral[700],
          fontSize: theme.typography.fontSize.sm,
          fontWeight: theme.typography.fontWeight.medium,
          transition: theme.transitions.DEFAULT,
        },
        active: {
          backgroundColor: theme.colors.primary[100],
          color: theme.colors.primary[700],
        },
        hover: {
          backgroundColor: theme.colors.neutral[100],
        },
      },
    },
    topbar: {
      base: {
        backgroundColor: "white",
        borderBottom: `1px solid ${theme.colors.neutral[200]}`,
        height: "64px",
        padding: `0 ${theme.spacing[4]}`,
      },
    },
  },

  // Tables
  table: {
    base: {
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0",
    },
    header: {
      backgroundColor: theme.colors.neutral[50],
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.neutral[700],
      textAlign: "left",
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    cell: {
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
      fontSize: theme.typography.fontSize.sm,
    },
    row: {
      hover: {
        backgroundColor: theme.colors.neutral[50],
      },
    },
  },

  // Alerts and notifications
  alert: {
    base: {
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing[3]} ${theme.spacing[4]}`,
      display: "flex",
      alignItems: "flex-start",
      gap: theme.spacing[3],
    },
    variants: {
      info: {
        backgroundColor: `${theme.colors.info}10`,
        borderLeft: `4px solid ${theme.colors.info}`,
      },
      success: {
        backgroundColor: `${theme.colors.success}10`,
        borderLeft: `4px solid ${theme.colors.success}`,
      },
      warning: {
        backgroundColor: `${theme.colors.warning}10`,
        borderLeft: `4px solid ${theme.colors.warning}`,
      },
      error: {
        backgroundColor: `${theme.colors.error}10`,
        borderLeft: `4px solid ${theme.colors.error}`,
      },
    },
  },

  // Modal
  modal: {
    overlay: {
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
    },
    content: {
      backgroundColor: "white",
      borderRadius: theme.borderRadius.lg,
      boxShadow: theme.shadows.xl,
      maxWidth: "500px",
      width: "100%",
      margin: "0 auto",
    },
    header: {
      padding: `${theme.spacing[4]} ${theme.spacing[4]} ${theme.spacing[2]}`,
      borderBottom: `1px solid ${theme.colors.neutral[200]}`,
    },
    body: {
      padding: theme.spacing[4],
    },
    footer: {
      padding: `${theme.spacing[2]} ${theme.spacing[4]} ${theme.spacing[4]}`,
      borderTop: `1px solid ${theme.colors.neutral[200]}`,
      display: "flex",
      justifyContent: "flex-end",
      gap: theme.spacing[2],
    },
  },
}

export default theme
