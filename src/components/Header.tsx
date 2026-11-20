"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, ChevronDown, Mail, Briefcase, Calendar, LayoutGrid } from "lucide-react";
import { getPublishedProjects, projectPath } from "@/data/projectData";
import { Button } from "@/components/ui/button";
import { ThemeMenu, ThemeSegmented } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

type IHeaderProps = {
  page?: string;
  mobile?: boolean;
};

const navProjects = getPublishedProjects();

const Header: React.FC<IHeaderProps> = () => {
  const pathName = usePathname();
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);

  const scrollToExperience = () => {
    if (pathName === "/work") {
      const element = document.getElementById("experience");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push("/work#experience");
    }
  };

  const isPortfolio = pathName?.startsWith("/portfolio") ?? false;
  const isCall = pathName === "/call";
  const isWork = pathName === "/work";

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <nav
        aria-label="Primary"
        className="container-narrow flex justify-between items-center h-16"
      >
        <Link
          href="/"
          aria-label="Davin Harding — Home"
          aria-current={pathName === "/" ? "page" : undefined}
          className="transition-opacity hover:opacity-80"
          prefetch
        >
          {/* Both marks are rendered and the html `light` class picks one, so
              the right logo shows from first paint with no hydration swap. */}
          <span data-splash-target className="relative block h-10 w-10">
            <Image
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              priority
              unoptimized
              className="theme-logo-dark"
            />
            <Image
              src="/logo-light.svg"
              alt=""
              width={40}
              height={40}
              priority
              unoptimized
              className="theme-logo-light absolute inset-0"
            />
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            asChild
            className={`text-sm ${isWork ? "text-primary" : "text-muted-foreground"}`}
          >
            <Link href="/work" aria-current={isWork ? "page" : undefined} prefetch>
              <LayoutGrid className="mr-1 h-4 w-4" aria-hidden="true" />
              Work
            </Link>
          </Button>

          {/* Portfolio Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                aria-current={isPortfolio ? "page" : undefined}
                className={`text-sm ${
                  isPortfolio ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Portfolio
                <ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {navProjects.map((project) => (
                <DropdownMenuItem
                  key={project.name}
                  asChild
                  className="cursor-pointer"
                >
                  <Link href={projectPath(project.name)} prefetch>
                    {project.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="ghost"
            className="text-sm text-muted-foreground"
            onClick={scrollToExperience}
          >
            <Briefcase className="mr-1 h-4 w-4" aria-hidden="true" />
            Experience
          </Button>

          <Button variant="ghost" asChild className="text-sm text-muted-foreground">
            <Link
              href="/call"
              aria-current={isCall ? "page" : undefined}
            >
              <Calendar className="mr-1 h-4 w-4" aria-hidden="true" />
              Book a Call
            </Link>
          </Button>

          <Button variant="ghost" asChild className="text-sm text-muted-foreground">
            <Link href="mailto:davinlharding+dev@gmail.com">
              <Mail className="mr-1 h-4 w-4" aria-hidden="true" />
              Email
            </Link>
          </Button>

          <ThemeMenu />
        </div>

        {/* Mobile Navigation */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open navigation menu">
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              <Button
                variant="ghost"
                asChild
                className={`w-full justify-start ${isWork ? "text-primary" : ""}`}
                onClick={() => setSheetOpen(false)}
              >
                <Link href="/work" aria-current={isWork ? "page" : undefined}>
                  <LayoutGrid className="mr-2 h-4 w-4" aria-hidden="true" />
                  Work
                </Link>
              </Button>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground px-2">
                  Portfolio
                </p>
                <div className="space-y-1">
                  {navProjects.map((project) => (
                    <Button
                      key={project.name}
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href={projectPath(project.name)}>
                        {project.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSheetOpen(false);
                    scrollToExperience();
                  }}
                >
                  <Briefcase className="mr-2 h-4 w-4" aria-hidden="true" />
                  Experience
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                  onClick={() => setSheetOpen(false)}
                >
                  <Link href="/call">
                    <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                    Book a Call
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                  onClick={() => setSheetOpen(false)}
                >
                  <Link href="mailto:davinlharding+dev@gmail.com">
                    <Mail className="mr-2 h-4 w-4" aria-hidden="true" />
                    Email
                  </Link>
                </Button>
              </div>

              <div className="space-y-1 pt-4 border-t border-border">
                <p className="text-sm font-medium text-muted-foreground px-2 pb-1">
                  Theme
                </p>
                <ThemeSegmented />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
