import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const kode_facility = decodeURIComponent(id);

    const facility = await prisma.tbl_facility.findUnique({
      where: { kode_facility },
      include: {
        tbl_type_unit_facility: {
          select: { id_unit_type: true },
        },
      },
    });

    if (!facility) {
      return NextResponse.json(
        { message: "Data facility tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        kode_facility: facility.kode_facility,
        nama_facility: facility.nama_facility,
        create_at: facility.create_at,
        update_at: facility.update_at,
        unit_ids: facility.tbl_type_unit_facility.map((r) =>
          Number(r.id_unit_type)
        ),
      },
    });
  } catch (error) {
    console.error("GET /api/facility/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil detail facility",
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
    const kode_facility = decodeURIComponent(id);
    const body = await request.json();

    const nama_facility = String(body.nama_facility || "").trim();
    const hasUnitIds = Array.isArray(body.unit_ids);
    const unitIds: number[] = hasUnitIds
      ? Array.from(
          new Set(
            body.unit_ids
              .map((u: unknown) => Number(u))
              .filter((u: number) => !isNaN(u))
          )
        )
      : [];

    if (!nama_facility) {
      return NextResponse.json(
        { message: "Nama facility wajib diisi" },
        { status: 400 }
      );
    }

    const existing = await prisma.tbl_facility.findUnique({
      where: { kode_facility },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Data facility tidak ditemukan" },
        { status: 404 }
      );
    }

    const updated = await prisma.$transaction(async (tx) => {
      const fac = await tx.tbl_facility.update({
        where: { kode_facility },
        data: {
          nama_facility,
          update_at: new Date(),
        },
      });

      if (hasUnitIds) {
        await tx.tbl_type_unit_facility.deleteMany({
          where: { kode_facility },
        });

        if (unitIds.length > 0) {
          await tx.tbl_type_unit_facility.createMany({
            data: unitIds.map((id_unit_type) => ({
              id_unit_type,
              kode_facility,
            })),
          });
        }
      }

      return fac;
    });

    return NextResponse.json({
      message: "Facility berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("PUT /api/facility/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal memperbarui facility",
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
    const kode_facility = decodeURIComponent(id);

    const existing = await prisma.tbl_facility.findUnique({
      where: { kode_facility },
    });

    if (!existing) {
      return NextResponse.json(
        { message: "Data facility tidak ditemukan" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.tbl_type_unit_facility.deleteMany({
        where: { kode_facility },
      });

      await tx.tbl_facility.delete({
        where: { kode_facility },
      });
    });

    return NextResponse.json({
      message: "Facility berhasil dihapus",
    });
  } catch (error) {
    console.error("DELETE /api/facility/[id] error:", error);
    return NextResponse.json(
      {
        message: "Gagal menghapus facility",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}  