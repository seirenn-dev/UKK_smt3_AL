"use client"

import Link from "next/link"
import { UsersRound, LogOut, ChevronUp, SquareCheckBig, Cat, Lighthouse } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Image from "next/image"

export function AppSidebar() {
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/"
    }
  }

  return (
    <Sidebar className="bg-slate-[#100130] text-white border-r border-slate-800">
      <SidebarHeader className="h-16 border-b flex items-center justify-center px-4">
        <Image
          src="/img/cola.jpg"
          alt="Logo"
          width={120}
          height={40}
          className="object-contain"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-foreground hover:bg-black hover:text-white active:bg-black/80 transition-all duration-300"
              >
                <Link href="/admin/">
                  <Lighthouse className="w-4 h-4 mr-2" />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-foreground hover:bg-black hover:text-white active:bg-black/80 transition-all duration-300"
              >
                <Link href="/admin/user-management">
                  <UsersRound className="w-4 h-4 mr-2" />
                  <span>usermanagement</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>


            <SidebarMenuItem>
            <SidebarMenuButton
           asChild
             className="text-foreground hover:bg-black hover:text-white active:bg-black/80 transition-all duration-300"
          >
    <Link href="/admin/tes">
      <SquareCheckBig className="w-4 h-4 mr-2" />
      <span>tes</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>


            <SidebarMenuItem>
            <SidebarMenuButton
           asChild
             className="text-foreground hover:bg-black hover:text-white active:bg-black/80 transition-all duration-300"
          >
    <Link href="/admin/facility">
      <Cat className="w-4 h-4 mr-2" />
      <span>facility</span>
    </Link>
  </SidebarMenuButton>
</SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
     
       
      </SidebarFooter>
    </Sidebar>
  )
}