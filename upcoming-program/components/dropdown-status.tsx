import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

import { ProgramStatus } from "@prisma/client";
import { cn, mapEnum } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { updateUpcomingProgramStatus } from "@/upcoming-program/action";

interface Props {
  status: ProgramStatus;
  programId: string;
}

export function getStatusBgColor(status: ProgramStatus): string {
  switch (status) {
    case "CANCELED":
      return "bg-rose-400/50 hover:bg-rose-400/75 active:bg-rose-400";
    case "DONE":
      return "bg-fuchsia-400/50 hover:bg-fuchsia-400/75 active:bg-fuchsia-400";
    case "UPCOMING":
      return "bg-emerald-400/50 hover:bg-emerald-400/75 active:bg-emerald-400";
  }
}

export const DropdownStatus = ({ status, programId }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          className={cn(
            "!size-full grow justify-center p-0 py-4 text-black",
            getStatusBgColor(status),
          )}
        >
          {status}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={"space-y-2"}>
        <DropdownMenuLabel>Roles</DropdownMenuLabel>
        {mapEnum(ProgramStatus, (key, value) => (
          <DropdownMenuItem
            key={key}
            className={getStatusBgColor(key)}
            onClick={() => {
              updateUpcomingProgramStatus(programId, key).then((response) => {
                if (response.error) {
                  toast({
                    title: "Error",
                    description: response.error,
                    variant: "destructive",
                  });
                } else if (response.success) {
                  toast({
                    title:
                      "Congratulations!!! Success updating upcoming program status",
                    description: response.success,
                  });
                }
              });
            }}
          >
            {value}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
