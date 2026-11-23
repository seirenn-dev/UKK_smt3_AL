"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditFacilityPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id || "");
  const router = useRouter();

  const [namaFacility, setNamaFacility] = useState("");
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadDetail = async () => {
      try {
        setFetching(true);
        const res = await fetch(`/api/facility/${encodeURIComponent(id)}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Data facility tidak ditemukan");
          return;
        }

        setNamaFacility(data.nama_facility || "");
      } catch {
        setError("Gagal memuat data facility");
      } finally {
        setFetching(false);
      }
    };

    loadDetail();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/facility/${encodeURIComponent(id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_facility: namaFacility }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Gagal memperbarui facility");
        return;
      }

      router.push("/admin/facility");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit Facility</CardTitle>
        </CardHeader>
        <CardContent>
          {fetching ? (
            <p className="text-sm text-muted-foreground">Memuat data...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="kode_facility">Kode Facility</Label>
                <Input id="kode_facility" value={id} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nama_facility">Nama Facility</Label>
                <Input
                  id="nama_facility"
                  value={namaFacility}
                  onChange={(e) => setNamaFacility(e.target.value)}
                  maxLength={100}
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Menyimpan..." : "Update"}
                </Button>
                <Button type="button" variant="outline" asChild>
                  <Link href="/admin/facility">Batal</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}