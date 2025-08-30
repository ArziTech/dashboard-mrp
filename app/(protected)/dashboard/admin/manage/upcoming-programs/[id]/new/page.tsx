import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import UpcomingProgramForm
  from "@/upcoming-program/components/form";
import { notFound } from "next/navigation";
import { getUpcomingProgramById } from "@/upcoming-program/action";

const Page = async (
  { params, } :
    { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  if(!id)
    return notFound()

  // fetch program here
  const response = await getUpcomingProgramById(id);
  const {data:upcomingProgram} = response

  if(!upcomingProgram)
    return null

  return (
    <div className={"size-full pt-12"}>
      <Card>
        <CardHeader>
          <h2 className={"text-xl  font-medium"}>New Upcoming Program</h2>
        </CardHeader>
        <CardContent>
          <UpcomingProgramForm type={'NEW'} upcomingProgram={upcomingProgram}  />
        </CardContent>
      </Card>
    </div>
  );
};
export default Page;
