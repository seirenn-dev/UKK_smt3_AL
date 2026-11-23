"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FacilityItem {
  kode_facility: string;
  nama_facility: string;
  create_at: string;
  update_at: string;
  _count?: {
    tbl_type_unit_facility: number;
  };
}

export default function Facility() {
  const [facilities, setFacilities] = useState<FacilityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/facility", { cache: "no-store" });
      const data = await res.json();
      setFacilities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching facilities:", error);
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchFacilities();
  }, []);

  
  const handleDelete = async (kode_facility: string) => {
    if (!confirm(`Yakin ingin menghapus facility ${kode_facility}?`)) return;

    try {
      const res = await fetch(
        `/api/facility/${encodeURIComponent(kode_facility)}`,
        {
          method: "DELETE",
        }
      );
      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Gagal menghapus facility");
        return;
      }

      fetchFacilities();
    } catch (error) {
      console.error("Error deleting facility:", error);
      alert("Terjadi kesalahan saat menghapus data");
    }
  };
  

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-2xl font-bold">Data Facility</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola daftar fasilitas dari tabel tbl_facility
            </p>
          </div>

          <Button asChild>
            <Link href="/admin/facility/form/add">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Facility
            </Link>
          </Button>
        </CardHeader>

        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">No</th>
                  <th className="px-4 py-3 font-medium">Kode Facility</th>
                  <th className="px-4 py-3 font-medium">Nama Facility</th>
                  <th className="px-4 py-3 font-medium">Dipakai Unit</th>
                  <th className="px-4 py-3 font-medium">Create At</th>
                  <th className="px-4 py-3 font-medium">Update At</th>
                  <th className="px-4 py-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Memuat data...
                    </td>
                  </tr>
                ) : facilities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-muted-foreground"
                    >
                      Belum ada data facility.
                    </td>
                  </tr>
                ) : (
                  facilities.map((item, index) => {
                    const usedCount =
                      item._count?.tbl_type_unit_facility ?? 0;

                    return (
                      <tr
                        key={item.kode_facility}
                        className="border-b last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-4 py-3">{index + 1}</td>
                        <td className="px-4 py-3 font-medium">
                          {item.kode_facility}
                        </td>
                        <td className="px-4 py-3">{item.nama_facility}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                            {usedCount} Unit Type
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {new Date(item.create_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3">
                          {new Date(item.update_at).toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link
                              href={`/admin/facility/form/${encodeURIComponent(
                                item.kode_facility
                              )}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(item.kode_facility)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}