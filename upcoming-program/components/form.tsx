"use client";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { upcomingProgramSchema } from "@/upcoming-program/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, LoaderCircle, Trash } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "@/hooks/use-toast";
import {
  createNewUpcomingProgram,
  updateUpcomingProgramById
} from "@/upcoming-program/action";
import { ProgramExecution } from "@prisma/client";
import { ActionResponse } from "@/types";

interface Props {
  type: 'NEW' | 'EDIT';
  upcomingProgram: ProgramExecution
}

const UpcomingProgramForm = ({type, upcomingProgram}:Props) => {
  const {id, title, status, date:programDate} = upcomingProgram;
  const router = useRouter();

  const [date, setDate] = React.useState<Date | undefined>(programDate === null ? undefined: programDate);

  const [isPending, startTransition] = useTransition();
  const form = useForm<z.infer<typeof upcomingProgramSchema>>({
    resolver: zodResolver(upcomingProgramSchema),
    defaultValues: {
      title: title || "",
      status: status || "UPCOMING",
      date: date
    }
  });

  if (!id)
    return notFound();

  async function onSubmit(values: z.infer<typeof upcomingProgramSchema>) {
    const validatedFields = upcomingProgramSchema.safeParse(values);
    if (!validatedFields.success) {
      return;
    }

    startTransition(async () => {
      const {date:dateInput, status:statusInput, title:titleInput} = validatedFields.data
      let response: ActionResponse<ProgramExecution>|undefined;

      if(type === 'NEW') {
        response = await createNewUpcomingProgram({
            ...values,
            status: values.status as "DONE" | "UPCOMING" | "CANCELED",
            showOrder: null
          },
          id
        );
      } else if(type === 'EDIT') {
        response = await updateUpcomingProgramById(id, {
          ...upcomingProgram,
          date:dateInput,
          status: statusInput as "DONE" | "UPCOMING" | "CANCELED",
          title: titleInput
        });
      }

      if (response?.error) {
        toast({
          title: "Error",
          description: response.error,
          variant: "destructive"
        });
      } else if (response?.success) {
        toast({
          title: "Success",
          description: response.success
        });
      }
    });
    router.push("/dashboard/admin/manage/upcoming-programs");
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}
            className="grid gap-4 py-4">

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
        {/*Date here*/}


        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col justify-between  w-1/2 ">
                <FormLabel>Date</FormLabel>
                <div className={'flex gap-2'}>
                  <Popover >
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        {...field}
                        selected={date}
                        onSelect={(date) => {
                          setDate(date);
                          field.onChange(date);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant={'destructive'}
                    onClick={(e) => {
                      e.preventDefault()
                      setDate(undefined)
                      field.onChange(undefined)
                    }}
                  >
                    <Trash />
                  </Button>
                </div>
                <FormMessage></FormMessage>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="w-1/2">
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
                    <SelectItem value="UPCOMING">Upcoming</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="CANCELED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>

        {isPending ? (
          <div
            className={cn(buttonVariants({ variant: "default" }), "bg-primary/50 hover:bg-primary/50 active:bg-primary/40")}>
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
export default UpcomingProgramForm;