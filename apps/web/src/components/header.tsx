"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { SOCIAL_LINKS } from "@/site/social";
import { FaDiscord } from "react-icons/fa6";
import Image from "next/image";
import { useState } from "react";
import { cn } from "@/utils/ui";

// ── Website Navbar — base-page.tsx یہ import کرتی ہے ────────
export function Header() {
	const [menuOpen, setMenuOpen] = useState(false);

	return (
		<header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
			<div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
				{/* Logo */}
				<Link href="/" className="flex items-center gap-2">
					<Image
						src={DEFAULT_LOGO_URL}
						alt="KokoCut"
						width={28}
						height={28}
						className="invert dark:invert-0 size-6"
					/>
					<span className="font-extrabold text-[1rem] tracking-tight select-none">
						<span className="text-[hsl(200,90%,52%)]">koko</span>
						<span className="text-foreground">cut</span>
					</span>
				</Link>

				{/* Desktop Nav */}
				<nav className="hidden md:flex items-center gap-4">
					<Link
						href="/projects"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors"
					>
						Projects
					</Link>
					<Link
						href={SOCIAL_LINKS.discord}
						target="_blank"
						rel="noopener noreferrer"
						className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
					>
						<FaDiscord className="size-4" />
						Discord
					</Link>
					<ThemeToggle />
					<Button asChild size="sm">
						<Link href="/projects">Get Started</Link>
					</Button>
				</nav>

				{/* Mobile Nav */}
				<div className="flex md:hidden items-center gap-2">
					<ThemeToggle />
					<Button asChild size="sm">
						<Link href="/projects">Open App</Link>
					</Button>
				</div>
			</div>
		</header>
	);
}
