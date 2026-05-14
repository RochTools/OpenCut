"use client";

import { useParams } from "next/navigation";
import {
	ResizablePanelGroup,
	ResizablePanel,
	ResizableHandle,
} from "@/components/ui/resizable";
import { AssetsPanel } from "@/components/editor/panels/assets";
import { PropertiesPanel } from "@/components/editor/panels/properties";
import { Timeline } from "@/timeline/components";
import { PreviewPanel } from "@/preview/components";
import { EditorHeader } from "@/components/editor/editor-header";
import { EditorProvider } from "@/components/providers/editor-provider";
import { Onboarding } from "@/components/editor/onboarding";
import { MigrationDialog } from "@/project/components/migration-dialog";
import { usePanelStore } from "@/editor/panel-store";
import { usePasteMedia } from "@/media/use-paste-media";
import { useMemo, useState } from "react";
import { useEditor } from "@/editor/use-editor";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { ChangelogNotification } from "@/changelog/components/changelog-notification";
import {
	createPreviewOverlayControl,
	isPreviewOverlayVisible,
	mergePreviewOverlaySources,
} from "@/preview/overlays";
import { usePreviewStore } from "@/preview/preview-store";
import { getGuidePreviewOverlaySource } from "@/guides";
import {
	bookmarkNotesPreviewOverlay,
	getBookmarkPreviewOverlaySource,
} from "@/timeline/bookmarks/index";
import { useIsMobile } from "@/hooks/use-mobile";
import { useElementSelection } from "@/timeline/hooks/element/use-element-selection";
import { cn } from "@/utils/ui";
import {
	TAB_KEYS,
	tabs,
	type Tab,
	useAssetsPanelStore,
} from "@/components/editor/panels/assets/assets-panel-store";
import { Captions } from "@/subtitles/components/assets-view";
import { MediaView } from "@/components/editor/panels/assets/views/assets";
import { SettingsView } from "@/components/editor/panels/assets/views/settings";
import { SoundsView } from "@/sounds/components/assets-view";
import { StickersView } from "@/stickers/components/assets-view";
import { TextView } from "@/text/components/assets-view";
import { EffectsView } from "@/effects/components/assets-view";

// ── View map ──────────────────────────────────────────────────
function useViewMap(): Record<Tab, React.ReactNode> {
	return {
		media:       <MediaView />,
		sounds:      <SoundsView />,
		text:        <TextView />,
		stickers:    <StickersView />,
		effects:     <EffectsView />,
		transitions: <div className="text-muted-foreground p-4 text-sm">Transitions coming soon...</div>,
		captions:    <Captions />,
		adjustment:  <div className="text-muted-foreground p-4 text-sm">Adjustment coming soon...</div>,
		settings:    <SettingsView />,
	};
}

export default function Editor() {
	const params = useParams();
	const projectId = params.project_id as string;

	return (
		<EditorProvider projectId={projectId}>
			<div className="bg-background flex h-[100dvh] w-screen flex-col overflow-hidden">
				<DegradedRendererBanner />
				<EditorHeader />
				<div className="min-h-0 min-w-0 flex-1">
					<EditorLayout />
				</div>
				<Onboarding />
				<MigrationDialog />
				<ChangelogNotification />
			</div>
		</EditorProvider>
	);
}

function DegradedRendererBanner() {
	const isDegraded = useEditor((e) => e.renderer.isDegraded);
	const [dismissed, setDismissed] = useState(false);
	if (!isDegraded || dismissed) return null;

	return (
		<div className="bg-accent border-b h-9 flex items-center justify-center gap-2 text-xs text-muted-foreground">
			<span>For the best experience, open KokoCut in Chrome.</span>
			<Button
				variant="text"
				size="icon"
				className="p-0 w-auto [&_svg]:size-3.5"
				onClick={() => setDismissed(true)}
				aria-label="Dismiss"
			>
				<HugeiconsIcon icon={Cancel01Icon} />
			</Button>
		</div>
	);
}

function EditorLayout() {
	const isMobile = useIsMobile();
	return isMobile ? <MobileEditorLayout /> : <DesktopEditorLayout />;
}

