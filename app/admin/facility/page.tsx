'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import Facility from "./form/facility"

type FacilityItem = {
    kode_facility: string
    nama_facility: string
    create_at: string
    update_at: string
}

const PAGE_SIZE = 10

export default function FacilityManagementPage() {
    const router = useRouter()
    const [facilities, setFacilities] = useState<FacilityItem[]>([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalFacility, setTotalFacility] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    async function loadFacilities(page = currentPage) {
        setIsLoading(true)
        setError("")
        try {
            const response = await fetch(`/api/facility?page=${page}&pageSize=${PAGE_SIZE}`)
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal memuat facility.")
            setTotalFacility(result.facilities)
            setTotalFacility(result.pagination.totalFacilities)
            setCurrentPage(result.pagination.page)
        } catch (loadError) {
            setError(loadError instanceof Error ? loadError.message : "Gagal memuat facility.")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        let isActive = true

        async function initialLoad() {
            try {
                const response = await fetch(`/api/facility?page=1&pageSize=${PAGE_SIZE}`)
                const result = await response.json()
                if (!response.ok) throw new Error(result.error ?? "Gagal memuat facility.")
                if (isActive) {
                    setTotalFacility(result.facilities)
                    setTotalFacility(result.pagination.totalFacilities)
                    setCurrentPage(result.pagination.page)
                }
            } catch (loadError) {
                if (isActive) {
                    setError(loadError instanceof Error ? loadError.message : "Gagal memuat facility.")
                }
            } finally {
                if (isActive) setIsLoading(false)
            }
        }

        void initialLoad()
        return () => {
            isActive = false
        }
    }, [])

    function goToPage(page: number) {
        setCurrentPage(page)
        void loadFacilities(page)
    }

    async function deleteFacility(facility: FacilityItem) {
        if (!window.confirm(`Hapus facility ${facility.nama_facility}?`)) return
        setError("")
        try {
            const response = await fetch(`/api/facility/${encodeURIComponent(facility.kode_facility)}`, {
                method: "DELETE",
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error ?? "Gagal menghapus facility.")
            if (facilities.length === 1 && currentPage > 1) {
                goToPage(currentPage - 1)
            } else {
                await loadFacilities(currentPage)
            }
        } catch (deleteError) {
            setError(deleteError instanceof Error ? deleteError.message : "Gagal menghapus facility.")
        }
    }

    const totalPages = Math.max(1, Math.ceil(totalFacility / PAGE_SIZE))

    return (
        <Card className="m-6 px-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="mb-1 text-2xl font-bold">Facility</h1>
                    <p className="text-sm text-muted-foreground">Kelola data fasilitas.</p>
                </div>
                <Button onClick={() => router.push("/admin/facility/form/add")}>
                    <Plus aria-hidden="true" />
                    Tambah facility
                </Button>
            </div>

            {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}

            <div className="mt-5 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode Facility</TableHead>
                            <TableHead>Nama Facility</TableHead>
                            <TableHead>Dibuat</TableHead>
                            <TableHead>Diperbarui</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Memuat facility...</TableCell>
                            </TableRow>
                        ) : Facility.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center">Belum ada facility.</TableCell>
                            </TableRow>
                        ) : facilities.map((facility) => (
                            <TableRow key={facility.kode_facility}>
                                <TableCell className="font-mono">{facility.kode_facility}</TableCell>
                                <TableCell className="font-medium">{facility.nama_facility}</TableCell>
                                <TableCell>{new Date(facility.create_at).toLocaleDateString("id-ID")}</TableCell>
                                <TableCell>{new Date(facility.update_at).toLocaleDateString("id-ID")}</TableCell>
                                <TableCell>
                                    <div className="flex justify-end gap-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Edit ${facility.nama_facility}`}
                                            title="Edit facility"
                                            onClick={() => router.push(`/admin/facility/form/${encodeURIComponent(facility.kode_facility)}`)}
                                        >
                                            <Pencil aria-hidden="true" />
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            aria-label={`Hapus ${facility.nama_facility}`}
                                            title="Hapus facility"
                                            onClick={() => void deleteFacility(facility)}
                                        >
                                            <Trash2 aria-hidden="true" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                aria-disabled={currentPage === 1 || isLoading}
                                className={currentPage === 1 || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault()
                                    if (currentPage > 1 && !isLoading) goToPage(currentPage - 1)
                                }}
                            />
                        </PaginationItem>
                        {getPageItems(currentPage, totalPages).map((item, index) => (
                            <PaginationItem key={`${item}-${index}`}>
                                {item === "ellipsis" ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink
                                        href="#"
                                        isActive={item === currentPage}
                                        aria-label={`Go to page ${item}`}
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (!isLoading && item !== currentPage) goToPage(item)
                                        }}
                                    >
                                        {item}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                aria-disabled={currentPage === totalPages || isLoading}
                                className={currentPage === totalPages || isLoading ? "pointer-events-none opacity-50" : undefined}
                                onClick={(event) => {
                                    event.preventDefault()
                                    if (currentPage < totalPages && !isLoading) goToPage(currentPage + 1)
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </Card>
    )
}

function getPageItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
    if (totalPages <= 4) {
        return Array.from({ length: totalPages }, (_, index) => index + 1)
    }
    if (currentPage <= 2) return [1, 2, 3, "ellipsis"]
    if (currentPage >= totalPages - 1) {
        return ["ellipsis", totalPages - 2, totalPages - 1, totalPages]
    }
    return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis"]
}