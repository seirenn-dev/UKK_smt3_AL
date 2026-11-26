import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const id_unit_type = Number(decodeURIComponent(id));

    if (isNaN(id_unit_type)) {
      return NextResponse.json(
        { message: "ID type unit tidak valid" },
        { status: 400 }
      );
    }

    const unit = await prisma.tbl_unit_type.findUnique({
      where: { id_unit_type },
    });

    if (!unit) {
      return NextResponse.json(
        { message: "Data type unit tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: unit });
  } catch (error) {
    console.error("GET /api/unit/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil detail type unit",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const id_unit_type = Number(decodeURIComponent(id));

    if (isNaN(id_unit_type)) {
      return NextResponse.json(
        { message: "ID type unit tidak valid" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const nama_type_unit = String(
      body.nama_type_unit || body.nama_unit || ""
    ).trim();

    if (!nama_type_unit) {
      return NextResponse.json(
        { message: "Nama type unit wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.tbl_unit_type.findUnique({
      where: { id_unit_type },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Data type unit tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.tbl_unit_type.update({
      where: { id_unit_type },
      data: {
        nama_type_unit,
        ...(body.branch_id !== undefined
          ? { branch_id: Number(body.branch_id) }
          : {}),
        update_at: new Date(),
      },
    });

    return NextResponse.json({
      message: "Type unit berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/unit/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal memperbarui type unit",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const id_unit_type = Number(decodeURIComponent(id));

    if (isNaN(id_unit_type)) {
      return NextResponse.json(
        { message: "ID type unit tidak valid" },
        { status: 400 }
      );
    }

    const existing = await prisma.tbl_unit_type.findUnique({
      where: { id_unit_type },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Data type unit tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tbl_type_unit_facility.deleteMany({
        where: { id_unit_type },
      });

      await tx.tbl_unit_type.delete({
        where: { id_unit_type },
      });
    });

    return NextResponse.json({
      message: "Type unit berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/unit/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal menghapus type unit",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}