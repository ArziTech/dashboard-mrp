"use server";
import { prisma } from "@/lib/db";
import {
  Prisma,
  Program,
  ProgramExecution,
  ProgramStatus
} from "@prisma/client";
import { ActionResponse } from "@/types";
import { prismaErrorChecker } from "@/lib/prismaErrorChecker";

export async function createNewProgram(input: Prisma.ProgramCreateInput) : Promise<ActionResponse<Program>> {
  try {
    const newProgram = await prisma.program.create({ data: input });

    return {
      status: "SUCCESS",
      success: "Successfully creating new program",
      data: newProgram
    }
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

export async function getAllPrograms(): Promise<ActionResponse<Program[]>> {
  try {
    // Check if users exist or not
    const programs = await prisma.program.findMany();

    if (programs.length === 0) {
      return { status: "ERROR", error: "Programs do not exist" };
    }

    return {
      status: "SUCCESS",
      success: "Successfully fetching all programs",
      data: programs,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

export async function deleteManyProgramsByID(
  ids: string[],
): Promise<ActionResponse<never>> {
  try {
    // Check if users exist or not
    const programs = await prisma.program.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (programs.length === 0) {
      return { status: "ERROR", error: "Programs do not exist" };
    }

    // Delete programs in parallel
    const deletePromises = ids.map((id) =>
      prisma.program.delete({
        where: { id },
      }),
    );

    await Promise.all(deletePromises);

    // TODO
    // also delete the image in imagekit

    return { status: "SUCCESS", success: "Successfully deleted programs" };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}



export const getProgramGroupByType = async (
  type: "ALL" | "DAILY" | "ANNUALY" = "ALL",
  numberItem: "all" | number = 3,
): Promise<ActionResponse<Program[]>> => {
  try {
    const programs = await prisma.program.findMany({
      where: type === "ALL" ? undefined : { type },
      take: numberItem === "all" ? undefined : numberItem || 3,
    });

    return {
      status: "SUCCESS",
      success: `Success get ${type} program`,
      data: programs,
    };

    // return programs as Program[];
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
};

export const getProgramByIdAction = async (
  programId: string,
): Promise<ActionResponse<Program & { programExecution: ProgramExecution[] }>> => {
  try {
    const program = await prisma.program.findUnique({
      where: { id: programId },
      include: {
        programExecution: true // This will include all program executions
      }
    });

    if (!program) return { status: "ERROR", error: `Program with id (${programId})  not found` };

    return {
      status: "SUCCESS",
      success: "Success get program by ID",
      data: program,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
};


export async function updateProgrambyId(programId:string, input: Prisma.ProgramUpdateInput) : Promise<ActionResponse<Program>> {
  try {

    const updatedProgram = await prisma.program.update({where: {id: programId}, data: input });

    return {
      status: "SUCCESS",
      success: `Successfully updating program ${updatedProgram.title}`,
      data: updatedProgram
    }
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

