"use client";

import { ColumnDef } from "@tanstack/table-core";
import { ProgramExecution } from "@prisma/client";
import { DataTableColumnHeader } from "@/components/Table/TableHeaderSortable";
import { DropdownStatus } from "@/upcoming-program/components/dropdown-status";
import {
  moreActionColumn,
  numberColumn,
  selectColumn,
} from "@/components/Table/TableData";
import { getFormattedDate } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  deleteManyUpcomingProgramByID,
  showUpcomingProgram
} from "@/upcoming-program/action";
import Link from "next/link";

export const columns: ColumnDef<ProgramExecution>[] = [
  selectColumn<ProgramExecution>(),
  numberColumn<ProgramExecution>(),
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"title"} />
    ),
    cell: ({ row }) => <div>{row.original.title }</div>,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"date"} />
    ),
    cell: ({ row }) => <div>{row.original.date ? getFormattedDate(row.original.date) : "Coming Soon" }</div>,
  },
  {
    accessorKey: "showOrder",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"show order"} />
    ),
    cell: ({ row }) => <div>{row.original.showOrder ? row.original.showOrder : "not shown" }</div>,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        isSortable={false}
        title={"status"}
      />
    ),
    cell: ({ row }) => {
      const status = row.original.status;
      const userId = row.original.id;
      return (
        <DropdownStatus
          status={status}
          programId={userId}
        ></DropdownStatus>
      );
    },
  },

  moreActionColumn<ProgramExecution>({
    deleteFNAction: deleteManyUpcomingProgramByID,
    Render: (itemId, row) => {
      return (
        <>
          <DropdownMenuItem className={"p-0 px-2"} asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={row?.original.showOrder !== null}
              onClick={async ()=> await showUpcomingProgram(itemId)}
            >
                Show Program
                <Eye />
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className={"p-0 px-2"} asChild>
            <Button
              variant="ghost"
              size="sm"
              disabled={row?.original.showOrder !== null}
              asChild
            >
              <Link href={`/dashboard/admin/manage/upcoming-programs/${itemId}/edit`}>
                Edit Program
                <Eye />
              </Link>
            </Button>
          </DropdownMenuItem>
        </>
      )
    }
  }),
];
