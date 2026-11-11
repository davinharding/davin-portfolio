export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

/** Only an explicit light/dark choice is stored; no key means "follow the OS". */
export const THEME_STORAGE_KEY = "themePreference";

/** Browser-chrome tint per theme (matches --background). */
export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: "#020617",
  light: "#ffffff",
};

// Runs in <head> before first paint so there is no flash of the wrong theme.
// The old `theme` key was written on every visit (always "dark" by default),
// so only a stored "light" is a real choice worth carrying over.
export const themeBootScript = `(function(){var d=document.documentElement,p=null;try{p=localStorage.getItem('${THEME_STORAGE_KEY}');if(!p&&localStorage.getItem('theme')==='light'){p='light';localStorage.setItem('${THEME_STORAGE_KEY}',p)}localStorage.removeItem('theme')}catch(e){}var l=p==='light'||(p!=='dark'&&window.matchMedia('(prefers-color-scheme: light)').matches);d.classList.toggle('light',l);d.style.colorScheme=l?'light':'dark';try{if(sessionStorage.getItem('davinLoaderShown')==='true'){d.classList.add('loader-done')}}catch(e){}})();`;
