import z from "zod";

export const programSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  content: z.string().min(1, { message: "Content is required" }),
  image: z.string().min(1, { message: "Image is required" }),
  type: z.string().min(1, { message: "Type is required" }),
  customUrl: z.string().optional(), // Optional, can be empty or undefined
});