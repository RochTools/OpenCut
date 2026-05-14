"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEditor } from "@/editor/use-editor";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { usePropertiesStore } from "./stores/properties-store";
import { getPropertiesConfig } from "./registry";
import { cn } from "@/utils/ui";
import { EmptyView } from "./empty-view";
import { useIsMobile } from "@/hooks/use-mobile";

export function PropertiesPanel() {
	const isMobile = useIsMobile();

	return isMobile ? <MobilePropertiesPanel /> : <DesktopPropertiesPanel />;
}

// ── Desktop: پرانا layout بالکل وہی ───────────────────────────
function DesktopPropertiesPanel() {
	const editor = useEditor();
	useEditor((e) => e.scenes.getActiveSceneOrNull());
	useEditor((e) => e.media.getAssets());
	const { selectedElements } = useElementSelection();
	const { activeTabPerType, setActiveTab } = usePropertiesStore();

	if (selectedElements.length === 0) {
		return (
			<div className="panel bg-background flex h-full flex-col items-center justify-center overflow-hidden rounded-sm border">
				<EmptyView />
			</div>
		);
	}

	if (selectedElements.length > 1) {
		return (
			<div className="panel bg-background flex h-full flex-col items-center justify-center overflow-hidden rounded-sm border">
				<p className="text-muted-foreground text-sm">
					{selectedElements.length} elements selected
				</p>
			</div>
		);
	}

	const mediaAssets = editor.media.getAssets();
	const elementsWithTracks = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	});
	const elementWithTrack = elementsWithTracks[0];
	if (!elementWithTrack) return null;

	const { element, track } = elementWithTrack;
	const config = getPropertiesConfig({ element, mediaAssets });
	const visibleTabs = config.tabs;

	const storedTabId = activeTabPerType[element.type];
	const isStoredTabVisible = visibleTabs.some((t) => t.id === storedTabId);
	const activeTabId = isStoredTabVisible ? storedTabId : config.defaultTab;
	const activeTab = visibleTabs.find((t) => t.id === activeTabId) ?? visibleTabs[0];

	if (!activeTab) return null;

	return (
		<div className="panel bg-background flex h-full overflow-hidden rounded-sm border">
			<TooltipProvider delayDuration={0}>
				<div className="flex shrink-0 flex-col gap-0.5 border-r p-1 scrollbar-hidden overflow-y-auto">
					{visibleTabs.map((tab) => (
						<Tooltip key={tab.id}>
							<TooltipTrigger asChild>
								<Button
									variant={tab.id === activeTab.id ? "secondary" : "ghost"}
									size="icon"
									onClick={() =>
										setActiveTab({
											elementType: element.type,
											tabId: tab.id,
										})
									}
									aria-label={tab.label}
									className={cn(
										"shrink-0 h-8 w-8",
										tab.id !== activeTab.id && "text-muted-foreground",
									)}
								>
									{tab.icon}
								</Button>
							</TooltipTrigger>
							<TooltipContent side="right">{tab.label}</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
			<ScrollArea className="flex-1 scrollbar-hidden">
				{activeTab.content({ trackId: track.id })}
			</ScrollArea>
		</div>
	);
}

// ── Mobile: CapCut/InShot style — نیچے سے panel ───────────────
function MobilePropertiesPanel() {
	const editor = useEditor();
	useEditor((e) => e.scenes.getActiveSceneOrNull());
	useEditor((e) => e.media.getAssets());
	const { selectedElements } = useElementSelection();
	const { activeTabPerType, setActiveTab } = usePropertiesStore();

	// کچھ select نہیں تو خالی
	if (selectedElements.length === 0 || selectedElements.length > 1) {
		return null;
	}

	const mediaAssets = editor.media.getAssets();
	const elementsWithTracks = editor.timeline.getElementsWithTracks({
		elements: selectedElements,
	});
	const elementWithTrack = elementsWithTracks[0];
	if (!elementWithTrack) return null;

	const { element, track } = elementWithTrack;
	const config = getPropertiesConfig({ element, mediaAssets });
	const visibleTabs = config.tabs;

	const storedTabId = activeTabPerType[element.type];
	const isStoredTabVisible = visibleTabs.some((t) => t.id === storedTabId);
	const activeTabId = isStoredTabVisible ? storedTabId : config.defaultTab;
	const activeTab = visibleTabs.find((t) => t.id === activeTabId) ?? visibleTabs[0];

	if (!activeTab) return null;

	return (
		<div className="flex flex-col h-full bg-background border-t border-border">
			{/* Drag handle */}
			<div className="flex justify-center pt-2 pb-1 shrink-0">
				<div className="w-10 h-1 rounded-full bg-border" />
			</div>

			{/* Horizontal scrollable tab pills — CapCut style */}
			<div className="shrink-0 overflow-x-auto no-scrollbar border-b border-border">
				<div className="flex items-center gap-1 px-3 py-2">
					{visibleTabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() =>
								setActiveTab({
									elementType: element.type,
									tabId: tab.id,
								})
							}
							className={cn(
								"flex items-center gap-1.5 px-3 py-1.5 rounded-full",
								"text-xs font-medium whitespace-nowrap shrink-0 transition-colors",
								tab.id === activeTab.id
									? "bg-primary text-primary-foreground"
									: "bg-accent text-muted-foreground hover:text-foreground",
							)}
						>
							<span className="[&_svg]:size-3">{tab.icon}</span>
							<span>{tab.label}</span>
						</button>
					))}
				</div>
			</div>

			{/* Content */}
			<ScrollArea className="flex-1 scrollbar-hidden">
				{activeTab.content({ trackId: track.id })}
			</ScrollArea>
		</div>
	);
}
