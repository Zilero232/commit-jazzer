import type { Language } from '../../shared/constants';
import type { InterpolateInput, Translations } from './i18n.types';

import { compileTemplate } from '../../shared/template';
import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pl from './locales/pl.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';
import tr from './locales/tr.json';
import uk from './locales/uk.json';
import zh from './locales/zh.json';

const TRANSLATIONS: Record<Language, Translations> = { en, ru, es, de, fr, it, pt, pl, tr, uk, zh, ja, ko };

export const getTranslations = (language: Language): Translations => TRANSLATIONS[language];

/** Fills the `{{name}}` placeholders of a translated string. */
export const interpolate = ({ text, values }: InterpolateInput): string => compileTemplate(text)(values);
