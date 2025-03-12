import type {LanguageValues, TranslationsJson} from '@/types/modules/language';

import { LanguageEnum   } from '@/types/modules/language';

import en from './modules/en.json';
import es from './modules/es.json';
import ru from './modules/ru.json';

export const translations: Record<LanguageValues, Partial<TranslationsJson>> = {
	[LanguageEnum.English]: en,
	[LanguageEnum.Russian]: ru,
	[LanguageEnum.Spanish]: es,
};
