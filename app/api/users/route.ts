import { NextResponse } from "next/server"
import { getAuthenticatedUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createUserJwt, hashUserPassword } from "@/lib/user-security"

const userFields = {
  id: true,
  kodeUser: true,
  fullname: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
  token: true,
} as const

function getRolePrefix(role: string): string {
  return role === "admin" ? "ADM" : "STF"
}

function formatAutoNumber(prefix: string, lastCode?: string | null, length = 7): string {
  if (!lastCode) {
    return `${prefix}-${String(1).padStart(length, "0")}`
  }

  const parts = lastCode.split("-")
  const lastNumber = parseInt(parts[1] || "0", 10)
  const nextNumber = lastNumber + 1

  return `${prefix}-${String(nextNumber).padStart(length, "0")}`
}

function isDuplicateEmail(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002"
}

export async function GET(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  const searchParams = new URL(request.url).searchParams

  // Jika request membawa ?nextCodeRole=..., kirim preview kode otomatis untuk form
  const nextCodeRole = searchParams.get("nextCodeRole")
  if (nextCodeRole) {
    try {
      const prefix = getRolePrefix(nextCodeRole)
      const lastUser = await prisma.user.findFirst({
        where: { kodeUser: { startsWith: `${prefix}-` } },
        orderBy: { kodeUser: "desc" },
        select: { kodeUser: true },
      })
      const nextCode = formatAutoNumber(prefix, lastUser?.kodeUser)
      return NextResponse.json({ nextCode })
    } catch (error) {
      console.error("Failed to generate next code:", error)
      return NextResponse.json({ error: "Gagal mengambil kode user." }, { status: 500 })
    }
  }

  const requestedPage = Number.parseInt(searchParams.get("page") ?? "1", 10)
  const requestedPageSize = Number.parseInt(searchParams.get("pageSize") ?? "10", 10)
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(100, Math.max(1, requestedPageSize))
    : 10

  try {
    const totalUsers = await prisma.user.count()
    const totalPages = Math.max(1, Math.ceil(totalUsers / pageSize))
    const page = Number.isFinite(requestedPage) && requestedPage > 0
      ? Math.min(requestedPage, totalPages)
      : 1
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: userFields,
    })
    return NextResponse.json({
      users: users.map(({ token, ...user }) => ({ ...user, hasToken: Boolean(token) })),
      pagination: { page, pageSize, totalUsers, totalPages },
    })
  } catch (error) {
    console.error("Failed to fetch users:", error)
    return NextResponse.json({ error: "Gagal memuat data user." }, { status: 500 })
  }
}

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Silakan login untuk melanjutkan." }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Format request tidak valid." }, { status: 400 })
  }

  const fullname = typeof body.fullname === "string" ? body.fullname.trim() : ""
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const role = typeof body.role === "string" ? body.role : "staff"

  if (!fullname || fullname.length > 191 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 191) {
    return NextResponse.json({ error: "Nama atau email tidak valid." }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password minimal 8 karakter." }, { status: 400 })
  }
  if (role !== "admin" && role !== "staff") {
    return NextResponse.json({ error: "Role tidak valid." }, { status: 400 })
  }
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: "JWT_SECRET belum diatur." }, { status: 500 })
  }

  try {
    const passwordHash = await hashUserPassword(password)
    const user = await prisma.$transaction(async (transaction) => {
      const prefix = getRolePrefix(role)
      const lastUser = await transaction.user.findFirst({
        where: { kodeUser: { startsWith: `${prefix}-` } },
        orderBy: { kodeUser: "desc" },
        select: { kodeUser: true },
      })
      const kodeUser = formatAutoNumber(prefix, lastUser?.kodeUser)

      const created = await transaction.user.create({
        data: { kodeUser, fullname, email, password: passwordHash, role },
      })
      const token = createUserJwt(created)
      return transaction.user.update({
        where: { id: created.id },
        data: { token },
        select: userFields,
      })
    })

    const { token, ...safeUser } = user

    return NextResponse.json({ user: { ...safeUser, hasToken: Boolean(token) } }, { status: 201 })
  } catch (error) {
    if (isDuplicateEmail(error)) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 })
    }
    console.error("Failed to create user:", error)
    return NextResponse.json({ error: "Gagal membuat user. Periksa koneksi database." }, { status: 500 })
  }
}