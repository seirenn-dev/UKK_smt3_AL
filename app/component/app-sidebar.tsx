"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  UsersRound,
  LogOut,
  SquareCheckBig,
  Cat,
  Lighthouse,
} from "lucide-react"
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
import Image from "next/image"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: Lighthouse },
  { label: "usermanagement", href: "/admin/user-management", icon: UsersRound },
  { label: "unit", href: "/admin/unit", icon: SquareCheckBig },
  { label: "facility", href: "/admin/facility", icon: Cat },
]

export function AppSidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } finally {
      window.location.href = "/"
    }
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <SidebarHeader className="flex h-16 items-center justify-center border-b border-sidebar-border bg-black/15 px-4">
        <Image
          src="/img/cola.jpg"
          alt="Logo"
          width={120}
          height={40}
          className="rounded object-contain"
        />
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        <SidebarGroup>
          <SidebarMenu className="space-y-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href)

              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`rounded-lg px-3 py-2.5 transition-all duration-300 ${
                      isActive
                        ? "border border-sidebar-ring/50 bg-sidebar-accent font-semibold text-sidebar-primary shadow-sm"
                        : "text-sidebar-foreground/80 hover:translate-x-1 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <Link href={item.href}>
                      <Icon
                        className={`mr-2 h-4 w-4 transition-colors ${
                          isActive
                            ? "text-sidebar-primary"
                            : "text-sidebar-foreground/65"
                        }`}
                      />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border bg-black/15 p-3">
       
      </SidebarFooter>
    </Sidebar>
  )
}