// ══════════════════════════════════════════════════════════════
// MOBILE LAYOUT — بالکل InShot جیسا، سب ایک screen پر
//
// ┌─────────────────────────────┐
// │        Preview              │ ← 38vh
// ├─────────────────────────────┤
// │   Properties (slide up)     │ ← element select پر
// ├─────────────────────────────┤
// │        Timeline             │ ← 140px، ہمیشہ
// ├─────────────────────────────┤
// │ [🎬][🔊][T][★][✨][⚙]     │ ← HugeIcons horizontal scroll
// ├─────────────────────────────┤
// │      Panel content          │ ← flex-1، scroll کریں
// └─────────────────────────────┘
// ══════════════════════════════════════════════════════════════
function MobileEditorLayout() {
	usePasteMedia();
	const { selectedElements } = useElementSelection();
	const hasSelection = selectedElements.length === 1;
	const { activeTab, setActiveTab } = useAssetsPanelStore();
	const viewMap = useViewMap();

	const activeScene = useEditor((e) => e.scenes.getActiveSceneOrNull());
	const currentTime = useEditor((e) => e.playback.getCurrentTime());
	const activeGuide = usePreviewStore((s) => s.activeGuide);
	const overlays = usePreviewStore((s) => s.overlays);
	const setOverlayVisibility = usePreviewStore((s) => s.setOverlayVisibility);
	const showBookmarkNotes = isPreviewOverlayVisible({
		overlay: bookmarkNotesPreviewOverlay,
		overlays,
	});

	const overlaySource = useMemo(
		() =>
			mergePreviewOverlaySources({
				sources: [
					getGuidePreviewOverlaySource({ guideId: activeGuide }),
					activeScene
						? getBookmarkPreviewOverlaySource({
								bookmarks: activeScene.bookmarks,
								time: currentTime,
								isVisible: showBookmarkNotes,
							})
						: { definitions: [bookmarkNotesPreviewOverlay], instances: [] },
				],
			}),
		[activeGuide, activeScene, currentTime, showBookmarkNotes],
	);

	const overlayControls = useMemo(
		() =>
			overlaySource.definitions.map((overlay) =>
				createPreviewOverlayControl({ overlay, overlays }),
			),
		[overlaySource.definitions, overlays],
	);

	return (
		<div className="flex flex-col w-full h-full bg-background overflow-hidden">

			{/* ① Preview — اوپر ──────────────────────────────── */}
			<div className="shrink-0" style={{ height: "38vh" }}>
				<PreviewPanel
					overlayControls={overlayControls}
					overlayInstances={overlaySource.instances}
					onOverlayVisibilityChange={setOverlayVisibility}
				/>
			</div>

			{/* ② Properties — element select ہونے پر آئے ──────── */}
			<div
				className={cn(
					"shrink-0 overflow-hidden transition-all duration-300 ease-in-out border-t border-border",
					hasSelection ? "h-[32vh]" : "h-0",
				)}
			>
				<PropertiesPanel />
			</div>

			{/* ③ Timeline — ہمیشہ درمیان میں ──────────────────── */}
			<div
				className="shrink-0 border-t border-border bg-background overflow-hidden"
				style={{ height: "140px" }}
			>
				<Timeline />
			</div>

			{/* ④ Tools horizontal tab bar — HugeIcons ────────── */}
			<div className="shrink-0 border-t border-border bg-background overflow-x-auto scrollbar-hidden">
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
										: "text-muted-foreground hover:bg-accent",
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

			{/* ⑤ Panel content — نیچے، flex-1 ─────────────────── */}
			<div className="flex-1 min-h-0 overflow-y-auto bg-background">
				{viewMap[activeTab]}
			</div>

		</div>
	);
}

// ══════════════════════════════════════════════════════════════
// DESKTOP LAYOUT — بالکل پہلے جیسا
// ══════════════════════════════════════════════════════════════
function DesktopEditorLayout() {
	usePasteMedia();
	const { panels, setPanel } = usePanelStore();

	const activeScene = useEditor((e) => e.scenes.getActiveSceneOrNull());
	const currentTime = useEditor((e) => e.playback.getCurrentTime());
	const activeGuide = usePreviewStore((s) => s.activeGuide);
	const overlays = usePreviewStore((s) => s.overlays);
	const setOverlayVisibility = usePreviewStore((s) => s.setOverlayVisibility);
	const showBookmarkNotes = isPreviewOverlayVisible({
		overlay: bookmarkNotesPreviewOverlay,
		overlays,
	});

	const overlaySource = useMemo(
		() =>
			mergePreviewOverlaySources({
				sources: [
					getGuidePreviewOverlaySource({ guideId: activeGuide }),
					activeScene
						? getBookmarkPreviewOverlaySource({
								bookmarks: activeScene.bookmarks,
								time: currentTime,
								isVisible: showBookmarkNotes,
							})
						: { definitions: [bookmarkNotesPreviewOverlay], instances: [] },
				],
			}),
		[activeGuide, activeScene, currentTime, showBookmarkNotes],
	);

	const overlayControls = useMemo(
		() =>
			overlaySource.definitions.map((overlay) =>
				createPreviewOverlayControl({ overlay, overlays }),
			),
		[overlaySource.definitions, overlays],
	);

	return (
		<ResizablePanelGroup
			direction="vertical"
			className="size-full gap-[0.18rem]"
			onLayout={(sizes) => {
				setPanel({ panel: "mainContent", size: sizes[0] ?? panels.mainContent });
				setPanel({ panel: "timeline",    size: sizes[1] ?? panels.timeline });
			}}
		>
			<ResizablePanel defaultSize={panels.mainContent} minSize={30} maxSize={85} className="min-h-0">
				<ResizablePanelGroup
					direction="horizontal"
					className="size-full gap-[0.19rem] px-3"
					onLayout={(sizes) => {
						setPanel({ panel: "tools",      size: sizes[0] ?? panels.tools });
						setPanel({ panel: "preview",    size: sizes[1] ?? panels.preview });
						setPanel({ panel: "properties", size: sizes[2] ?? panels.properties });
					}}
				>
					<ResizablePanel defaultSize={panels.tools} minSize={15} maxSize={40} className="min-w-0">
						<AssetsPanel />
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={panels.preview} minSize={30} className="min-h-0 min-w-0 flex-1">
						<PreviewPanel
							overlayControls={overlayControls}
							overlayInstances={overlaySource.instances}
							onOverlayVisibilityChange={setOverlayVisibility}
						/>
					</ResizablePanel>
					<ResizableHandle withHandle />
					<ResizablePanel defaultSize={panels.properties} minSize={15} maxSize={40} className="min-w-0">
						<PropertiesPanel />
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={panels.timeline} minSize={15} maxSize={70} className="min-h-0 px-3 pb-3">
				<Timeline />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
