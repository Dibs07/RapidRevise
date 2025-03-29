import { z } from "zod";

export const CommunitySchema = z.object({
    id: z.string().nonempty(),
    name: z.string().nonempty(),
    description: z.string().nonempty(),
    createdAt: z.string().nonempty(),
    updatedAt: z.string().nonempty(),
    upvotes: z.number(),
    downvotes: z.number(),
    user: z.object({
        id: z.string().nonempty(),
        name: z.string().nonempty(),
    }),
});


export type Community = z.infer<typeof CommunitySchema>;
