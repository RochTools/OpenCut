"use client";

import { useEffect, useState } from "react";

interface MobileGateProps {
	children: React.ReactNode;
}

export function MobileGate({ children }: MobileGateProps) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(true);
	}, []);

	if (!ready) return null;
	return <>{children}</>;
}
