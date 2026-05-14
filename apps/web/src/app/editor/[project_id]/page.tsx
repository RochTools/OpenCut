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
import { useMemo, useState, useEffect } from "react";
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

type MobileTab = "preview" | "assets" | "properties" | "timeline";

const MOBILE_TABS: { id: MobileTab; label: string; emoji: string }[] = [
	{ id: "assets",     label: "Assets",   emoji: "🎬" },
	{ id: "preview",    label: "Preview",  emoji: "▶️" },
	{ id: "properties", label: "Props",    emoji: "⚙️" },
	{ id: "timeline",   label: "Timeline", emoji: "📊" },
];

function MobileEditorLayout() {
	usePasteMedia();
	const [activeTab, setActiveTab] = useState<MobileTab>("preview");

	const activeScene = useEditor((editor) => editor.scenes.getActiveSceneOrNull());
	const currentTime = useEditor((editor) => editor.playback.getCurrentTime());
	const activeGuide = usePreviewStore((state) => state.activeGuide);
	const overlays = usePreviewStore((state) => state.overlays);
	const setOverlayVisibility = usePreviewStore((state) => state.setOverlayVisibility);
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
		<div className="flex flex-col size-full bg-background">
			<div className="flex-1 min-h-0 overflow-hidden">
				{activeTab === "preview" && (
					<div className="size-full">
						<PreviewPanel
							overlayControls={overlayControls}
							overlayInstances={overlaySource.instances}
							onOverlayVisibilityChange={setOverlayVisibility}
						/>
					</div>
				)}
				{activeTab === "assets" && (
					<div className="size-full overflow-auto">
						<AssetsPanel />
					</div>
				)}
				{activeTab === "properties" && (
					<div className="size-full overflow-auto">
						<PropertiesPanel />
					</div>
				)}
				{activeTab === "timeline" && (
					<div className="size-full overflow-auto">
						<Timeline />
					</div>
				)}
			</div>

			{/* Bottom Tab Bar - CapCut style */}
			<div className="flex-shrink-0 border-t border-border bg-background safe-area-bottom">
				<div className="flex items-center justify-around h-14">
					{MOBILE_TABS.map((tab) => (
						<button
							key={tab.id}
							onClick={() => setActiveTab(tab.id)}
							className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full text-[10px] font-medium transition-colors active:bg-accent/50 ${
								activeTab === tab.id
									? "text-primary"
									: "text-muted-foreground"
							}`}
						>
							<span className="text-xl leading-none">{tab.emoji}</span>
							<span>{tab.label}</span>
							{activeTab === tab.id && (
								<span className="w-4 h-0.5 rounded-full bg-primary mt-0.5" />
							)}
						</button>
					))}
				</div>
			</div>
		</div>
	);
}

function DesktopEditorLayout() {
	usePasteMedia();
	const { panels, setPanel } = usePanelStore();
	const activeScene = useEditor((editor) => editor.scenes.getActiveSceneOrNull());
	const currentTime = useEditor((editor) => editor.playback.getCurrentTime());
	const activeGuide = usePreviewStore((state) => state.activeGuide);
	const overlays = usePreviewStore((state) => state.overlays);
	const setOverlayVisibility = usePreviewStore((state) => state.setOverlayVisibility);
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
				setPanel({ panel: "timeline", size: sizes[1] ?? panels.timeline });
			}}
		>
			<ResizablePanel defaultSize={panels.mainContent} minSize={30} maxSize={85} className="min-h-0">
				<ResizablePanelGroup
					direction="horizontal"
					className="size-full gap-[0.19rem] px-3"
					onLayout={(sizes) => {
						setPanel({ panel: "tools", size: sizes[0] ?? panels.tools });
						setPanel({ panel: "preview", size: sizes[1] ?? panels.preview });
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

function EditorLayout() {
	const isMobile = useIsMobile();
	return isMobile ? <MobileEditorLayout /> : <DesktopEditorLayout />;
}
