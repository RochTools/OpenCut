"use client";

import { Button } from "@/components/ui/button";
import { useRef, useState, useEffect } from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { RenameProjectDialog } from "@/project/components/rename-project-dialog";
import { DeleteProjectDialog } from "@/project/components/delete-project-dialog";
import { useRouter } from "next/navigation";
import { FaDiscord } from "react-icons/fa6";
import { ExportButton } from "@/components/editor/export-button";
import { FeedbackPopover } from "@/feedback/components/feedback-popover";
import { ThemeToggle } from "@/components/theme-toggle";
import { DEFAULT_LOGO_URL } from "@/site/brand";
import { SOCIAL_LINKS } from "@/site/social";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import {
	CommandIcon,
	Logout05Icon,
	MoreHorizontalIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsDialog } from "@/actions/components/shortcuts-dialog";
import Image from "next/image";
import { cn } from "@/utils/ui";

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

export function EditorHeader() {
	const isMobile = useIsMobile();

	return (
		<header
			className={cn(
				"bg-background flex items-center justify-between shrink-0 border-b border-border",
				isMobile ? "h-12 px-2" : "h-[3.4rem] px-3 pt-0.5",
			)}
		>
			{/* ── بائیں: Logo + KokoCut name + Project name ── */}
			<div className="flex items-center gap-1 min-w-0">
				{isMobile ? <MobileProjectDropdown /> : <ProjectDropdown />}

				{/* KokoCut برانڈ نام */}
				<span
					className={cn(
						"font-extrabold tracking-tight select-none",
						isMobile ? "text-[0.92rem]" : "text-[1.05rem]",
					)}
				>
					<span className="text-[hsl(200,90%,52%)]">koko</span>
					<span className="text-foreground">cut</span>
				</span>

				<EditableProjectName />
			</div>

			{/* ── دائیں: Actions ── */}
			<nav className="flex items-center gap-1 sm:gap-2 shrink-0">
				{isMobile ? <MobileActions /> : <DesktopActions />}
			</nav>
		</header>
	);
}

function DesktopActions() {
	return (
		<>
			<FeedbackPopover />
			<ExportButton />
			<ThemeToggle />
		</>
	);
}

function MobileActions() {
	const [openDialog, setOpenDialog] = useState<"shortcuts" | null>(null);

	return (
		<>
			{/* Export موبائل پر بھی دکھائیں */}
			<ExportButton />

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="size-9">
						<HugeiconsIcon icon={MoreHorizontalIcon} className="size-5" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="z-[100] w-44">
					<DropdownMenuItem
						onClick={() => setOpenDialog("shortcuts")}
						icon={<HugeiconsIcon icon={CommandIcon} />}
					>
						Shortcuts
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ShortcutsDialog
				isOpen={openDialog === "shortcuts"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "shortcuts" : null)}
			/>
		</>
	);
}

