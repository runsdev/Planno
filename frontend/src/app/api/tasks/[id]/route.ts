import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Verify ownership
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await prisma.task.update({
    where: { id },
    data: {
      ...(body.completed !== undefined && { completed: body.completed }),
      ...(body.actualSeconds !== undefined && {
        actualSeconds: body.actualSeconds,
      }),
      ...(body.rescheduleCount !== undefined && {
        rescheduleCount: body.rescheduleCount,
      }),
      ...(body.title !== undefined && { title: body.title }),
      ...(body.deadline !== undefined && {
        deadline: body.deadline
          ? new Date(body.deadline.replace(" ", "T"))
          : null,
      }),
      ...(body.priority !== undefined && { priority: body.priority }),
      ...(body.category !== undefined && { category: body.category }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const existing = await prisma.task.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
