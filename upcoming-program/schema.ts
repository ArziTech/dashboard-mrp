import z from "zod";

export const upcomingProgramSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  date: z.date().nullish(),
  status: z.string().min(1, { message: "Status is required" }),
});