"use client";

import { Separator } from "@/components/ui/separator";
import { type Tab, useAssetsPanelStore } from "@/components/editor/panels/assets/assets-panel-store";
import { TabBar } from "./tabbar";
import { Captions } from "@/subtitles/components/assets-view";
import { MediaView } from "./views/assets";
import { SettingsView } from "./views/settings";
import { SoundsView } from "@/sounds/components/assets-view";
import { StickersView } from "@/stickers/components/assets-view";
import { TextView } from "@/text/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";
import { useEffect, useState } from "react";
import { cn } from "@/utils/ui";

// ── موبائل Detect ────────────────────────────────────────────
function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth < 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);

	return isMobile;
}

export function AssetsPanel() {
	const { activeTab } = useAssetsPanelStore();
	const isMobile = useIsMobile();

	const viewMap: Record<Tab, React.ReactNode> = {
		media: <MediaView />,
		sounds: <SoundsView />,
		text: <TextView />,
		stickers: <StickersView />,
		effects: <EffectsView />,
		transitions: (
			<div className="text-muted-foreground p-4">
				Transitions view coming soon...
			</div>
		),
		captions: <Captions />,
		adjustment: (
			<div className="text-muted-foreground p-4">
				Adjustment view coming soon...
			</div>
		),
		settings: <SettingsView />,
	};

	// Desktop: side tab bar
	if (!isMobile) {
		return (
			<div className="panel bg-background flex h-full rounded-sm border overflow-hidden">
				<TabBar />
				<Separator orientation="vertical" />
				<div className="flex-1 overflow-hidden">{viewMap[activeTab]}</div>
			</div>
		);
	}

	// Mobile: top tab bar
	return (
		<div className="flex flex-col size-full bg-background overflow-hidden">
			{/* Top horizontal scrollable tabs */}
			<div className="flex-shrink-0 border-b border-border overflow-x-auto no-scrollbar">
				<div className="flex items-center gap-0.5 px-2 py-1.5">
					<MobileTabBar />
				</div>
			</div>
			<div className="flex-1 overflow-hidden">{viewMap[activeTab]}</div>
		</div>
	);
}

// ── Mobile Horizontal Scrollable Tabs ────────────────────────
function MobileTabBar() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();

	const tabs: { id: Tab; label: string; emoji: string }[] = [
		{ id: "media", label: "Media", emoji: "🖼️" },
		{ id: "sounds", label: "Sounds", emoji: "🔊" },
		{ id: "text", label: "Text", emoji: "📝" },
		{ id: "stickers", label: "Stickers", emoji: "🎯" },
		{ id: "effects", label: "Effects", emoji: "✨" },
		{ id: "transitions", label: "Trans.", emoji: "🔄" },
		{ id: "captions", label: "Captions", emoji: "💬" },
		{ id: "adjustment", label: "Adjust", emoji: "🎨" },
		{ id: "settings", label: "Settings", emoji: "⚙️" },
	];

	return (
		<>
			{tabs.map((tab) => (
				<button
					key={tab.id}
					onClick={() => setActiveTab(tab.id)}
					className={cn(
						"flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors shrink-0",
						activeTab === tab.id
							? "bg-primary text-primary-foreground"
							: "bg-transparent text-muted-foreground hover:bg-accent",
					)}
				>
					<span className="text-sm">{tab.emoji}</span>
					<span>{tab.label}</span>
				</button>
			))}
		</>
	);
}
