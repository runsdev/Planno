import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const task = await prisma.task.create({
    data: {
      userId: session.user.id,
      title: body.title,
      deadline: body.deadline
        ? new Date(body.deadline.replace(" ", "T"))
        : null,
      deadlineColor: body.deadlineColor ?? null,
      duration: body.duration,
      category: body.category,
      priority: body.priority,
      completed: false,
      rescheduleCount: 0,
    },
  });

  return NextResponse.json(task, { status: 201 });
}
