import { z } from 'zod';

export const taskSchema = z.object({
	name: z.string().min(2).max(50),
	description: z.string().min(2).max(3000),
	dueDate: z.coerce.date(),
	time: z.coerce.number().min(0),
	tags: z.array(z.string())
});

export type TaskSchema = typeof taskSchema;
