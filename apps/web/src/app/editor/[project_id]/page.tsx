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
	Folder03Icon,
	TimeQuarterPassIcon,
	PlayIcon,
} from "@hugeicons/core-free-icons";

// ── Mobile bottom tab types ───────────────────────────────────
type MobileTab = "assets" | "preview" | "timeline";

const MOBILE_TABS: {
	id: MobileTab;
	label: string;
	icon: typeof Folder03Icon;
}[] = [
	{ id: "assets",   label: "Assets",   icon: Folder03Icon },
	{ id: "preview",  label: "Preview",  icon: PlayIcon },
	{ id: "timeline", label: "Timeline", icon: TimeQuarterPassIcon },
];

// ── Main Entry ────────────────────────────────────────────────
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

// ── Layout Switch ─────────────────────────────────────────────
function EditorLayout() {
	const isMobile = useIsMobile();
	return isMobile ? <MobileEditorLayout /> : <DesktopEditorLayout />;
}

// ══════════════════════════════════════════════════════════════
// MOBILE LAYOUT
// ┌─────────────────────────────┐
// │        Preview              │ ← flex-1, پوری height
// ├─────────────────────────────┤
// │   Properties (slide up)     │ ← element select پر
// ├─────────────────────────────┤
// │   Timeline strip            │ ← preview tab پر
// ├─────────────────────────────┤
// │  Assets │ Preview │ Timeline│ ← HugeIcons bottom bar
// └─────────────────────────────┘
// ══════════════════════════════════════════════════════════════
function MobileEditorLayout() {
	usePasteMedia();
	const [activeTab, setActiveTab] = useState<MobileTab>("preview");
	const { selectedElements } = useElementSelection();
	const hasSelection = selectedElements.length === 1;

	// overlays
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

			{/* ── Content area ──────────────────────────────── */}
			<div className="flex-1 min-h-0 relative overflow-hidden">

				{/* Preview — ہمیشہ mount رہے تاکہ video pause نہ ہو */}
				<div
					className={cn(
						"absolute inset-0",
						activeTab === "preview"
							? "z-10 opacity-100"
							: "z-0 opacity-0 pointer-events-none",
					)}
				>
					<PreviewPanel
						overlayControls={overlayControls}
						overlayInstances={overlaySource.instances}
						onOverlayVisibilityChange={setOverlayVisibility}
					/>
				</div>

				{/* Assets tab */}
				{activeTab === "assets" && (
					<div className="absolute inset-0 z-10 overflow-auto bg-background">
						<AssetsPanel />
					</div>
				)}

				{/* Timeline tab (full screen) */}
				{activeTab === "timeline" && (
					<div className="absolute inset-0 z-10 overflow-auto bg-background p-2">
						<Timeline />
					</div>
				)}
			</div>

			{/* ── Properties panel — element select ہونے پر آئے ── */}
			{activeTab === "preview" && (
				<div
					className={cn(
						"shrink-0 overflow-hidden transition-all duration-300 ease-in-out border-t border-border",
						hasSelection ? "h-[40vh]" : "h-0",
					)}
				>
					<PropertiesPanel />
				</div>
			)}

			{/* ── Timeline strip — preview tab پر نیچے ─────────── */}
			{activeTab === "preview" && (
				<div className="shrink-0 h-[100px] border-t border-border overflow-hidden">
					<Timeline />
				</div>
			)}

			{/* ── Bottom Tab Bar — HugeIcons ───────────────────── */}
			<nav className="shrink-0 flex items-stretch h-14 border-t border-border bg-background safe-area-bottom">
				{MOBILE_TABS.map((tab) => {
					const isActive = activeTab === tab.id;
					return (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={cn(
								"flex flex-col items-center justify-center gap-1 flex-1",
								"transition-colors active:bg-accent/40",
								isActive
									? "text-primary"
									: "text-muted-foreground",
							)}
						>
							<HugeiconsIcon
								icon={tab.icon}
								className={cn(
									"size-5 shrink-0",
									isActive ? "text-primary" : "text-muted-foreground",
								)}
							/>
							<span className="text-[10px] font-medium leading-none">
								{tab.label}
							</span>
							{isActive && (
								<span className="w-4 h-0.5 rounded-full bg-primary" />
							)}
						</button>
					);
				})}
			</nav>
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
			<ResizablePanel
				defaultSize={panels.mainContent}
				minSize={30}
				maxSize={85}
				className="min-h-0"
			>
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
			<ResizablePanel
				defaultSize={panels.timeline}
				minSize={15}
				maxSize={70}
				className="min-h-0 px-3 pb-3"
			>
				<Timeline />
			</ResizablePanel>
		</ResizablePanelGroup>
	);
}
