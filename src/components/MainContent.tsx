"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import WaveParticles from "@/components/WaveParticlesAlt";

const MainContent: React.FC = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center relative overflow-hidden">
      <WaveParticles />
      <div className="container-narrow w-full relative" style={{ zIndex: 1 }}>
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center py-24 lg:py-0">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
            <Badge variant="secondary" className="mb-4">
              Senior Full-Stack Engineer
            </Badge>
            <h1 className="heading-hero mb-6">Hi, I&apos;m Davin.</h1>
            <p className="text-xl md:text-2xl mb-4 text-foreground/90">
              I design, build, and ship production-grade AI and SaaS
              products.
            </p>
            <p className="text-body mb-8">
              With over 6 years of experience building web-based software, I&apos;m currently focused on building AI products that delightfully solve real business problems. Let&apos;s have a chat if that interests you. 🚀
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/call">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book a Call
                </Link>
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => scrollToSection("projects")}
              >
                View Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right: Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <Image
                  src="/new_profile_pic.png"
                  alt="Davin Harding"
                  width={320}
                  height={320}
                  className="rounded-lg w-56 h-56 lg:w-72 lg:h-72 object-cover"
                  priority
                />
                <p className="text-xs text-muted-foreground text-center mt-4 tracking-wide">
                  Available for select projects in 2025
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <button
          onClick={() => scrollToSection("projects")}
          className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
          aria-label="Scroll to projects"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default MainContent;
