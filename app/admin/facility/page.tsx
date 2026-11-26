"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RelatedUnit {
  id_unit_type: number;
  nama_type_unit: string;
}

interface FacilityItem {
  kode_facility: string;
  nama_facility: string;
  create_at: string;
  update_at: string;
  units?: RelatedUnit[];
}

export default function FacilityPage() {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const limit = 10;

  const fetchFacilities = async (currentPage: number) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/facility?page=${currentPage}&limit=${limit}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(
          json.detail || json.message || "Gagal memuat data facility"
        );
        setFacilities([]);
        return;
      }

      setFacilities(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalItems(json.pagination?.total || 0);
    } catch (error) {
      console.error("Gagal mengambil data facility:", error);
      setErrorMsg("Gagal terhubung ke API /api/facility");
      setFacilities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities(page);
  }, [page]);

  const handleDelete = async (kode: string) => {
    if (!confirm(`Yakin ingin menghapus facility ${kode}?`)) return;

    try {
      const res = await fetch(`/api/facility/${encodeURIComponent(kode)}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.detail || json.message || "Gagal menghapus facility");
        return;
      }

      if (facilities.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchFacilities(page);
      }
    } catch (error) {
      console.error("Gagal menghapus facility:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };

  const formatTanggal = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Facility Management
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Kelola data fasilitas apartemen.
            </p>
          </div>

          <Button
            asChild
            className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
          >
            <Link href="/admin/facility/form/add">
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Facility
            </Link>
          </Button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <strong>Error API:</strong> {errorMsg}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 text-neutral-300">
              <tr>
                <th className="px-4 py-3.5 font-semibold">No</th>
                <th className="px-4 py-3.5 font-semibold">Kode Facility</th>
                <th className="px-4 py-3.5 font-semibold">Nama Facility</th>
                <th className="px-4 py-3.5 font-semibold">Relasi Unit</th>
                <th className="px-4 py-3.5 font-semibold">Dibuat</th>
                <th className="px-4 py-3.5 font-semibold">Diperbarui</th>
                <th className="px-4 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-neutral-400"
                  >
                    Memuat data fasilitas...
                  </td>
                </tr>
              ) : facilities.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="py-6 text-center text-neutral-400"
                  >
                    Belum ada facility.
                  </td>
                </tr>
              ) : (
                facilities.map((item, index) => {
                  const relatedUnits = item.units || [];

                  return (
                    <tr
                      key={item.kode_facility}
                      className="text-neutral-200 transition-colors hover:bg-neutral-800/40"
                    >
                      <td className="px-4 py-3.5 text-neutral-400">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-xs text-yellow-400">
                        {item.kode_facility}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-white">
                        {item.nama_facility}
                      </td>
                      <td className="px-4 py-3.5">
                        {relatedUnits.length === 0 ? (
                          <span className="text-xs text-neutral-500">
                            Belum terhubung unit
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {relatedUnits.map((u) => (
                              <span
                                key={u.id_unit_type}
                                className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200"
                              >
                                {u.nama_type_unit}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400">
                        {formatTanggal(item.create_at)}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400">
                        {formatTanggal(item.update_at)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                          >
                            <Link
                              href={`/admin/facility/form/${encodeURIComponent(
                                item.kode_facility
                              )}`}
                              title="Edit Facility"
                            >
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.kode_facility)}
                            className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            title="Hapus Facility"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-400">
          <div>
            Halaman {page} dari {totalPages} ({totalItems} facility)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
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
              className="text-neutral-400 hover:bg-neutral-800 hover:text-white"
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}