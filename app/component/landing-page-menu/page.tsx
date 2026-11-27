"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

const components: { title: string; href: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
  },
]

const triggerThemeClass =
  "bg-transparent text-foreground/90 hover:bg-accent hover:text-primary focus:bg-accent focus:text-primary data-[state=open]:bg-accent data-[state=open]:text-primary transition-all duration-300"

export default function Menulandingpage() {
  return (
    <NavigationMenu className="flex-1">
      <NavigationMenuList className="flex items-center gap-2">
        <NavigationMenuItem>
          <NavigationMenuTrigger className={triggerThemeClass}>
            test
          </NavigationMenuTrigger>
          <NavigationMenuContent className="border border-border bg-popover/95 text-popover-foreground backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <ul className="grid w-96 gap-1.5 p-3">
              <ListItem href="/docs" title="Introduction">
                Re-usable components built with Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${triggerThemeClass}`}
          >
            <Link href="https://pyrotech.biz.id/">project</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={`${navigationMenuTriggerStyle()} ${triggerThemeClass}`}
          >
            <Link href="/docs">!@#$%^&*</Link>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  )
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link
          href={href}
          className="block rounded-lg border border-transparent p-2.5 transition-all duration-200 hover:border-border hover:bg-accent/80 hover:text-accent-foreground focus:bg-accent group"
        >
          <div className="flex flex-col gap-1 text-sm">
            <div className="font-medium leading-none text-foreground transition-colors group-hover:text-primary">
              {title}
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {children}
            </div>
          </div>
        </Link>
      </NavigationMenuLink>
    </li>
  )
}