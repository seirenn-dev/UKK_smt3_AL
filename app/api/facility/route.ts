import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get("page") || "1")
    const limit = Number(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const [facilities, totalFacilities] = await Promise.all([
      prisma.tbl_facility.findMany({
        skip,
        take: limit,
        orderBy: { kode_facility: "asc" },
        include: {
          _count: {
            select: { tbl_type_unit_facility: true },
          },
        },
      }),
      prisma.tbl_facility.count(),
    ])

    return NextResponse.json({
      data: facilities,
      pagination: {
        page,
        limit,
        totalFacilities,
        totalPages: Math.ceil(totalFacilities / limit) || 1,
      },
    })
  } catch (error) {
    console.error("GET /api/facility error:", error)
    return NextResponse.json(
      { message: "Gagal mengambil data facility" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const namaFacility = String(body.nama_facility || "").trim()

    if (!namaFacility) {
      return NextResponse.json(
        { message: "Nama facility wajib diisi" },
        { status: 400 }
      )
    }

    // Cek apakah nama_facility sudah ada di tbl_facility agar tidak duplikat
    const existing = await prisma.tbl_facility.findFirst({
      where: { nama_facility: namaFacility },
    })

    if (existing) {
      return NextResponse.json({ data: existing }, { status: 200 })
    }

    // Generate kode_facility otomatis: FAC0000001 (10 karakter, aman untuk varchar(10))
    const lastFacility = await prisma.tbl_facility.findFirst({
      orderBy: { kode_facility: "desc" },
    })

    let nextNumber = 1
    if (lastFacility?.kode_facility) {
      const numericPart = parseInt(lastFacility.kode_facility.replace(/\D/g, ""), 10)
      if (!isNaN(numericPart)) {
        nextNumber = numericPart + 1
      }
    }

    const kodeFacility = `FAC${String(nextNumber).padStart(7, "0")}`

    const created = await prisma.tbl_facility.create({
      data: {
        kode_facility: kodeFacility,
        nama_facility: namaFacility,
      },
    })

    return NextResponse.json({ data: created }, { status: 201 })
  } catch (error) {
    console.error("POST /api/facility error:", error)
    return NextResponse.json(
      { message: "Gagal menambahkan facility" },
      { status: 500 }
    )
  }
}