import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const data = await prisma.tbl_facility.findMany({
      orderBy: { kode_facility: "asc" },
      include: {
        _count: {
          select: { tbl_type_unit_facility: true },
        },
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/facility error:", error);
    return NextResponse.json(
      { message: "Gagal mengambil data facility" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const nama_facility = body.nama_facility?.trim();

    if (!nama_facility) {
      return NextResponse.json(
        { message: "Nama facility wajib diisi" },
        { status: 400 }
      );
    }

    // Auto-generate kode_facility: FCL001, FCL002, dst. (6 karakter, aman untuk VarChar(10))
    const lastFacility = await prisma.tbl_facility.findFirst({
      orderBy: { kode_facility: "desc" },
    });

    let nextNumber = 1;
    if (lastFacility?.kode_facility) {
      const match = lastFacility.kode_facility.match(/\d+$/);
      if (match) {
        nextNumber = parseInt(match[0], 10) + 1;
      }
    }

    const kode_facility = `FCL${String(nextNumber).padStart(3, "0")}`;

    const created = await prisma.tbl_facility.create({
      data: {
        kode_facility,
        nama_facility,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/facility error:", error);
    return NextResponse.json(
      { message: "Gagal menambahkan facility" },
      { status: 500 }
    );
  }
}