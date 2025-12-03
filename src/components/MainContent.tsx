"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MainContent: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex items-center">
      <div className="container-narrow w-full">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center py-24 lg:py-0">
          {/* Left: Text Content */}
          <div className="order-2 lg:order-1">
            <Badge variant="secondary" className="mb-4">
              Senior Full-Stack Engineer & Web3 Founder
            </Badge>
            <h1 className="heading-hero mb-6">Hi, I&apos;m Davin.</h1>
            <p className="text-xl md:text-2xl mb-4 text-foreground/90">
              I design, build, and ship production-grade SaaS and blockchain
              products.
            </p>
            <p className="text-body mb-8">
              With over 5 years of experience building web-based software, I
              specialize in Web3 dApps, NFT platforms, smart contracts, and
              full-stack applications. Let&apos;s turn your ideas into reality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link href="/call">
                  <Calendar className="mr-2 h-4 w-4" />
                  Book a Call
                </Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link href="/#projects">
                  View Projects
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right: Profile Image */}
          <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <Image
                  src="/profile_picture.jpg"
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
    </div>
  );
};

export default MainContent;
