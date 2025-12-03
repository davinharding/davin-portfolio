"use client";

import GitHubCalendar from "react-github-calendar";
import { SectionHeading } from "./SectionHeading";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

// Custom theme for GitHub calendar to match design system
const customTheme = {
  dark: ["#1e293b", "#1e3a5f", "#1d4ed8", "#3b82f6", "#60a5fa"],
};

const GithubSection: React.FC = () => (
  <div className="section-spacing" id="github">
    <div className="container-narrow">
      <SectionHeading
        title="Consistent Shipping"
        subTitle="Selected highlights from my GitHub activity"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* ApparelMagic */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                ApparelMagic
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                <Link
                  href="https://github.com/apparelmagic-davin"
                  target="_blank"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  @apparelmagic-davin
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-hide">
              <GitHubCalendar
                username="apparelmagic-davin"
                theme={customTheme}
                colorScheme="dark"
                fontSize={11}
                blockSize={10}
                blockMargin={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Professional */}
        {/* <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                Professional
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                <Link
                  href="https://github.com/davinpalmtreenft"
                  target="_blank"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  @davinpalmtreenft
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-hide">
              <GitHubCalendar
                username="davinpalmtreenft"
                theme={customTheme}
                colorScheme="dark"
                fontSize={11}
                blockSize={10}
                blockMargin={3}
              />
            </div>
          </CardContent>
        </Card> */}

        {/* Personal */}
        {/* <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm uppercase tracking-widest text-muted-foreground font-medium">
                Personal
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="h-auto p-0">
                <Link
                  href="https://github.com/davinharding"
                  target="_blank"
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  @davinharding
                  <ExternalLink className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-hide">
              <GitHubCalendar
                username="davinharding"
                theme={customTheme}
                colorScheme="dark"
                fontSize={11}
                blockSize={10}
                blockMargin={3}
              />
            </div>
          </CardContent>
        </Card> */}
      </div>
    </div>
  </div>
);

export { GithubSection };
