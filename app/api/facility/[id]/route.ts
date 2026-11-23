import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const facility = await prisma.tbl_facility.findUnique({
      where: { kode_facility: id },
    });

    if (!facility) {
      return NextResponse.json(
        { error: "Facility tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json(facility);
  } catch (error) {
    console.error("GET /api/facility/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail facility." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const nama_facility = body.nama_facility?.trim();

    if (!nama_facility) {
      return NextResponse.json(
        { error: "Nama facility wajib diisi." },
        { status: 400 }
      );
    }

    const updated = await prisma.tbl_facility.update({
      where: { kode_facility: id },
      data: {
        nama_facility,
        update_at: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PUT /api/facility/[id] error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui facility." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.tbl_facility.delete({
      where: { kode_facility: id },
    });

    return NextResponse.json({ message: "Facility berhasil dihapus." });
  } catch (error: unknown) {
    console.error("DELETE /api/facility/[id] error:", error);

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2003"
    ) {
      return NextResponse.json(
        {
          error:
            "Facility tidak dapat dihapus karena masih digunakan pada Unit Type.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Gagal menghapus facility." },
      { status: 500 }
    );
  }
}