import en from './en';
import zh_cn from './zh_cn';
import zh_tw from './zh_tw';
import TUILocales, { ILanguageResources } from '../TUIKit/locales/index';

const demoLocales: Record<string, ILanguageResources> = {
  ...en,
  ...zh_cn,
  ...zh_tw,
};

const locales: Record<string, ILanguageResources> = {};

const allLanguages = new Set([
  ...Object.keys(demoLocales),
  ...Object.keys(TUILocales),
]);

allLanguages.forEach((lang) => {
  locales[lang] = {
    ...(demoLocales[lang] || {}),
    ...(TUILocales[lang] || {}),
  };
});

export { locales, demoLocales };
