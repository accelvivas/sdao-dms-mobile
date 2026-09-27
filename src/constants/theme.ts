export const colors = {
  primary: '#0F3D5E',
  primaryDark: '#0A2C44',
  primarySoft: '#E8F0F6',
  accent: '#C9A227',
  background: '#F3F5F7',
  surface: '#FFFFFF',
  text: '#12202B',
  textMuted: '#667085',
  border: '#E4E7EC',
  success: '#027A48',
  successSoft: '#ECFDF3',
  warning: '#B54708',
  warningSoft: '#FFFAEB',
  danger: '#B42318',
  dangerSoft: '#FEF3F2',
  info: '#175CD3',
  infoSoft: '#EFF8FF',
  overlay: 'rgba(10, 44, 68, 0.55)',
  white: '#FFFFFF',
};

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 12,
  lg: 16,
  full: 999,
};

export const typography = {
  pageTitle: { fontSize: 28, lineHeight: 34, fontWeight: '800' as const },
  sectionTitle: { fontSize: 19, lineHeight: 25, fontWeight: '800' as const },
  cardTitle: { fontSize: 17, lineHeight: 23, fontWeight: '700' as const },
  body: { fontSize: 15, lineHeight: 22 },
  supporting: { fontSize: 14, lineHeight: 20 },
  label: { fontSize: 12, lineHeight: 16, fontWeight: '700' as const },
  button: { fontSize: 15, lineHeight: 20, fontWeight: '700' as const },
};

export const layout = {
  screenPadding: spacing.lg,
  cardPadding: spacing.md,
  controlHeight: 50,
};

export const shadow = {
  card: {
    shadowColor: '#0A2C44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
};
