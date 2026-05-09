import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, prefs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, image: true },
    }),
    prisma.userPreferences.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  return NextResponse.json({
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? "",
    preferences: prefs
      ? {
          focusTime: prefs.focusTime ?? "",
          workStyle: prefs.workStyle ?? "",
          workHours: {
            start: prefs.workHoursStart ?? "",
            end: prefs.workHoursEnd ?? "",
          },
          focusDuration: prefs.focusDuration ?? "",
          taskType: prefs.taskType ?? "",
        }
      : null,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const ops: Promise<unknown>[] = [];

  if (body.name !== undefined) {
    ops.push(
      prisma.user.update({
        where: { id: session.user.id },
        data: { name: body.name },
      }),
    );
  }

  if (body.preferences !== undefined) {
    const p = body.preferences;
    ops.push(
      prisma.userPreferences.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          focusTime: p.focusTime,
          workStyle: p.workStyle,
          workHoursStart: p.workHours?.start,
          workHoursEnd: p.workHours?.end,
          focusDuration: p.focusDuration,
          taskType: p.taskType,
        },
        update: {
          focusTime: p.focusTime,
          workStyle: p.workStyle,
          workHoursStart: p.workHours?.start,
          workHoursEnd: p.workHours?.end,
          focusDuration: p.focusDuration,
          taskType: p.taskType,
        },
      }),
    );
  }

  await Promise.all(ops);
  return NextResponse.json({ success: true });
}
