import type { ZodType } from 'zod';

import { z } from 'zod';

import type { ShowBannerOptions } from '@/types/modules/banner';

// Define show banner options.
export interface ZodShowBannerOptions extends Omit<ShowBannerOptions, 'figletOptions' | 'options'> {
	figletOptions?: {
		font?: string;
		horizontalLayout?: figlet.Options['horizontalLayout'];
		verticalLayout?: figlet.Options['verticalLayout'];
		whitespaceBreak?: boolean;
	};
	options?: {
		color?: string;
		separator?: string;
		separatorColor?: string;
		footerMessages?: { text: string; color?: string }[];
		footerSeparator?: string;
		bottomSpacing?: number;
	};
}

const ShowBannerOptionsSchema: ZodType<ZodShowBannerOptions> = z.object({
	bannerText: z.string(),
	figletOptions: z
		.object({
			font: z.string().optional(),
			horizontalLayout: z.enum(['default', 'full', 'fitted', 'controlled smushing', 'universal smushing']).optional(),
			verticalLayout: z.enum(['default', 'full', 'fitted', 'controlled smushing', 'universal smushing']).optional(),
			whitespaceBreak: z.boolean().optional(),
		})
		.optional(),
	options: z
		.object({
			color: z.string().optional(),
			separator: z.string().optional(),
			separatorColor: z.string().optional(),
			footerMessages: z.array(z.object({ text: z.string(), color: z.string().optional() })).optional(),
			footerSeparator: z.string().optional(),
			bottomSpacing: z.number().optional(),
		})
		.optional(),
});

export default ShowBannerOptionsSchema;
