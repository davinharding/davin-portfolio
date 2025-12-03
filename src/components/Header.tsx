"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, Mail } from "lucide-react";
import { projects } from "@/data/projectData";
import { Button } from "@/components/ui/button";
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

const Header: React.FC<IHeaderProps> = () => {
  const pathName = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const navigationItems = [
    { label: "Portfolio", href: "/portfolio" },
    { label: "Book a Call", href: "/call" },
    { label: "Email", href: "mailto:davinlharding+dev@gmail.com" },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-sm border-b border-border">
      <div className="container-narrow flex justify-between items-center h-16">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image src="/logo.png" alt="logo" width={40} height={40} />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {/* Portfolio Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`text-sm ${
                  pathName?.startsWith("/portfolio")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                Portfolio
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {projects.map((project, idx) => (
                <DropdownMenuItem key={idx} asChild>
                  <Link href={`/portfolio/${encodeURI(project.name)}`}>
                    {project.name}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Book a Call */}
          <Button
            variant="ghost"
            asChild
            className={`text-sm ${
              pathName === "/call" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Link href="/call">Book a Call</Link>
          </Button>

          {/* Email */}
          <Button
            variant="ghost"
            asChild
            className="text-sm text-muted-foreground"
          >
            <Link href="mailto:davinlharding+dev@gmail.com">
              <Mail className="mr-1 h-4 w-4" />
              Email
            </Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Navigation</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              {/* Portfolio Section */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground px-2">
                  Portfolio
                </p>
                <div className="space-y-1">
                  {projects.map((project, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      asChild
                      className="w-full justify-start"
                      onClick={() => setSheetOpen(false)}
                    >
                      <Link href={`/portfolio/${encodeURI(project.name)}`}>
                        {project.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Other Links */}
              <div className="space-y-1 pt-4 border-t border-border">
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                  onClick={() => setSheetOpen(false)}
                >
                  <Link href="/call">Book a Call</Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                  onClick={() => setSheetOpen(false)}
                >
                  <Link href="mailto:davinlharding+dev@gmail.com">
                    <Mail className="mr-2 h-4 w-4" />
                    Send Email
                  </Link>
                </Button>
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