function MobileProjectDropdown() {
	const [openDialog, setOpenDialog] = useState<
		"delete" | "rename" | "shortcuts" | null
	>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());

	const handleExit = async () => {
		if (isExiting) return;
		setIsExiting(true);
		try {
			await editor.project.prepareExit();
			editor.project.closeProject();
		} catch (error) {
			console.error("Failed to prepare project exit:", error);
		} finally {
			editor.project.closeProject();
			router.push("/projects");
		}
	};

	const handleSaveProjectName = async (newName: string) => {
		if (activeProject && newName.trim() && newName !== activeProject.metadata.name) {
			try {
				await editor.project.renameProject({
					id: activeProject.metadata.id,
					name: newName.trim(),
				});
			} catch (error) {
				toast.error("Failed to rename project", {
					description: error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	const handleDeleteProject = async () => {
		if (activeProject) {
			try {
				await editor.project.deleteProjects({ ids: [activeProject.metadata.id] });
				router.push("/projects");
			} catch (error) {
				toast.error("Failed to delete project", {
					description: error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="p-1 rounded-sm size-8 shrink-0">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="Project"
							width={32}
							height={32}
							className="invert dark:invert-0 size-5"
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="z-[100] w-44">
					<DropdownMenuItem
						onClick={handleExit}
						disabled={isExiting}
						icon={<HugeiconsIcon icon={Logout05Icon} />}
					>
						Exit project
					</DropdownMenuItem>
					<DropdownMenuItem onClick={() => setOpenDialog("rename")}>
						Rename
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setOpenDialog("delete")}
						className="text-destructive"
					>
						Delete
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild icon={<FaDiscord className="size-4!" />}>
						<Link href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer">
							Discord
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameProjectDialog
				isOpen={openDialog === "rename"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "rename" : null)}
				onConfirm={(newName) => handleSaveProjectName(newName)}
				projectName={activeProject?.metadata.name || ""}
			/>
			<DeleteProjectDialog
				isOpen={openDialog === "delete"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "delete" : null)}
				onConfirm={handleDeleteProject}
				projectNames={[activeProject?.metadata.name || ""]}
			/>
		</>
	);
}

function ProjectDropdown() {
	const [openDialog, setOpenDialog] = useState<"delete" | "rename" | "shortcuts" | null>(null);
	const [isExiting, setIsExiting] = useState(false);
	const router = useRouter();
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());

	const handleExit = async () => {
		if (isExiting) return;
		setIsExiting(true);
		try {
			await editor.project.prepareExit();
			editor.project.closeProject();
		} catch (error) {
			console.error("Failed to prepare project exit:", error);
		} finally {
			editor.project.closeProject();
			router.push("/projects");
		}
	};

	const handleSaveProjectName = async (newName: string) => {
		if (activeProject && newName.trim() && newName !== activeProject.metadata.name) {
			try {
				await editor.project.renameProject({ id: activeProject.metadata.id, name: newName.trim() });
			} catch (error) {
				toast.error("Failed to rename project", {
					description: error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	const handleDeleteProject = async () => {
		if (activeProject) {
			try {
				await editor.project.deleteProjects({ ids: [activeProject.metadata.id] });
				router.push("/projects");
			} catch (error) {
				toast.error("Failed to delete project", {
					description: error instanceof Error ? error.message : "Please try again",
				});
			} finally {
				setOpenDialog(null);
			}
		}
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon" className="p-1 rounded-sm size-8">
						<Image
							src={DEFAULT_LOGO_URL}
							alt="Project thumbnail"
							width={32}
							height={32}
							className="invert dark:invert-0 size-5"
						/>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="z-[100] w-44">
					<DropdownMenuItem
						onClick={handleExit}
						disabled={isExiting}
						icon={<HugeiconsIcon icon={Logout05Icon} />}
					>
						Exit project
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => setOpenDialog("shortcuts")}
						icon={<HugeiconsIcon icon={CommandIcon} />}
					>
						Shortcuts
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem asChild icon={<FaDiscord className="size-4!" />}>
						<Link href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer">
							Discord
						</Link>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<RenameProjectDialog
				isOpen={openDialog === "rename"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "rename" : null)}
				onConfirm={(newName) => handleSaveProjectName(newName)}
				projectName={activeProject?.metadata.name || ""}
			/>
			<DeleteProjectDialog
				isOpen={openDialog === "delete"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "delete" : null)}
				onConfirm={handleDeleteProject}
				projectNames={[activeProject?.metadata.name || ""]}
			/>
			<ShortcutsDialog
				isOpen={openDialog === "shortcuts"}
				onOpenChange={(isOpen) => setOpenDialog(isOpen ? "shortcuts" : null)}
			/>
		</>
	);
}

function EditableProjectName() {
	const editor = useEditor();
	const activeProject = useEditor((e) => e.project.getActive());
	const [isEditing, setIsEditing] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	const originalNameRef = useRef("");
	const isMobile = useIsMobile();

	const projectName = activeProject?.metadata.name || "";

	const startEditing = () => {
		if (isEditing) return;
		originalNameRef.current = projectName;
		setIsEditing(true);
		requestAnimationFrame(() => { inputRef.current?.select(); });
	};

	const saveEdit = async () => {
		if (!inputRef.current || !activeProject) return;
		const newName = inputRef.current.value.trim();
		setIsEditing(false);
		if (!newName) { inputRef.current.value = originalNameRef.current; return; }
		if (newName !== originalNameRef.current) {
			try {
				await editor.project.renameProject({ id: activeProject.metadata.id, name: newName });
			} catch (error) {
				toast.error("Failed to rename project", {
					description: error instanceof Error ? error.message : "Please try again",
				});
			}
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (event.key === "Enter") {
			event.preventDefault();
			inputRef.current?.blur();
		} else if (event.key === "Escape") {
			event.preventDefault();
			if (inputRef.current) {
				inputRef.current.value = originalNameRef.current;
				inputRef.current.setSelectionRange(0, 0);
			}
			setIsEditing(false);
			inputRef.current?.blur();
		}
	};

	return (
		<input
			ref={inputRef}
			type="text"
			defaultValue={projectName}
			readOnly={!isEditing}
			onClick={startEditing}
			onBlur={saveEdit}
			onKeyDown={handleKeyDown}
			style={{ fieldSizing: "content" } as React.CSSProperties}
			className={cn(
				"h-8 px-2 py-1 rounded-sm bg-transparent outline-none cursor-pointer hover:bg-accent hover:text-accent-foreground",
				isMobile ? "text-sm max-w-[100px] truncate" : "text-[0.9rem]",
				isEditing && "ring-1 ring-ring cursor-text hover:bg-transparent",
			)}
		/>
	);
}
