"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SavedUnitType {
  id_unit_type: number;
  nama_type_unit: string;
}

const DEFAULT_TYPE_UNIT_OPTIONS = [
  "Studio Room",
  "1 Bedroom (1BR)",
  "2 Bedroom (2BR)",
  "3 Bedroom (3BR)",
  "Deluxe Suite",
  "Executive Suite",
  "Family Suite",
  "Penthouse",
];

interface UnitFormProps {
  idUnitType?: string;
}

export function UnitForm({ idUnitType }: UnitFormProps) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();

  const rawId = idUnitType || params?.id || "";
  const id = rawId ? decodeURIComponent(rawId) : "";
  const isEdit = Boolean(id);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [hasDeletedAny, setHasDeletedAny] = useState(false);
  const [error, setError] = useState("");

  // State mode Tambah (Checkbox)
  const [savedUnits, setSavedUnits] = useState<SavedUnitType[]>([]);
  const [options, setOptions] = useState<string[]>(DEFAULT_TYPE_UNIT_OPTIONS);
  const [checkedNames, setCheckedNames] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  // State mode Edit
  const [namaTypeUnitEdit, setNamaTypeUnitEdit] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingInitial(true);
        setError("");

        if (isEdit && id) {
          const detailRes = await fetch(
            `/api/unit/${encodeURIComponent(id)}`,
            { cache: "no-store" }
          );
          const detailJson = await detailRes.json();

          if (!detailRes.ok) {
            setError(
              detailJson.detail ||
                detailJson.message ||
                "Data type unit tidak ditemukan"
            );
            return;
          }

          const item = detailJson.data ?? detailJson;
          setNamaTypeUnitEdit(item.nama_type_unit || "");
        } else {
          const unitRes = await fetch("/api/unit?limit=100", {
            cache: "no-store",
          });
          const unitJson = await unitRes.json();

          if (!unitRes.ok) {
            setError(
              unitJson.detail ||
                unitJson.message ||
                "Gagal memuat daftar type unit dari database"
            );
            return;
          }

          const existing: SavedUnitType[] = Array.isArray(unitJson.data)
            ? unitJson.data
            : [];
          setSavedUnits(existing);

          const merged = Array.from(
            new Set([
              ...DEFAULT_TYPE_UNIT_OPTIONS,
              ...existing.map((u) => u.nama_type_unit),
            ])
          );
          setOptions(merged);
        }
      } catch (err) {
        console.error("Gagal memuat form type unit:", err);
        setError("Gagal terhubung ke server");
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const findSavedInDb = (nama: string) =>
    savedUnits.find(
      (u) => u.nama_type_unit.toLowerCase() === nama.toLowerCase()
    );

  const toggleTypeUnitOption = async (nama: string) => {
    const savedRecord = findSavedInDb(nama);

    // Jika sudah tersimpan di DB, saat di-uncheck langsung hapus dari DB & tampilan
    if (savedRecord) {
      if (deletingId === savedRecord.id_unit_type) return;
      setDeletingId(savedRecord.id_unit_type);
      setError("");

      try {
        const res = await fetch(`/api/unit/${savedRecord.id_unit_type}`, {
          method: "DELETE",
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || data.message || "Gagal menghapus type unit");
          return;
        }

        setSavedUnits((prev) =>
          prev.filter((item) => item.id_unit_type !== savedRecord.id_unit_type)
        );
        setHasDeletedAny(true);
        router.refresh();
      } catch {
        setError("Terjadi kesalahan koneksi saat menghapus type unit");
      } finally {
        setDeletingId(null);
      }
      return;
    }

    setCheckedNames((prev) =>
      prev.some((item) => item.toLowerCase() === nama.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== nama.toLowerCase())
        : [...prev, nama]
    );
  };

  const handleAddCustomOption = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;

    const alreadyInOptions = options.some(
      (opt) => opt.toLowerCase() === trimmed.toLowerCase()
    );
    if (!alreadyInOptions) {
      setOptions((prev) => [trimmed, ...prev]);
    }

    if (!findSavedInDb(trimmed)) {
      setCheckedNames((prev) =>
        prev.some((item) => item.toLowerCase() === trimmed.toLowerCase())
          ? prev
          : [...prev, trimmed]
      );
    }
    setCustomInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (isEdit) {
        const res = await fetch(`/api/unit/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_type_unit: namaTypeUnitEdit,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(
            data.detail || data.message || "Gagal memperbarui type unit"
          );
          return;
        }
      } else {
        const finalTypeUnits = [...checkedNames];
        const pendingCustom = customInput.trim();
        if (
          pendingCustom &&
          !findSavedInDb(pendingCustom) &&
          !finalTypeUnits.some(
            (n) => n.toLowerCase() === pendingCustom.toLowerCase()
          )
        ) {
          finalTypeUnits.push(pendingCustom);
        }

        if (finalTypeUnits.length === 0) {
          if (hasDeletedAny) {
            router.push("/admin/unit");
            router.refresh();
            return;
          }
          setError("Centang minimal satu type unit sebelum klik Simpan.");
          setSubmitting(false);
          return;
        }

        const res = await fetch("/api/unit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type_units: finalTypeUnits,
            branch_id: 1,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || data.message || "Gagal menyimpan type unit");
          return;
        }
      }

      router.push("/admin/unit");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan koneksi ke server");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl p-6">
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">
            {isEdit ? "Edit Type Unit" : "Tambah Type Unit"}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {isEdit
              ? `Ubah nama tipe kamar / unit untuk UNIT-${id.padStart(4, "0")}.`
              : "Centang tipe kamar baru untuk disimpan, atau hilangkan centang pada tipe tersimpan untuk langsung menghapusnya."}
          </p>
        </div>

        {loadingInitial ? (
          <p className="text-sm text-neutral-400">Memuat data...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            {isEdit ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="id_unit_type" className="text-neutral-300">
                    ID Type Unit
                  </Label>
                  <Input
                    id="id_unit_type"
                    value={`UNIT-${id.padStart(4, "0")}`}
                    disabled
                    className="border-neutral-800 bg-neutral-950/60 font-mono text-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_type_unit" className="text-neutral-300">
                    Nama Type Unit
                  </Label>
                  <Input
                    id="nama_type_unit"
                    value={namaTypeUnitEdit}
                    onChange={(e) => setNamaTypeUnitEdit(e.target.value)}
                    maxLength={100}
                    required
                    className="border-neutral-700 bg-neutral-950 text-white"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-white">
                    Tambah Nama Type Unit Baru (Opsional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ketik nama tipe kamar baru lalu klik + Tambah ke Daftar..."
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddCustomOption();
                        }
                      }}
                      className="border-neutral-700 bg-neutral-950 text-white placeholder:text-neutral-500"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddCustomOption}
                      className="shrink-0 bg-neutral-800 text-white hover:bg-neutral-700"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Tambah ke Daftar
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="block text-sm font-semibold text-white">
                    Pilih Type Unit untuk Disimpan ({checkedNames.length} baru
                    dipilih):
                  </Label>

                  <div className="space-y-2.5">
                    {options.map((nama) => {
                      const savedRecord = findSavedInDb(nama);
                      const isAlreadySaved = Boolean(savedRecord);
                      const isDeleting =
                        savedRecord?.id_unit_type === deletingId;
                      const isChecked =
                        isAlreadySaved ||
                        checkedNames.some(
                          (item) => item.toLowerCase() === nama.toLowerCase()
                        );

                      return (
                        <div
                          key={nama}
                          onClick={() => {
                            if (!isDeleting) toggleTypeUnitOption(nama);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                            isAlreadySaved
                              ? "border-emerald-500/40 bg-neutral-800/70 text-white hover:border-red-500/50 hover:bg-neutral-800"
                              : isChecked
                              ? "border-yellow-500/60 bg-neutral-800/80 text-white"
                              : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800/40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                            ) : (
                              <Checkbox
                                checked={isChecked}
                                disabled={isDeleting}
                                onCheckedChange={() =>
                                  toggleTypeUnitOption(nama)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="border-neutral-600 data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                              />
                            )}
                            <span className="font-mono text-xs text-neutral-400">
                              [
                              {savedRecord
                                ? `UNIT-${String(
                                    savedRecord.id_unit_type
                                  ).padStart(4, "0")}`
                                : "BARU"}
                              ]
                            </span>
                            <span className="text-sm font-medium text-white">
                              {nama}
                            </span>
                          </div>

                          {isDeleting ? (
                            <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                              Menghapus...
                            </span>
                          ) : isAlreadySaved ? (
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                              Tersimpan (uncheck untuk hapus)
                            </span>
                          ) : isChecked ? (
                            <span className="rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                              Akan disimpan
                            </span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting || deletingId !== null}
                className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
              >
                {submitting
                  ? "Menyimpan..."
                  : isEdit
                  ? "Update Type Unit"
                  : "Simpan Type Unit"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <Link href="/admin/unit">Batal</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default UnitForm;