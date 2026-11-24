import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ kode: string }> }
) {
  try {
    const { kode } = await params

    await prisma.tbl_facility.delete({
      where: { kode_facility: kode },
    })

    return NextResponse.json({ message: "Facility dihapus dari tbl_facility" })
  } catch (error) {
    console.error("DELETE /api/facility/[kode] error:", error)
    return NextResponse.json(
      { message: "Gagal menghapus facility" },
      { status: 500 }
    )
  }
}