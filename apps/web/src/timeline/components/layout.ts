import type { TrackType } from "@/timeline";

// موبائل پر چھوٹی track heights
function isMobileDevice(): boolean {
	if (typeof window === "undefined") return false;
	return window.innerWidth < 768;
}

export const TIMELINE_TRACK_HEIGHTS_PX: Record<TrackType, number> = {
	video: 65,
	text: 25,
	audio: 50,
	graphic: 25,
	effect: 25,
} as const;

export const KEYFRAME_LANE_HEIGHT_PX = 20;
export const KEYFRAME_DIAMOND_SIZE_PX = 14;
export const EXPANDED_GROUP_HEADER_HEIGHT_PX = 18;

export const TIMELINE_TRACK_GAP_PX = 6;

// موبائل پر 48px — desktop پر 112px
// یہ بائیں طرف track controls کی width ہے
export const TIMELINE_TRACK_LABELS_COLUMN_WIDTH_PX =
	typeof window !== "undefined" && window.innerWidth < 768 ? 48 : 112;

export const TIMELINE_RULER_HEIGHT_PX = 22;
export const TIMELINE_BOOKMARK_ROW_HEIGHT_PX = 16;
export const TIMELINE_SCROLLBAR_SIZE_PX = 12;
export const TIMELINE_CONTENT_TOP_PADDING_PX = 2;
