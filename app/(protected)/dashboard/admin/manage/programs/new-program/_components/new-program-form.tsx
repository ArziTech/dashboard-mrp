"use client"
import React, { useTransition } from "react";
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent, SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import ImageUpload
  from "@/components/globals/image-upload";
import { Button, buttonVariants } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import z from "zod";
import { programSchema } from "@/schemas/ProgramSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProgramType } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import { createNewProgram } from "@/actions/programActions";
import { toast } from "@/hooks/use-toast";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Tiptap from "@/components/globals/Tiptap";
import { useEditor } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Heading } from "@tiptap/extension-heading";
import { TextAlign } from "@tiptap/extension-text-align";

const NewProgramForm = () => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof programSchema>>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      title: "",
      content: "<p>Start writing the program&apos;s description here</p>",
      image: "", // TODO
      type: "DAILY",
      customUrl: "",
    }
  });

  async function onSubmit(values: z.infer<typeof programSchema>) {
    const validatedFields = programSchema.safeParse(values)
    if(!validatedFields.success) {
      return;
    }
    startTransition(async function() {
      const programtype: ProgramType = values.type as ProgramType;
      const programId = `${values.title.replaceAll(' ','_')}-${new Date().getFullYear()}-${uuidv4()}`;

      const response = await createNewProgram({
        image: values.image,
        title: values.title,
        content: editor.getHTML(),
        customeUrl: values.customUrl,
        description: editor.getText(),
        id: programId,
        type: programtype
      });

      if (response.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        });
      } else if (response.success) {
        toast({
          title: "Success",
          description: response.success
        });
      }
    });
    router.push('/dashboard/admin/manage/programs');
  }

  const editor = useEditor({
    extensions: [
      // @ts-expect-error no problem for now
      StarterKit,
      Heading.configure({
        HTMLAttributes: {
          class: "tiptap-heading "
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        defaultAlignment: 'justify'
      }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "  w-full !py-2 !px-3 min-h-[300px]" +
          " focus:outline-none  rounded-md border border-input"
      }
    },
    content: "<p>Start writing the program&apos;s description here</p>",
    injectCSS: false
  });

  if(!editor)
    return null

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4">
        <FormField
          control={form.control}
          name="image"
          render={({ }) => (
            <FormItem className=" ">
              <FormLabel className={"text-right"}>Image</FormLabel>
              <FormControl>
                <ImageUpload
                  onFileChange={(filepath)=> { form.setValue('image', filepath || '')}}
                  folder={'/programs'}
                />
              </FormControl>
              <FormDescription>It&apos;s recommended to use image with 1080 x 1080px resolution or 1:1 aspect ratio</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className={"text-right"}>Title</FormLabel>
              <FormControl>
                <Input
                  className={"w-full  "}
                  placeholder="judul program"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className={"text-right"}>Type</FormLabel>
              <Select
                {...field}
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger className={" "}>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="DAILY">Daily</SelectItem>
                  <SelectItem value="ANNUALY">Annualy</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({  }) => (
            <FormItem className="">
              <FormLabel className={"text-right"}>Content</FormLabel>
              <FormControl>
                <Tiptap editor={editor} />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customUrl"
          render={({ field }) => (
            <FormItem className="">
              <FormLabel className={"text-right"}>Custom Url</FormLabel>
              <FormControl>
                <Input
                  placeholder="url"
                  {...field}
                  className={"w-full  "} />
              </FormControl>
              <FormDescription className={" "}>
                Leave it empty if using default url
              </FormDescription>
            </FormItem>
          )}
        />

        {isPending  ? (
          <div className={cn(buttonVariants({variant: 'default'}), 'bg-primary/50 hover:bg-primary/50 active:bg-primary/40')}>
            <span>Loading </span>
            <LoaderCircle className={"animate-spin"}></LoaderCircle>
          </div>
        ) : (
          <>
            <Button type="submit">Save changes</Button>
          </>
        )}
      </form>
    </Form>
  );
};
export default NewProgramForm;
