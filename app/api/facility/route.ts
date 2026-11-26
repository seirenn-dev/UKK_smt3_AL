import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.max(1, Number(searchParams.get("limit") || "10"));
    const skip = (page - 1) * limit;

    const [total, facilities] = await Promise.all([
      prisma.tbl_facility.count(),
      prisma.tbl_facility.findMany({
        skip,
        take: limit,
        orderBy: { kode_facility: "asc" },
        include: {
          tbl_type_unit_facility: {
            include: {
              tbl_unit_type: {
                select: {
                  id_unit_type: true,
                  nama_type_unit: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const data = facilities.map((fac) => ({
      kode_facility: fac.kode_facility,
      nama_facility: fac.nama_facility,
      create_at: fac.create_at,
      update_at: fac.update_at,
      units: fac.tbl_type_unit_facility.map((rel) => ({
        id_unit_type: rel.id_unit_type,
        nama_type_unit: rel.tbl_unit_type.nama_type_unit,
      })),
    }));

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
    console.error("GET /api/facility error:", error);
    return NextResponse.json(
      {
        message: "Gagal mengambil data facility",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Mendukung array dari checkbox (facilities) maupun input satuan (nama_facility)
    const rawList: string[] = Array.isArray(body.facilities)
      ? body.facilities
      : body.nama_facility
      ? [String(body.nama_facility)]
      : [];

    const cleanNames = Array.from(
      new Set(rawList.map((n) => String(n).trim()).filter(Boolean))
    );

    const unitIds: number[] = Array.isArray(body.unit_ids)
      ? body.unit_ids
          .map((id: unknown) => Number(id))
          .filter((id) => !isNaN(id))
      : [];

    if (cleanNames.length === 0) {
      return NextResponse.json(
        { message: "Centang atau isi minimal satu nama facility" },
        { status: 400 }
      );
    }

    const existingFacilities = await prisma.tbl_facility.findMany({
      select: { kode_facility: true, nama_facility: true },
    });

    const existingMap = new Map(
      existingFacilities.map((f) => [
        f.nama_facility.toLowerCase(),
        f.kode_facility,
      ])
    );

    // Cari nomor urut terakhir (FAC0000001, FAC0000002, ...)
    const lastFacility = await prisma.tbl_facility.findFirst({
      orderBy: { kode_facility: "desc" },
    });

    let nextNumber = 1;
    if (lastFacility?.kode_facility) {
      const numericPart = parseInt(
        lastFacility.kode_facility.replace(/^FAC/i, ""),
        10
      );
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1;
      }
    }

    const now = new Date();
    const createdItems = [];
    const targetCodes: string[] = [];

    for (const nama of cleanNames) {
      const existingCode = existingMap.get(nama.toLowerCase());
      if (existingCode) {
        targetCodes.push(existingCode);
        continue;
      }

      const kode_facility = `FAC${String(nextNumber).padStart(7, "0")}`;
      nextNumber += 1;

      const created = await prisma.tbl_facility.create({
        data: {
          kode_facility,
          nama_facility: nama,
          create_at: now,
          update_at: now,
        },
      });

      createdItems.push(created);
      targetCodes.push(kode_facility);
    }

    // Simpan relasi ke tbl_type_unit_facility jika ada unit yang dicentang
    if (unitIds.length > 0 && targetCodes.length > 0) {
      for (const kode_facility of targetCodes) {
        for (const id_unit_type of unitIds) {
          await prisma.tbl_type_unit_facility.upsert({
            where: {
              id_unit_type_kode_facility: {
                id_unit_type,
                kode_facility,
              },
            },
            update: {},
            create: {
              id_unit_type,
              kode_facility,
            },
          });
        }
      }
    }

    return NextResponse.json(
      {
        message: "Facility berhasil disimpan",
        data: createdItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/facility error:", error);
    return NextResponse.json(
      {
        message: "Gagal menyimpan facility ke database",
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}