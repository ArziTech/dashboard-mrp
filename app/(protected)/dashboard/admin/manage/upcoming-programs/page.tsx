import React from "react";
import { DataTable } from "@/components/Table/TableData";
import { columns } from "@/app/(protected)/dashboard/admin/manage/upcoming-programs/upcoming-program-column";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ShownProgram
  from "@/app/(protected)/dashboard/admin/manage/upcoming-programs/_components/shown-program";
import {
  deleteManyUpcomingProgramByID,
  getAllUpcomingProgram
} from "@/upcoming-program/action";

const Page = async () => {
  return (
    <div className={"size-full pt-12"}>
      <Card>
        <CardHeader>
          <h2 className={"text-xl font-medium"}>Manage Upcoming Program</h2>
        </CardHeader>
        <CardContent>

          <p className={'text-lg font-medium text-center mb-4'}>Show Program</p>
          <ShownProgram />
          <hr className={'my-4'}/>
          <DataTable
            queryKey={"all Upcoming Program"}
            queryAction={getAllUpcomingProgram}
            columns={columns}
            deleteFNAction={deleteManyUpcomingProgramByID}
            filterBy={"status"}
          />
        </CardContent>
      </Card>
    </div>
  );
};
export default Page;
