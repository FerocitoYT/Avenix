import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireStaff();

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true, email: true },
        },
        items: {
          include: { product: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        clientName: o.user.name,
        clientEmail: o.user.email,
        productName: o.items[0]?.product?.name || "Desarrollo Avenix",
        totalAmountCents: o.totalAmountCents,
        status: o.status,
        assignedStaff: "Equipo Avenix",
        deliveryDate: o.deliveryDate ? o.deliveryDate.toISOString() : undefined,
        createdAt: o.createdAt.toISOString(),
      })),
    });
  } catch (err: any) {
    if (err?.message === "UNAUTHORIZED" || err?.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Acceso no autorizado" }, { status: 403 });
    }
    return NextResponse.json({ error: "Error al cargar pedidos" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await requireStaff();
    const body = await req.json();
    const { orderId, status } = body;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch {
    return NextResponse.json({ error: "Error al actualizar pedido" }, { status: 500 });
  }
}
