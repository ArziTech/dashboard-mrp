"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { ProgramCard } from "@/components/ProgramCard";
import {
  ErrorMessage,
  ProgramListLoading,
  ProgramListWrapper,
} from "@/components/ProgramUtils";
import { getFormattedDate } from "@/lib/utils";
import { Program, ProgramExecution } from "@prisma/client";
import { getUpcomingPrograms } from "@/upcoming-program/action";

interface UpcomingProgramListProps {
  title: string;
  subtitle: string;
  numberItemShown?: number | "all";
  showMoreOption?: boolean;
}

type ProgramExecutionWithProgram = ProgramExecution & {
  program: Program;
};
const UpcomingProgramList = ({
  programs,
  title,
  subtitle,
  showMoreOption,
}: {
  programs: ProgramExecutionWithProgram[];
  title: string;
  subtitle: string;
  showMoreOption?: boolean;
}) => (
  <ProgramListWrapper title={title} subtitle={subtitle}>
    {programs.map((program) => {
      return (
        <div key={program.id} className={"flex flex-col gap-7"}>
          <div className="rounded-2xl border-2 border-white bg-gradient-to-br from-[#DCF2F2] via-[#C6EAED] to-[#46D7F6] py-2 text-center text-2xl font-semibold text-primary">
            <p>{program.date ? getFormattedDate(program.date) : "Upcoming"}</p>
          </div>
          <ProgramCard {...program.program} />
        </div>
      );
    })}
    {showMoreOption && <></>}
  </ProgramListWrapper>
);

export const UpcomingProgramRender = ({
  title,
  subtitle,
  showMoreOption,
  numberItemShown = 3,
}: UpcomingProgramListProps) => {
  const { data, status } = useQuery({
    queryKey: ["upcoming programs", numberItemShown],
    queryFn: () => getUpcomingPrograms(numberItemShown),
  });
  const programs = data?.data;

  if (status === "pending") {
    return (
      <ProgramListWrapper title={title} subtitle={subtitle}>
        <ProgramListLoading />
      </ProgramListWrapper>
    );
  }

  if (status === "error" || !programs) {
    return (
      <ErrorMessage
        title={title}
        subtitle={subtitle}
        message="Terjadi kesalahan, coba lagi nanti"
      />
    );
  }

  if (!programs || programs.length === 0) {
    return (
      <ErrorMessage
        title={title}
        subtitle={subtitle}
        message="Belum ada program yang akan datang dalam waktu dekat ini"
      />
    );
  }

  return (
    <UpcomingProgramList
      programs={programs}
      title={title}
      subtitle={subtitle}
      showMoreOption={showMoreOption}
    />
  );
};
