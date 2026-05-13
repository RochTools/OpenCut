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

interface AssetsPanelProps {
  /**
   * موبائل layout میں sidebar چھپا دو —
   * bottom tab bar پہلے سے tab control کرتی ہے
   */
  hideSidebar?: boolean;
}

export function AssetsPanel({ hideSidebar = false }: AssetsPanelProps) {
  const { activeTab } = useAssetsPanelStore();

  const viewMap: Record<Tab, React.ReactNode> = {
    media:       <MediaView />,
    sounds:      <SoundsView />,
    text:        <TextView />,
    stickers:    <StickersView />,
    effects:     <EffectsView />,
    transitions: (
      <div className="text-muted-foreground p-4 text-sm">
        Transitions view coming soon…
      </div>
    ),
    captions:    <Captions />,
    adjustment:  (
      <div className="text-muted-foreground p-4 text-sm">
        Adjustment view coming soon…
      </div>
    ),
    settings:    <SettingsView />,
  };

  return (
    <div className="panel bg-background flex h-full rounded-sm border overflow-hidden">
      {/* Desktop پر sidebar ، موبائل پر hidden */}
      {!hideSidebar && (
        <>
          <TabBar />
          <Separator orientation="vertical" />
        </>
      )}
      <div className="flex-1 overflow-hidden overflow-y-auto">
        {viewMap[activeTab]}
      </div>
    </div>
  );
}
