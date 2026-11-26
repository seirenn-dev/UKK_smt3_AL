"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface UnitTypeItem {
  id_unit_type: number;
  nama_type_unit: string;
  branch_id: number;
  create_at: string;
  update_at: string;
}

export default function UnitPage() {
  const [unitTypes, setUnitTypes] = useState<UnitTypeItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const limit = 10;

  const fetchUnitTypes = async (currentPage: number) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/unit?page=${currentPage}&limit=${limit}`,
        { cache: "no-store" }
      );
      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(
          json.detail || json.message || "Gagal memuat data type unit"
        );
        setUnitTypes([]);
        return;
      }

      setUnitTypes(json.data || []);
      setTotalPages(json.pagination?.totalPages || 1);
      setTotalItems(json.pagination?.total || 0);
    } catch (error) {
      console.error("Gagal mengambil data type unit:", error);
      setErrorMsg("Gagal terhubung ke API /api/unit");
      setUnitTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitTypes(page);
  }, [page]);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus type unit "${nama}" (#${id})?`)) return;

    try {
      const res = await fetch(`/api/unit/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (!res.ok) {
        alert(json.detail || json.message || "Gagal menghapus type unit");
        return;
      }

      if (unitTypes.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchUnitTypes(page);
      }
    } catch (error) {
      console.error("Gagal menghapus type unit:", error);
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
        {/* Header Card */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Type Unit Management
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              Kelola data tipe kamar / unit apartemen.
            </p>
          </div>

          <Button
            asChild
            className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
          >
            <Link href="/admin/unit/form/add">
              <Plus className="mr-1.5 h-4 w-4" />
              Tambah Type Unit
            </Link>
          </Button>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            <strong>Error API:</strong> {errorMsg}
          </div>
        )}

        {/* Tabel Data */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 text-neutral-300">
              <tr>
                <th className="px-4 py-3.5 font-semibold">No</th>
                <th className="px-4 py-3.5 font-semibold">ID Unit</th>
                <th className="px-4 py-3.5 font-semibold">Nama Type Unit</th>
                <th className="px-4 py-3.5 font-semibold">Dibuat</th>
                <th className="px-4 py-3.5 font-semibold">Diperbarui</th>
                <th className="px-4 py-3.5 text-right font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/80">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-neutral-400"
                  >
                    Memuat data type unit...
                  </td>
                </tr>
              ) : unitTypes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-6 text-center text-neutral-400"
                  >
                    Belum ada type unit.
                  </td>
                </tr>
              ) : (
                unitTypes.map((item, index) => (
                  <tr
                    key={item.id_unit_type}
                    className="text-neutral-200 transition-colors hover:bg-neutral-800/40"
                  >
                    <td className="px-4 py-3.5 text-neutral-400">
                      {(page - 1) * limit + index + 1}
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-yellow-400">
                      UNIT-{String(item.id_unit_type).padStart(4, "0")}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-white">
                      {item.nama_type_unit}
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
                            href={`/admin/unit/form/${item.id_unit_type}`}
                            title="Edit Type Unit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDelete(
                              item.id_unit_type,
                              item.nama_type_unit
                            )
                          }
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                          title="Hapus Type Unit"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info & Pagination */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-sm text-neutral-400">
          <div>
            Halaman {page} dari {totalPages} ({totalItems} type unit)
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