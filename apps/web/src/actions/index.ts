export * from "./definitions";
export * from "./types";
export * from "./registry";

import { ACTIONS } from "./definitions";
import type { TActionWithOptionalArgs } from "./types";

const ACTION_SET = new Set<string>(Object.keys(ACTIONS));

export function isActionWithOptionalArgs(value: string): value is TActionWithOptionalArgs {
	return ACTION_SET.has(value);
}
