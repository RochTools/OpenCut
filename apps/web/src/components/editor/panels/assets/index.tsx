"use client";

import { Separator } from "@/components/ui/separator";
import {
	TAB_KEYS,
	tabs,
	type Tab,
	useAssetsPanelStore,
} from "@/components/editor/panels/assets/assets-panel-store";
import { TabBar } from "./tabbar";
import { Captions } from "@/subtitles/components/assets-view";
import { MediaView } from "./views/assets";
import { SettingsView } from "./views/settings";
import { SoundsView } from "@/sounds/components/assets-view";
import { StickersView } from "@/stickers/components/assets-view";
import { TextView } from "@/text/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/utils/ui";

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
			<div className="text-muted-foreground p-4 text-sm">
				Transitions view coming soon...
			</div>
		),
		captions: <Captions />,
		adjustment: (
			<div className="text-muted-foreground p-4 text-sm">
				Adjustment view coming soon...
			</div>
		),
		settings: <SettingsView />,
	};

	// ── Desktop: عمودی sidebar (بالکل پہلے جیسا) ────────────
	if (!isMobile) {
		return (
			<div className="panel bg-background flex h-full rounded-sm border overflow-hidden">
				<TabBar />
				<Separator orientation="vertical" />
				<div className="flex-1 overflow-hidden">{viewMap[activeTab]}</div>
			</div>
		);
	}

	// ── Mobile: horizontal tab bar اوپر، content نیچے ────────
	return (
		<div className="flex flex-col size-full bg-background overflow-hidden">
			<MobileTabBar />
			<div className="flex-1 overflow-hidden overflow-y-auto">
				{viewMap[activeTab]}
			</div>
		</div>
	);
}

// ── موبائل horizontal tab bar ─────────────────────────────────
// وہی HugeIcons جو desktop sidebar میں ہیں — بس horizontal
function MobileTabBar() {
	const { activeTab, setActiveTab } = useAssetsPanelStore();

	return (
		<div className="shrink-0 border-b border-border overflow-x-auto scrollbar-hidden">
			<div className="flex items-center gap-1 px-2 py-1.5 w-max">
				{TAB_KEYS.map((tabKey) => {
					const tab = tabs[tabKey];
					const isActive = activeTab === tabKey;

					return (
						<button
							key={tabKey}
							onClick={() => setActiveTab(tabKey)}
							aria-label={tab.label}
							className={cn(
								"flex flex-col items-center justify-center gap-1",
								"w-14 py-2 rounded-lg shrink-0 transition-colors",
								isActive
									? "bg-secondary text-secondary-foreground"
									: "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
							)}
						>
							<tab.icon className="size-5" />
							<span className="text-[0.6rem] leading-none font-medium">
								{tab.label}
							</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
