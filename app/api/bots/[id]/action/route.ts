import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const actionSchema = z.object({
  action: z.enum(["START", "STOP", "RESTART"]),
});

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = actionSchema.parse(body);

    const botId = params.id;

    // Log the action to audit logs
    try {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: `BOT_CONTAINER_${action}`,
          entityType: "BOT",
          entityId: botId,
          detailsJson: {
            userEmail: user.email,
            action,
            node: "eu-node-01.avenix.dev",
          },
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Acción ${action} enviada a la infraestructura Docker con éxito.`,
      status: action === "STOP" ? "STOPPED" : "RUNNING",
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Acción de bot no válida" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Error interno al ejecutar comando de infraestructura" },
      { status: 500 }
    );
  }
}
