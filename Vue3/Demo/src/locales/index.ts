import en from './en'
import zhcn from './zh_cn'
import TUILocales from '../TUIKit/locales/index'

const demoLocales = {
  ...en,
  ...zhcn
}

const locales = {
  en: { ...demoLocales.en, ...TUILocales.en },
  zh_cn: { ...demoLocales.zh_cn, ...TUILocales.zh_cn }
}

export { locales, demoLocales }
