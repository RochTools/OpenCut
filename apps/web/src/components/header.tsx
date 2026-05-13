"use client";

import { Button } from "../ui/button";
import { useRef, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import Link from "next/link";
import { RenameProjectDialog } from "@/project/components/rename-project-dialog";
import { DeleteProjectDialog } from "@/project/components/delete-project-dialog";
import { useRouter } from "next/navigation";
import { FaDiscord } from "react-icons/fa6";
import { ExportButton } from "./export-button";
import { FeedbackPopover } from "@/feedback/components/feedback-popover";
import { ThemeToggle } from "../theme-toggle";
import { SOCIAL_LINKS } from "@/site/social";
import { toast } from "sonner";
import { useEditor } from "@/editor/use-editor";
import { CommandIcon, Logout05Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ShortcutsDialog } from "@/actions/components/shortcuts-dialog";
import { cn } from "@/utils/ui";

export function EditorHeader() {
  return (
    <header className="bg-background flex h-[3.4rem] items-center justify-between px-3 pt-0.5 shrink-0">
      {/* ── بائیں طرف: Logo + Project Name ─────────────── */}
      <div className="flex items-center gap-1 min-w-0">
        <ProjectDropdown />
        {/* KokoCut logo text — موبائل پر بھی دکھے */}
        <span className="font-extrabold text-[1.1rem] tracking-tight text-[hsl(210,100%,60%)] select-none hidden sm:block">
          koko<span className="text-foreground">cut</span>
        </span>
        {/* موبائل پر چھوٹا */}
        <span className="font-extrabold text-[0.95rem] tracking-tight text-[hsl(210,100%,60%)] select-none sm:hidden">
          koko<span className="text-foreground">cut</span>
        </span>
        <EditableProjectName />
      </div>

      {/* ── دائیں طرف: actions ──────────────────────────── */}
      <nav className="flex items-center gap-1 shrink-0">
        {/* Feedback صرف desktop پر */}
        <span className="hidden md:block">
          <FeedbackPopover />
        </span>
        <ExportButton />
        {/* Theme toggle صرف desktop پر */}
        <span className="hidden md:block">
          <ThemeToggle />
        </span>
      </nav>
    </header>
  );
}

function ProjectDropdown() {
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
          {/* KokoCut آئیکن — نیلا K */}
          <Button
            variant="ghost"
            size="icon"
            className="p-1 rounded-sm size-8 shrink-0"
            aria-label="Project menu"
          >
            <span
              className="flex items-center justify-center size-6 rounded-md
                         bg-[hsl(210,100%,60%)] text-white font-black text-sm leading-none"
            >
              K
            </span>
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
        onOpenChange={(o) => setOpenDialog(o ? "rename" : null)}
        onConfirm={handleSaveProjectName}
        projectName={activeProject?.metadata.name || ""}
      />
      <DeleteProjectDialog
        isOpen={openDialog === "delete"}
        onOpenChange={(o) => setOpenDialog(o ? "delete" : null)}
        onConfirm={handleDeleteProject}
        projectNames={[activeProject?.metadata.name || ""]}
      />
      <ShortcutsDialog
        isOpen={openDialog === "shortcuts"}
        onOpenChange={(o) => setOpenDialog(o ? "shortcuts" : null)}
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

  const projectName = activeProject?.metadata.name || "";

  const startEditing = () => {
    if (isEditing) return;
    originalNameRef.current = projectName;
    setIsEditing(true);
    requestAnimationFrame(() => inputRef.current?.select());
  };

  const saveEdit = async () => {
    if (!inputRef.current || !activeProject) return;
    const newName = inputRef.current.value.trim();
    setIsEditing(false);
    if (!newName) { inputRef.current.value = originalNameRef.current; return; }
    if (newName !== originalNameRef.current) {
      try {
        await editor.project.renameProject({
          id: activeProject.metadata.id,
          name: newName,
        });
      } catch (error) {
        toast.error("Failed to rename project", {
          description: error instanceof Error ? error.message : "Please try again",
        });
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") { event.preventDefault(); inputRef.current?.blur(); }
    else if (event.key === "Escape") {
      event.preventDefault();
      if (inputRef.current) { inputRef.current.value = originalNameRef.current; }
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
      style={{ fieldSizing: "content" }}
      className={cn(
        // موبائل پر مختصر، desktop پر پوری width
        "text-[0.85rem] h-8 px-2 py-1 rounded-sm bg-transparent outline-none",
        "cursor-pointer hover:bg-accent hover:text-accent-foreground",
        "max-w-[120px] sm:max-w-[200px] truncate",
        isEditing && "ring-1 ring-ring cursor-text hover:bg-transparent max-w-none truncate-none",
      )}
    />
  );
}
