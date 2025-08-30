'use server'
import {
  Prisma,
  Program,
  ProgramExecution,
  ProgramStatus
} from "@prisma/client";
import { ActionResponse } from "@/types";
import { prisma } from "@/lib/db";
import { prismaErrorChecker } from "@/lib/prismaErrorChecker";
import { toast } from "@/hooks/use-toast";
import ProgramExecutionUpdateInput = Prisma.ProgramExecutionUpdateInput;

export async function createNewUpcomingProgram(input: Prisma.ProgramExecutionCreateWithoutProgramInput, programId: string) : Promise<ActionResponse<ProgramExecution>> {
  try {
    const newUpcomingProgram = await prisma.programExecution.create({
      data: {
        ...input,
        program: {
          connect: {
            id: programId
          }
        }
      },
      include : {
        program: true
      }
    });

    return {
      status: "SUCCESS",
      success: "Successfully creating a new upcoming program",
      data: newUpcomingProgram
    }
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

export async function getAllUpcomingProgram(): Promise<
  ActionResponse<ProgramExecution[]>
> {
  // return prisma.programExecution.findMany();
  try {
    const programExecutions: ProgramExecution[] =
      await prisma.programExecution.findMany();

    if (programExecutions.length === 0) {
      return { status: "ERROR", error: "Programs do not exist" };
    }

    return {
      status: "SUCCESS",
      success: "Successfully get all upcoming program",
      data: programExecutions,
    };
  } catch {
    // handle if error
    return { status: "ERROR", error: "Something went wrong" };
  }
}

export const getUpcomingProgramById = async (
  programId: string,
): Promise<ActionResponse<ProgramExecution>> => {
  try {
    const upcomingProgram = await prisma.programExecution.findUnique({
      where: { id: programId },
    });

    if (!upcomingProgram) return { status: "ERROR", error: `Upcoming Program with id (${programId})  not found` };

    return {
      status: "SUCCESS",
      success: "Success get upcoming program by ID",
      data: upcomingProgram,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
};

export async function getFirstUpcomingProgram(): Promise<
  ActionResponse<ProgramExecution[]>
> {
  // return prisma.programExecution.findMany();
  try {
    //  bagaimana cara query hanya ambil show order  yang tidak null saja
    const programExecutions: ProgramExecution[] = await prisma.programExecution.findMany({
      where: {
        showOrder: { not: null } // Hanya ambil yang showOrder-nya tidak null
      },
      orderBy: {
        showOrder: 'asc' // Opsional: urutkan berdasarkan showOrder
      },
      take: 3 // Batasi hasil
    });

    return {
      status: "SUCCESS",
      success: "Successfully get all upcoming program",
      data: programExecutions,
    };
  } catch {
    // handle if error
    return { status: "ERROR", error: "Something went wrong" };
  }
}

export async function deleteManyUpcomingProgramByID(
  ids: string[],
): Promise<ActionResponse<never>> {
  try {
    // Check if upcoming program exist or not
    const upcomingPrograms = await prisma.programExecution.findMany({
      where: {
        id: { in: ids },
      },
    });

    if (upcomingPrograms.length === 0) {
      return { status: "ERROR", error: "Upcoming programs do not exist" };
    }

    // Delete upcomingPrograms in parallel
    const deletePromises = ids.map((id) =>
      prisma.user.delete({
        where: { id },
      }),
    );

    await Promise.all(deletePromises);

    return { status: "SUCCESS", success: "Successfully deleted programs" };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

export async function updateUpcomingProgramById(
  id: string,
  input: ProgramExecutionUpdateInput,
): Promise<ActionResponse<ProgramExecution>> {
  try {
    const upcomingProgram = await prisma.programExecution.update({
      where: { id },
      data: input
    });

    return {
      status: "SUCCESS",
      success: "Success updating upcoming program",
      data: upcomingProgram,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

export async function updateUpcomingProgramStatus(
  id: string,
  newStatus: ProgramStatus,
): Promise<ActionResponse<ProgramExecution>> {
  try {
    // check if user exist or not
    const upcomingProgram = await prisma.programExecution.findUnique({
      where: { id },
    });

    // handle if error
    if (!upcomingProgram)
      return { status: "ERROR", error: "Upcoming program doesn't exist" };

    // update the role
    const updatedProgram = await prisma.programExecution.update({
      data: {
        ...upcomingProgram,
        status: newStatus,
      },
      where: {
        id,
      },
    });

    return {
      status: "SUCCESS",
      success: "Success updating new status",
      data: updatedProgram,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
}

type ProgramExecutionWithProgram = ProgramExecution & {
  program: Program;
};
export const getUpcomingPrograms = async (
  numberItem?: number | "all",
): Promise<ActionResponse<ProgramExecutionWithProgram[]>> => {
  const now = new Date();

  try {
    const programs = await prisma.programExecution.findMany({
      where: {
        status: "UPCOMING",
        date: {
          gt: now, // Hanya ambil program dengan tanggal lebih besar dari sekarang
        },
      },
      orderBy: {
        showOrder: "asc", // Urutkan berdasarkan tanggal terdekat
      },
      take: numberItem === "all" ? undefined : numberItem || 3, // Batasi jumlah hasil
      include: {
        program: true, // Sertakan informasi program jika diperlukan
      },
    });

    return {
      status: "SUCCESS",
      success: "Success get upcoming program",
      data: programs,
    };
  } catch (err) {
    const {error} = prismaErrorChecker(err);
    return {
      status: "ERROR", error
    }
  }
};

export async function updateManyUpcomingProgram(
  updates: { id: string; data: Prisma.ProgramExecutionUpdateInput }[]
): Promise<ActionResponse<ProgramExecution[]>> {
  try {
    const results = await prisma.$transaction(
      updates.map(update =>
        prisma.programExecution.update({
          where: { id: update.id },
          data: update.data
        })
      )
    );

    return {
      status: "SUCCESS",
      success: `Successfully updated ${results.length} upcoming program`,
      data: results
    };
  } catch (err) {
    const { error } = prismaErrorChecker(err);
    return { status: "ERROR", error };
  }
}

export async function showUpcomingProgram(itemId:string) {
  const response = await getFirstUpcomingProgram()
  if(response.status === "SUCCESS" && response.data) {
    const lastItem = response.data.at(-1);
    const lastItemOrder:number = lastItem?.showOrder ??  0;


    if(lastItemOrder >= 3) {
      toast({
        title: "Failed",
        variant: "destructive",
        description: "Maximum upcoming program"
      })
      return;
    }

    await updateManyUpcomingProgram([{id: itemId, data: {showOrder: lastItemOrder + 1 } }])
    toast({
      title: "Success",
      description: "Upcoming program has been added"
    })
  }
}