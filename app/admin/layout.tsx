import * as React from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth"
import { AppSidebar } from "../component/app-sidebar"
import { LogoutMenuItem } from "./logout-menu-item"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser()

  if (!user) {
    redirect("/")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <SidebarTrigger className="-ml-1" />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/img/acheron.jpg" alt="shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-44" align="end">
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/billing" className="cursor-pointer w-full">
                    Billing
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/settings" className="cursor-pointer w-full">
                    Settings
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <LogoutMenuItem />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="flex flex-1 flex-col gap-4 p-4">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <AdminShell>{children}</AdminShell>
    </React.Suspense>
  )
}