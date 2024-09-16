const PF_THEME_DARK_CLASS = 'pf-v5-theme-dark';
const PF_THEME_DARK_CLASS_LEGACY = 'pf-theme-dark'; // legacy class name needed to support PF4

// The @openshift-console/dynamic-plugin-sdk package does not expose the theme,
// therefore check if the root <html> element has the PatternFly css class set for the dark theme.
export function getConsoleThemeName(): 'light' | 'dark' {
  const classList = document.documentElement.classList;
  if (classList.contains(PF_THEME_DARK_CLASS) || classList.contains(PF_THEME_DARK_CLASS_LEGACY)) {
    return 'dark';
  }
  return 'light';
}
