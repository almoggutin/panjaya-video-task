import { z } from 'zod';

export const UploadMetadataSchema = z.object({
	title: z.string().min(1, 'assets.upload.titleRequired').max(100),
	description: z.string().max(1000).optional(),
});

export type UploadMetadataFormValues = z.infer<typeof UploadMetadataSchema>;

