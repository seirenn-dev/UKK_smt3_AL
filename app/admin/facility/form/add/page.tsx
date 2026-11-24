"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Loader2, Save } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface FacilityDB {
  kode_facility: string
  nama_facility: string
  create_at: string
  update_at: string
}

const DEFAULT_FACILITY_OPTIONS = [
  { nama: "Wi-Fi High Speed", kategori: "Konektivitas" },
  { nama: "AC (Air Conditioner)", kategori: "Kenyamanan" },
  { nama: "Proyektor & Screen", kategori: "Presentasi" },
  { nama: "Smart TV", kategori: "Multimedia" },
  { nama: "Whiteboard & Spidol", kategori: "Perlengkapan" },
  { nama: "Sound System & Mic", kategori: "Audio" },
  { nama: "CCTV 24 Jam", kategori: "Keamanan" },
  { nama: "Area Parkir Luas", kategori: "Umum" },
  { nama: "Mushola", kategori: "Umum" },
  { nama: "Pantry / Dispenser", kategori: "Konsumsi" },
]

export default function AddFacilityCheckboxPage() {
  const router = useRouter()
  const [savedFacilities, setSavedFacilities] = useState<FacilityDB[]>([])
  const [customOptions, setCustomOptions] = useState<{ nama: string; kategori: string }[]>([])
  const [newFacilityName, setNewFacilityName] = useState("")
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [processingName, setProcessingName] = useState<string | null>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  const fetchSavedFacilities = async () => {
    try {
      const res = await fetch("/api/facility?limit=100", { cache: "no-store" })
      const json = await res.json()
      const list: FacilityDB[] = json.data || []
      setSavedFacilities(list)

      const defaultNames = new Set(
        DEFAULT_FACILITY_OPTIONS.map((item) => item.nama.toLowerCase())
      )
      const extraFromDb = list
        .filter((f) => !defaultNames.has(f.nama_facility.toLowerCase()))
        .map((f) => ({ nama: f.nama_facility, kategori: "Custom" }))

      setCustomOptions(extraFromDb)
    } catch (err) {
      console.error("Gagal memuat tbl_facility:", err)
    } finally {
      setLoadingInitial(false)
    }
  }

  useEffect(() => {
    fetchSavedFacilities()
  }, [])

  const findInDb = (nama: string) =>
    savedFacilities.find(
      (item) => item.nama_facility.toLowerCase() === nama.toLowerCase()
    )

  const handleToggleCheckbox = async (namaFacility: string, checked: boolean) => {
    setProcessingName(namaFacility)
    try {
      if (checked) {
        const res = await fetch("/api/facility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama_facility: namaFacility }),
        })
        if (res.ok) {
          const json = await res.json()
          setSavedFacilities((prev) => [...prev, json.data])
        }
      } else {
        const existing = findInDb(namaFacility)
        if (existing) {
          const res = await fetch(`/api/facility/${existing.kode_facility}`, {
            method: "DELETE",
          })
          if (res.ok) {
            setSavedFacilities((prev) =>
              prev.filter((item) => item.kode_facility !== existing.kode_facility)
            )
          }
        }
      }
    } catch (err) {
      console.error("Gagal sinkronisasi checkbox ke tbl_facility:", err)
    } finally {
      setProcessingName(null)
    }
  }

  const handleAddCustomOption = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newFacilityName.trim()
    if (!trimmed) return

    const existsInList = [...DEFAULT_FACILITY_OPTIONS, ...customOptions].some(
      (item) => item.nama.toLowerCase() === trimmed.toLowerCase()
    )

    if (!existsInList) {
      setCustomOptions((prev) => [...prev, { nama: trimmed, kategori: "Custom" }])
    }

    setNewFacilityName("")
    if (!findInDb(trimmed)) {
      await handleToggleCheckbox(trimmed, true)
    }
  }

  // Klik Simpan -> pastikan input yang belum masuk ikut tersimpan, lalu langsung pindah ke /admin/facility
  const handleSimpan = async () => {
    setIsRedirecting(true)
    try {
      const trimmed = newFacilityName.trim()
      if (trimmed && !findInDb(trimmed)) {
        await handleToggleCheckbox(trimmed, true)
      }
      router.push("/admin/facility")
      router.refresh()
    } finally {
      setIsRedirecting(false)
    }
  }

  const allOptions = [...DEFAULT_FACILITY_OPTIONS, ...customOptions]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pilih & Tambah Facility</h1>
          <p className="text-sm text-neutral-400">
            Centang fasilitas yang diinginkan lalu klik <strong className="text-white">Simpan</strong> untuk menampilkan di daftar facility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/facility">
            <Button
              variant="outline"
              className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </Link>

          <Button
            onClick={handleSimpan}
            disabled={isRedirecting || processingName !== null}
            className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
          >
            {isRedirecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan
          </Button>
        </div>
      </div>

      {/* Form tambah opsi custom */}
      <form
        onSubmit={handleAddCustomOption}
        className="flex gap-3 rounded-xl border border-neutral-800 bg-neutral-900/70 p-4"
      >
        <Input
          placeholder="Tambah nama fasilitas lain (contoh: Kolam Renang, Lift)..."
          value={newFacilityName}
          onChange={(e) => setNewFacilityName(e.target.value)}
          className="border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500"
        />
        <Button
          type="submit"
          variant="secondary"
          className="bg-neutral-800 text-white hover:bg-neutral-700"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah & Centang
        </Button>
      </form>

      {/* Tabel Checkbox */}
      <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-neutral-800 bg-neutral-950/60 text-neutral-300">
            <tr>
              <th className="w-12 px-4 py-3.5">Pilih</th>
              <th className="px-4 py-3.5">Kode Facility</th>
              <th className="px-4 py-3.5">Nama Facility</th>
              <th className="px-4 py-3.5">Kategori</th>
              <th className="px-4 py-3.5 text-right">Status DB</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800/80">
            {loadingInitial ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-400">
                  Memuat data dari tbl_facility...
                </td>
              </tr>
            ) : (
              allOptions.map((item) => {
                const dbRecord = findInDb(item.nama)
                const isChecked = Boolean(dbRecord)
                const isLoading = processingName === item.nama

                return (
                  <tr
                    key={item.nama}
                    onClick={() => {
                      if (!isLoading) {
                        handleToggleCheckbox(item.nama, !isChecked)
                      }
                    }}
                    className={`cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-neutral-800/70 text-white"
                        : "text-neutral-300 hover:bg-neutral-800/40"
                    }`}
                  >
                    <td
                      className="px-4 py-3.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
                      ) : (
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(val) =>
                            handleToggleCheckbox(item.nama, Boolean(val))
                          }
                          className="border-neutral-600 data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                        />
                      )}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-yellow-400">
                      {dbRecord ? dbRecord.kode_facility : "-"}
                    </td>
                    <td className="px-4 py-3.5 font-medium">{item.nama}</td>
                    <td className="px-4 py-3.5 text-neutral-400">{item.kategori}</td>
                    <td className="px-4 py-3.5 text-right">
                      {isChecked ? (
                        <span className="rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
                          Tersimpan di tbl_facility
                        </span>
                      ) : (
                        <span className="text-xs text-neutral-500">Belum dipilih</span>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Tombol Simpan di bagian bawah */}
      <div className="flex justify-end">
        <Button
          onClick={handleSimpan}
          disabled={isRedirecting || processingName !== null}
          className="bg-yellow-500 px-6 font-semibold text-black hover:bg-yellow-400"
        >
          {isRedirecting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan & Tampilkan
        </Button>
      </div>
    </div>
  )
}