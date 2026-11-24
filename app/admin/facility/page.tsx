"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FacilityItem {
  kode_facility: string
  nama_facility: string
  create_at: string
  update_at: string
}

export default function FacilityPage() {
  const [facilities, setFacilities] = useState<FacilityItem[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchFacilities = async (currentPage: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/facility?page=${currentPage}&limit=10`, {
        cache: "no-store",
      })
      const json = await res.json()
      setFacilities(json.data || [])
      setTotalPages(json.pagination?.totalPages || 1)
    } catch (error) {
      console.error("Gagal mengambil data facility:", error)
      setFacilities([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFacilities(page)
  }, [page])

  const handleDelete = async (kode: string) => {
    try {
      const res = await fetch(`/api/facility/${kode}`, {
        method: "DELETE",
      })
      if (res.ok) {
        fetchFacilities(page)
      }
    } catch (error) {
      console.error("Gagal menghapus facility:", error)
    }
  }

  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="p-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
        {/* Header Card */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Facility</h1>
            <p className="text-sm text-neutral-400">Kelola data fasilitas.</p>
          </div>

          <Link href="/admin/facility/form/add">
            <Button className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400">
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah facility
            </Button>
          </Link>
        </div>

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 text-neutral-300">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Kode Facility</th>
                <th className="py-3.5 px-4 font-semibold">Nama Facility</th>
                <th className="py-3.5 px-4 font-semibold">Dibuat</th>
                <th className="py-3.5 px-4 font-semibold">Diperbarui</th>
                <th className="py-3.5 px-4 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Memuat data fasilitas...
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">
                    Belum ada facility.
                  </td>
                </tr>
              ) : (
                facilities.map((item) => (
                  <tr
                    key={item.kode_facility}
                    className="text-neutral-200 transition-colors hover:bg-neutral-800/40"
                  >
                    <td className="py-3.5 px-4 font-mono text-xs text-yellow-400">
                      {item.kode_facility}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-white">
                      {item.nama_facility}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {formatTanggal(item.create_at)}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">
                      {formatTanggal(item.update_at)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(item.kode_facility)}
                        className="text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-neutral-400">
          <Button
            variant="ghost"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="text-neutral-400 hover:text-white"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="rounded-md bg-neutral-800 px-3 py-1 font-medium text-white">
            {page}
          </span>

          <Button
            variant="ghost"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="text-neutral-400 hover:text-white"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
