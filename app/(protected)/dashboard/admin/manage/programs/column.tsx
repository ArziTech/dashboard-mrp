"use client";

import { ColumnDef } from "@tanstack/table-core";
import { Program } from "@prisma/client";
import { cn } from "@/lib/utils";
import { DataTableColumnHeader } from "@/components/Table/TableHeaderSortable";
import { deleteManyProgramsByID } from "@/actions/programActions";
import {
  moreActionColumn,
  numberColumn,
  selectColumn,
} from "@/components/Table/TableData";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarRange, Eye, SquarePen } from "lucide-react";
import React from "react";

export const columns: ColumnDef<Program>[] = [
  selectColumn<Program>(),
  numberColumn<Program>(),
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"title"} />
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        isSortable={false}
        title={"description"}
      />
    ),
    cell: ({ row }) => {
      return <div>{row.original.description}</div>;
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title={"type"} />
    ),
    cell: ({ row }) => {
      const status = row.original.type;

      let statusColor = "bg-secondary";
      if (status === "DAILY") statusColor = "bg-gray-400/50";
      else if (status === "ANNUALY") statusColor = "bg-emerald-400";

      return (
        <div
          className={cn(
            "flex items-center justify-center rounded-md bg-secondary px-2 py-4",
            statusColor,
          )}
        >
          {row.original.type}
        </div>
      );
    },
  },

  moreActionColumn<Program>({
    deleteFNAction: deleteManyProgramsByID,
    Render: (itemId) => {
      return (
        <>
          <DropdownMenuItem className={"p-0 px-2"} asChild>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/programs/${itemId}`}>
                Show Details
                <Eye />
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className={"p-0 px-2"} asChild>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/admin/manage/programs/edit-program/${itemId}`}>
                Edit
                <SquarePen />
              </Link>
            </Button>
          </DropdownMenuItem>
          <DropdownMenuItem className={"p-0 px-2"} asChild>
            <Button variant="ghost" size="sm" asChild>
              <Link
                href={`/dashboard/admin/manage/upcoming-programs/${itemId}/new`}
              >
                Create Upcoming Program
                <CalendarRange />
              </Link>
            </Button>
          </DropdownMenuItem>
        </>
      )
    }
  }),
];
