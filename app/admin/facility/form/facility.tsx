"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SavedFacility {
  kode_facility: string;
  nama_facility: string;
}

interface UnitOption {
  id_unit_type: number;
  nama_type_unit: string;
}

const DEFAULT_FACILITY_OPTIONS = [
  "Wi-Fi High Speed",
  "AC (Air Conditioner)",
  "Proyektor & Screen",
  "Smart TV",
  "Whiteboard & Spidol",
  "Sound System & Mic",
  "CCTV 24 Jam",
  "Area Parkir Luas",
  "Mushola",
  "Pantry / Dispenser",
  "Hair dryer",
  "Handuk",
  "Air Mineral",
];

interface FacilityFormProps {
  kodeFacility?: string;
}

export function Facility({ kodeFacility }: FacilityFormProps) {
  const params = useParams<{ id?: string }>();
  const router = useRouter();

  const rawId = kodeFacility || params?.id || "";
  const id = rawId ? decodeURIComponent(rawId) : "";
  const isEdit = Boolean(id);

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [hasDeletedAny, setHasDeletedAny] = useState(false);
  const [error, setError] = useState("");

  // State mode Tambah (Checkbox)
  const [savedFacilities, setSavedFacilities] = useState<SavedFacility[]>([]);
  const [options, setOptions] = useState<string[]>(DEFAULT_FACILITY_OPTIONS);
  const [checkedNames, setCheckedNames] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState("");

  // State Relasi Tipe Unit (tbl_type_unit_facility)
  const [unitList, setUnitList] = useState<UnitOption[]>([]);
  const [initialUnitIds, setInitialUnitIds] = useState<number[]>([]);
  const [selectedUnitIds, setSelectedUnitIds] = useState<number[]>([]);

  // State mode Edit
  const [namaFacilityEdit, setNamaFacilityEdit] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingInitial(true);
        setError("");

        // 1. Ambil semua daftar Type Unit untuk pilihan relasi
        const unitRes = await fetch("/api/unit?limit=100", {
          cache: "no-store",
        });
        if (unitRes.ok) {
          const unitJson = await unitRes.json();
          const normalizedUnits: UnitOption[] = Array.isArray(unitJson.data)
            ? unitJson.data.map(
                (u: { id_unit_type: number | string; nama_type_unit: string }) => ({
                  id_unit_type: Number(u.id_unit_type),
                  nama_type_unit: u.nama_type_unit,
                })
              )
            : [];
          setUnitList(normalizedUnits);
        }

        // 2. Muat data detail (mode Edit) atau daftar master facility (mode Tambah)
        if (isEdit && id) {
          const detailRes = await fetch(
            `/api/facility/${encodeURIComponent(id)}`,
            { cache: "no-store" }
          );
          const detailJson = await detailRes.json();

          if (!detailRes.ok) {
            setError(
              detailJson.detail ||
                detailJson.message ||
                "Data facility tidak ditemukan"
            );
            return;
          }

          const item = detailJson.data ?? detailJson;
          const existingRelIds: number[] = Array.isArray(item.unit_ids)
            ? item.unit_ids.map((u: number | string) => Number(u))
            : [];

          setNamaFacilityEdit(item.nama_facility || "");
          setInitialUnitIds(existingRelIds);
          setSelectedUnitIds(existingRelIds);
        } else {
          const facRes = await fetch("/api/facility?limit=100", {
            cache: "no-store",
          });
          const facJson = await facRes.json();

          if (!facRes.ok) {
            setError(
              facJson.detail ||
                facJson.message ||
                "Gagal memuat daftar facility dari database"
            );
            return;
          }

          const existing: SavedFacility[] = Array.isArray(facJson.data)
            ? facJson.data
            : [];
          setSavedFacilities(existing);

          const merged = Array.from(
            new Set([
              ...DEFAULT_FACILITY_OPTIONS,
              ...existing.map((f) => f.nama_facility),
            ])
          );
          setOptions(merged);
        }
      } catch (err) {
        console.error("Gagal memuat form facility:", err);
        setError("Gagal terhubung ke server");
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [id, isEdit]);

  const findSavedInDb = (nama: string) =>
    savedFacilities.find(
      (f) => f.nama_facility.toLowerCase() === nama.toLowerCase()
    );

  const toggleFacilityOption = async (nama: string) => {
    const savedRecord = findSavedInDb(nama);

    if (savedRecord) {
      if (deletingCode === savedRecord.kode_facility) return;
      setDeletingCode(savedRecord.kode_facility);
      setError("");

      try {
        const res = await fetch(
          `/api/facility/${encodeURIComponent(savedRecord.kode_facility)}`,
          { method: "DELETE" }
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || data.message || "Gagal menghapus facility");
          return;
        }

        setSavedFacilities((prev) =>
          prev.filter(
            (item) => item.kode_facility !== savedRecord.kode_facility
          )
        );
        setHasDeletedAny(true);
        router.refresh();
      } catch {
        setError("Terjadi kesalahan koneksi saat menghapus facility");
      } finally {
        setDeletingCode(null);
      }
      return;
    }

    setCheckedNames((prev) =>
      prev.some((item) => item.toLowerCase() === nama.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== nama.toLowerCase())
        : [...prev, nama]
    );
  };

  const toggleUnitRelation = (idUnit: number) => {
    const numericId = Number(idUnit);
    setSelectedUnitIds((prev) =>
      prev.includes(numericId)
        ? prev.filter((item) => item !== numericId)
        : [...prev, numericId]
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
        const res = await fetch(`/api/facility/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama_facility: namaFacilityEdit,
            unit_ids: selectedUnitIds,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || data.message || "Gagal memperbarui facility");
          return;
        }
      } else {
        const finalFacilities = [...checkedNames];
        const pendingCustom = customInput.trim();
        if (
          pendingCustom &&
          !findSavedInDb(pendingCustom) &&
          !finalFacilities.some(
            (n) => n.toLowerCase() === pendingCustom.toLowerCase()
          )
        ) {
          finalFacilities.push(pendingCustom);
        }

        if (finalFacilities.length === 0) {
          if (hasDeletedAny) {
            router.push("/admin/facility");
            router.refresh();
            return;
          }
          setError("Centang minimal satu fasilitas sebelum klik Simpan.");
          setSubmitting(false);
          return;
        }

        const res = await fetch("/api/facility", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            facilities: finalFacilities,
            unit_ids: selectedUnitIds,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || data.message || "Gagal menyimpan facility");
          return;
        }
      }

      router.push("/admin/facility");
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
            {isEdit ? "Edit Facility" : "Tambah Facility"}
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            {isEdit
              ? `Ubah nama fasilitas dan relasi tipe unit untuk ${id}.`
              : "Centang fasilitas baru untuk disimpan, atau hilangkan centang pada fasilitas tersimpan untuk langsung menghapusnya."}
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
                  <Label htmlFor="kode_facility" className="text-neutral-300">
                    Kode Facility
                  </Label>
                  <Input
                    id="kode_facility"
                    value={id}
                    disabled
                    className="border-neutral-800 bg-neutral-950/60 font-mono text-yellow-400"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nama_facility" className="text-neutral-300">
                    Nama Facility
                  </Label>
                  <Input
                    id="nama_facility"
                    value={namaFacilityEdit}
                    onChange={(e) => setNamaFacilityEdit(e.target.value)}
                    maxLength={100}
                    required
                    className="border-neutral-700 bg-neutral-950 text-white"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Input tambah opsi fasilitas baru ke daftar checkbox */}
                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-white">
                    Tambah Nama Facility Baru (Opsional)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ketik nama fasilitas baru lalu klik + Tambah ke Daftar..."
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

                {/* Daftar Checkbox Pilihan Fasilitas */}
                <div className="space-y-3">
                  <Label className="block text-sm font-semibold text-white">
                    Pilih Fasilitas untuk Disimpan ({checkedNames.length}{" "}
                    baru dipilih):
                  </Label>

                  <div className="space-y-2.5">
                    {options.map((nama) => {
                      const savedRecord = findSavedInDb(nama);
                      const isAlreadySaved = Boolean(savedRecord);
                      const isDeleting =
                        savedRecord?.kode_facility === deletingCode;
                      const isChecked =
                        isAlreadySaved ||
                        checkedNames.some(
                          (item) => item.toLowerCase() === nama.toLowerCase()
                        );

                      return (
                        <div
                          key={nama}
                          onClick={() => {
                            if (!isDeleting) toggleFacilityOption(nama);
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
                                  toggleFacilityOption(nama)
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="border-neutral-600 data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                              />
                            )}
                            <span className="font-mono text-xs text-neutral-400">
                              [
                              {savedRecord
                                ? savedRecord.kode_facility
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

            {/* Checkbox Relasi ke Tipe Unit (tbl_type_unit_facility) */}
            <div className="space-y-3 border-t border-neutral-800 pt-5">
              <div className="flex items-center justify-between">
                <Label className="block text-sm font-semibold text-white">
                  Relasikan ke Tipe Kamar / Unit ({selectedUnitIds.length}{" "}
                  unit dipilih):
                </Label>
                {isEdit && (
                  <span className="text-xs text-neutral-400">
                    Centang / hilangkan centang untuk mengubah relasi
                  </span>
                )}
              </div>

              {unitList.length === 0 ? (
                <p className="rounded-lg border border-neutral-800 bg-neutral-950/60 px-4 py-3 text-xs text-neutral-400">
                  Belum ada data Type Unit tersedia. Tambahkan terlebih dahulu di
                  menu Unit.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {unitList.map((unit) => {
                    const isChecked = selectedUnitIds.includes(
                      unit.id_unit_type
                    );
                    const wasInitiallyConnected =
                      isEdit && initialUnitIds.includes(unit.id_unit_type);

                    return (
                      <div
                        key={unit.id_unit_type}
                        onClick={() => toggleUnitRelation(unit.id_unit_type)}
                        className={`flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 transition-colors ${
                          isChecked
                            ? "border-yellow-500/60 bg-neutral-800/80 text-white"
                            : "border-neutral-800 bg-neutral-950/60 text-neutral-300 hover:bg-neutral-800/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={() =>
                              toggleUnitRelation(unit.id_unit_type)
                            }
                            onClick={(e) => e.stopPropagation()}
                            className="border-neutral-600 data-[state=checked]:border-yellow-500 data-[state=checked]:bg-yellow-500 data-[state=checked]:text-black"
                          />
                          <span className="font-mono text-xs text-neutral-400">
                            [UNIT-{String(unit.id_unit_type).padStart(4, "0")}]
                          </span>
                          <span className="text-sm font-medium text-white">
                            {unit.nama_type_unit}
                          </span>
                        </div>

                        {isEdit && (
                          <>
                            {isChecked && wasInitiallyConnected ? (
                              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                                Terhubung
                              </span>
                            ) : isChecked && !wasInitiallyConnected ? (
                              <span className="rounded-full bg-yellow-500/15 px-2.5 py-0.5 text-xs font-medium text-yellow-400">
                                Akan dihubungkan
                              </span>
                            ) : !isChecked && wasInitiallyConnected ? (
                              <span className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs font-medium text-red-400">
                                Akan dilepas
                              </span>
                            ) : null}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Tombol Simpan & Batal */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={submitting || deletingCode !== null}
                className="bg-yellow-500 font-semibold text-black hover:bg-yellow-400"
              >
                {submitting
                  ? "Menyimpan..."
                  : isEdit
                  ? "Update Facility"
                  : "Simpan Facility"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
                className="border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <Link href="/admin/facility">Batal</Link>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Facility;