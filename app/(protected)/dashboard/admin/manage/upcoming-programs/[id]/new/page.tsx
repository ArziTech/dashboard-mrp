import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import UpcomingProgramForm
  from "@/upcoming-program/components/form";
import { notFound } from "next/navigation";
import { getProgramByIdAction } from "@/actions/programActions";
import { createNewUpcomingProgram } from "@/upcoming-program/action";

const Page = async (
  { params, } :
    { params: Promise<{ id: string }> }
) => {
  const { id } = await params

  if(!id)
    return notFound()

  // fetch program here
  const response = await getProgramByIdAction(id);
  const {data:program} = response

  if(!program)
    return null

  const createResponse = await createNewUpcomingProgram({
     image: program.image,
    status: "UPCOMING",
    title: program.title,
  }, id)

  if(createResponse.status !== "SUCCESS" || !createResponse.data) {
    return null
  }

  return (
    <div className={"size-full pt-12"}>
      <Card>
        <CardHeader>
          <h2 className={"text-xl  font-medium"}>New Upcoming Program</h2>
        </CardHeader>
        <CardContent>
          <UpcomingProgramForm upcomingProgram={createResponse.data}  />
        </CardContent>
      </Card>
    </div>
  );
};
export default Page;
