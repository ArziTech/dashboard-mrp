"use client";
import React, { useState, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { GripVertical, LoaderCircle, X } from "lucide-react";
import { Prisma, ProgramExecution } from "@prisma/client";
import { Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProgramExecutionUpdateInput = Prisma.ProgramExecutionUpdateInput;
import {
  getFirstUpcomingProgram,
  updateManyUpcomingProgram
} from "@/upcoming-program/action";

const ShownProgram = () => {
  const [upcomingProgram, setUpcomingProgram] = useState<ProgramExecution[] | undefined>();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  const { data, isFetching, status } = useQuery({
    queryKey: ["first three program"],
    queryFn: async () => {
      const response = await getFirstUpcomingProgram();
      if (response.status === "SUCCESS" || response.data) {
        const programList = response.data;
        setUpcomingProgram(programList);
        return programList;
      }
    }
  });

  if (isFetching) {
    return <LoaderCircle className={"animate-spin mx-auto"}></LoaderCircle>;
  }

  if (status === "error" || !data || !upcomingProgram) {
    return <p>Error Fetching</p>;
  }


  return (
    <Reorder.Group
      values={upcomingProgram}
      onReorder={(e) => {
        setUpcomingProgram(e.map((up, index) => {
          return {
            ...up,
            showOrder: index + 1
          };
        }));
      }}
    >
      <div className={" space-y-4 mb-4"}>
        {upcomingProgram?.filter(item => item.showOrder !== null).map((item) => {
          return (
            <Reorder.Item
              key={item.id}
              value={item}
              dragListener={isEditing}
              style={{
                width: "33%",
                padding: "8px",
                borderRadius: "calc(var(--radius) - 2px)",
                backgroundColor: "hsl(var(--primary) / 0.25)"
              }}>
              <div className={"flex items-center"}>
                {isEditing &&
                  <GripVertical className={"me-4 inline"}></GripVertical>}
                <span className={"me-4"}>{item.showOrder}</span>
                <span>{item.title}</span>
                {isEditing &&
                  <X
                    className={"ms-auto inline"}
                    onClick={() => {
                      const deletedItemIndex = item.showOrder as number;
                      setUpcomingProgram(upcomingProgram?.map(up => {
                        if (up.id === item.id) {
                          return { ...up, showOrder: null };
                        }

                        if (up.showOrder !== null && deletedItemIndex < up.showOrder) {
                          return { ...up, showOrder: up.showOrder - 1 };
                        }

                        return up;
                      }));
                    }}
                  />
                }
              </div>
            </Reorder.Item>
          );
        })}
      </div>
      <div className="flex gap-2">
      <Button onClick={() => {
        if (isEditing) {
          // that means saving into db
          startTransition(async () => {
            if (!upcomingProgram) {
              return;
            }

            const updateInput: {
              id: string;
              data: ProgramExecutionUpdateInput
            }[] = upcomingProgram.map(up => {
              return {
                id: up.id,
                data: up
              };
            });

            await updateManyUpcomingProgram(updateInput);
          });
          setIsEditing(false);
        } else {
          setIsEditing(true);
        }
      }}>
        {isEditing ? "Save" : "Edit"}
      </Button>
      {isEditing &&
        <Button onClick={() => {
          setUpcomingProgram(data);
          setIsEditing(false);
        }}>Cancel</Button>
      }
      </div>
    </Reorder.Group>
  );
};
export default ShownProgram;
