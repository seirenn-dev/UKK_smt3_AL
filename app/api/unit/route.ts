import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const [total, data] = await Promise.all([
      prisma.tbl_unit_type.count(),
      prisma.tbl_unit_type.findMany({
        skip,
        take: limit,
        orderBy: { id_unit_type: "asc" },
      }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("GET /api/unit error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data type unit",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const rawList: string[] = Array.isArray(body.type_units)
      ? body.type_units
      : body.nama_type_unit
      ? [String(body.nama_type_unit)]
      : body.nama_unit
      ? [String(body.nama_unit)]
      : [];

    const cleanNames = Array.from(
      new Set(rawList.map((n) => String(n).trim()).filter(Boolean))
    );

    const branch_id = Number(body.branch_id) || 1;

    if (cleanNames.length === 0) {
      return NextResponse.json(
        { message: "Centang atau isi minimal satu nama type unit" },
        { status: 400 }
      );
    }

    const existingUnits = await prisma.tbl_unit_type.findMany({
      select: { nama_type_unit: true },
    });

    const existingSet = new Set(
      existingUnits.map((u) => u.nama_type_unit.toLowerCase())
    );

    const now = new Date();
    const createdItems = [];

    for (const nama of cleanNames) {
      if (existingSet.has(nama.toLowerCase())) continue;

      const created = await prisma.tbl_unit_type.create({
        data: {
          nama_type_unit: nama,
          branch_id,
          create_at: now,
          update_at: now,
        },
      });

      createdItems.push(created);
    }

    return NextResponse.json(
      {
        message: "Type unit berhasil disimpan",
        data: createdItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/unit error:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan type unit ke database",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}