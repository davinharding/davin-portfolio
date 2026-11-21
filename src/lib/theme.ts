export type ThemePreference = "system" | "light" | "dark";
export type ResolvedTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "themePreference";

export const THEME_COLORS: Record<ResolvedTheme, string> = {
  dark: "#020617",
  light: "#ffffff",
};

export const themeBootScript = `(function(){var d=document.documentElement,p=null;try{p=localStorage.getItem('${THEME_STORAGE_KEY}');if(!p&&localStorage.getItem('theme')==='light'){p='light';localStorage.setItem('${THEME_STORAGE_KEY}',p)}localStorage.removeItem('theme')}catch(e){}var l=p==='light'||(p!=='dark'&&window.matchMedia('(prefers-color-scheme: light)').matches);d.classList.toggle('light',l);d.style.colorScheme=l?'light':'dark';try{if(sessionStorage.getItem('davinLoaderShown')==='true'){d.classList.add('loader-done')}}catch(e){}})();`;
