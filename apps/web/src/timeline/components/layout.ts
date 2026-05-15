import type { TrackType } from "@/timeline";

// ── موبائل detect ─────────────────────────────────────────────
const IS_MOBILE =
	typeof window !== "undefined" && window.innerWidth < 768;

// ── Track heights ─────────────────────────────────────────────
// موبائل پر video track اونچی کریں تاکہ thumbnails صاف نظر آئیں
export const TIMELINE_TRACK_HEIGHTS_PX: Record<TrackType, number> = {
	video:   IS_MOBILE ? 80 : 65,  // موبائل پر 80px
	text:    IS_MOBILE ? 32 : 25,
	audio:   IS_MOBILE ? 56 : 50,
	graphic: IS_MOBILE ? 32 : 25,
	effect:  IS_MOBILE ? 32 : 25,
} as const;

export const KEYFRAME_LANE_HEIGHT_PX = 20;
export const KEYFRAME_DIAMOND_SIZE_PX = 14;
export const EXPANDED_GROUP_HEADER_HEIGHT_PX = 18;

export const TIMELINE_TRACK_GAP_PX = 6;

// ── Track labels column ───────────────────────────────────────
// موبائل پر بائیں طرف کم جگہ تاکہ timeline زیادہ چوڑی ہو
export const TIMELINE_TRACK_LABELS_COLUMN_WIDTH_PX =
	IS_MOBILE ? 40 : 112;

export const TIMELINE_RULER_HEIGHT_PX = 22;
export const TIMELINE_BOOKMARK_ROW_HEIGHT_PX = 16;
export const TIMELINE_SCROLLBAR_SIZE_PX = 12;
export const TIMELINE_CONTENT_TOP_PADDING_PX = 2;
