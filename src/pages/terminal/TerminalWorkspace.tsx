import type {
  MouseEvent as ReactMouseEvent,
  RefObject,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ClipboardList, Code2, Files, PanelRightClose, PanelRightOpen, SquareTerminal } from "lucide-react";
import { TablerAlertTriangleFilled } from "@/components/Icones/Tabler";
import CommandClipboardPanel from "./CommandClipboard";
import FileManagerPanel from "./FileManagerPanel";
import TerminalSession from "./TerminalSession";
import { TerminalSearchBar } from "./TerminalSearchBar";
import type { TerminalSessionApi } from "./TerminalSession";
import type { XtermjsSettings } from "@/hooks/useXtermjsSettings";
import type { TerminalTab, TerminalClient } from "./terminalTypes";
import { remoteControlState, TERMINAL_CALLOUT_CLASS_NAME } from "./terminalTypes";

export interface TerminalWorkspaceProps {
  containerRef: RefObject<HTMLDivElement | null>;
  isClipboardOpen: boolean;
  sidebarTab: "clipboard" | "files";
  leftWidth: number;
  tabs: TerminalTab[];
  clients: TerminalClient[];
  clientsLoading: boolean;
  activeTabId: string | null;
  sessionsReady: boolean;
  settings: XtermjsSettings;
  twoFaEnabled: boolean;
  disconnectMessage: string;
  searchOpen: boolean;
  searchTerm: string;
  searchResultIndex: number;
  searchResultCount: number;
  searchCaseSensitive: boolean;
  searchUseRegex: boolean;
  onSearchTermChange: (term: string) => void;
  onFindNext: () => void;
  onFindPrevious: () => void;
  onToggleCaseSensitive: () => void;
  onToggleUseRegex: () => void;
  onCloseSearch: () => void;
  onApiChange: (id: string, api: TerminalSessionApi | null) => void;
  onToggleSidebar: () => void;
  onSidebarTabChange: (tab: "clipboard" | "files") => void;
  onStartDragging: (event: ReactMouseEvent | ReactTouchEvent) => void;
  onOpenTerminalMenu: () => void;
  onOpenWorkbenchMenu: () => void;
}

const Divider = ({
  onMouseDown,
}: {
  onMouseDown: (event: ReactMouseEvent | ReactTouchEvent) => void;
}) => (
  <div
    className="km-terminal-divider h-full w-1.5 flex-[0_0_6px] cursor-col-resize bg-[#141414] transition-colors hover:bg-neutral-700"
    onMouseDown={onMouseDown}
    onTouchStart={onMouseDown}
    role="separator"
    aria-orientation="vertical"
  />
);

const TerminalWorkspace = ({
  containerRef,
  isClipboardOpen,
  sidebarTab,
  leftWidth,
  tabs,
  clients,
  clientsLoading,
  activeTabId,
  sessionsReady,
  settings,
  twoFaEnabled,
  disconnectMessage,
  searchOpen,
  searchTerm,
  searchResultIndex,
  searchResultCount,
  searchCaseSensitive,
  searchUseRegex,
  onSearchTermChange,
  onFindNext,
  onFindPrevious,
  onToggleCaseSensitive,
  onToggleUseRegex,
  onCloseSearch,
  onApiChange,
  onToggleSidebar,
  onSidebarTabChange,
  onStartDragging,
  onOpenTerminalMenu,
  onOpenWorkbenchMenu,
}: TerminalWorkspaceProps) => {
  const { t } = useTranslation();
  const clientsByUuid = useMemo(
    () => new Map(clients.map((client) => [client.uuid, client])),
    [clients],
  );
  const activeClient = clientsByUuid.get(
    tabs.find((tab) => tab.id === activeTabId)?.uuid ?? "",
  );
  // The high-privilege notice is informational: it is shown once per client and
  // can be dismissed, so it never turns into a repeating popup.
  const [dismissedElevatedNotice, setElevatedNoticeDismissed] = useState<
    Record<string, boolean>
  >({});
  const activeState = remoteControlState(activeClient);
  const elevatedNoticeVisible =
    activeState.enabled &&
    activeState.elevated &&
    !dismissedElevatedNotice[activeClient?.uuid ?? ""];

  return (
    <div
      ref={containerRef}
      className="km-terminal-body relative flex min-h-0 min-w-0 flex-1 bg-[#000000]"
    >
      <div
        className="km-terminal-main relative flex h-full min-h-0 min-w-[300px] flex-[0_0_auto] overflow-hidden max-[640px]:min-w-0"
        style={{
          width: isClipboardOpen ? `${leftWidth}px` : "100%",
        }}
      >
        <TerminalSearchBar
          open={searchOpen}
          searchTerm={searchTerm}
          resultIndex={searchResultIndex}
          resultCount={searchResultCount}
          caseSensitive={searchCaseSensitive}
          useRegex={searchUseRegex}
          onSearchTermChange={onSearchTermChange}
          onFindNext={onFindNext}
          onFindPrevious={onFindPrevious}
          onToggleCaseSensitive={onToggleCaseSensitive}
          onToggleUseRegex={onToggleUseRegex}
          onClose={onCloseSearch}
        />

        <div className="km-terminal-session-stack relative h-full min-h-0 min-w-0 flex-1 overflow-hidden bg-[#000000]">
          {elevatedNoticeVisible && (
            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
              <div
                className={`pointer-events-auto flex max-w-2xl items-center gap-3 px-3 py-2 text-sm ${TERMINAL_CALLOUT_CLASS_NAME}`}
              >
                <TablerAlertTriangleFilled className="shrink-0 text-red-400" />
                <span>
                  {t(
                    "terminal.remote_control_elevated",
                    "This agent runs with high privileges, so remote control lets the panel execute commands and access files with that privilege.",
                  )}
                </span>
                <button
                  type="button"
                  className="ml-auto cursor-pointer border-0 bg-transparent text-red-300 hover:text-red-100"
                  onClick={() =>
                    setElevatedNoticeDismissed((previous) => ({
                      ...previous,
                      [activeClient?.uuid ?? ""]: true,
                    }))
                  }
                  aria-label={t("common.close", "Close")}
                >
                  ×
                </button>
              </div>
            </div>
          )}
          {sessionsReady &&
            tabs.map((tab) => {
              const state = remoteControlState(clientsByUuid.get(tab.uuid));
              if (state.known && !state.terminal) {
                return (
                  <div
                    key={tab.id}
                    className={
                      tab.id === activeTabId
                        ? "km-terminal-empty-state absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center"
                        : "hidden"
                    }
                  >
                    <span className="text-neutral-300">
                      {t(
                        "terminal.remote_control_disabled",
                        "Remote control is not enabled on this agent",
                      )}
                    </span>
                  </div>
                );
              }
              return (
              <TerminalSession
                key={tab.id}
                uuid={tab.uuid}
                active={tab.id === activeTabId}
                settings={settings}
                twoFaEnabled={twoFaEnabled}
                disconnectMessage={disconnectMessage}
                onApiChange={(api) => onApiChange(tab.id, api)}
              />
              );
            })}
          {tabs.length === 0 && (
            <div className="km-terminal-empty-state flex h-full w-full flex-col items-center justify-center gap-3">
              <strong className="text-neutral-400">
                {clientsLoading
                  ? t("terminal.tabs.loading_servers", "Loading servers...")
                  : t("terminal.tabs.empty_title")}
              </strong>
              <div className={`flex items-center gap-2 ${clientsLoading ? "opacity-40 pointer-events-none" : ""}`}>
                <button
                  onClick={onOpenTerminalMenu}
                  className="flex items-center gap-1.5 rounded-[6px] border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  <SquareTerminal size={14} />
                  {t("terminal.tabs.open_terminal", "Open terminal")}
                </button>
                <button
                  onClick={onOpenWorkbenchMenu}
                  className="flex items-center gap-1.5 rounded-[6px] border border-neutral-700 bg-neutral-800/80 px-3 py-1.5 text-xs text-neutral-200 transition-colors hover:bg-neutral-700 disabled:opacity-50"
                >
                  <Code2 size={14} />
                  {t("terminal.tabs.open_workbench", "Open workbench")}
                </button>
              </div>
            </div>
          )}
          {tabs.length > 0 && !sessionsReady && (
            <div className="km-terminal-loading-state absolute inset-0 z-[3] flex flex-col items-center justify-center gap-2.5 text-sm text-neutral-400">
              {t("terminal.tabs.connecting")}
            </div>
          )}
        </div>
        <button
          type="button"
          className="km-terminal-clipboard-toggle absolute right-0 top-1/2 z-[4] flex h-[48px] w-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded-l-[5px] border-0 bg-[#2b2b2b] text-neutral-400 transition-colors hover:bg-[#383838] hover:text-white"
          onClick={onToggleSidebar}
          aria-label={
            isClipboardOpen
              ? t("common.close", "Close")
              : sidebarTab === "files"
                ? t("file_manager.title", "File Manager")
                : t("command_clipboard.title", "Command Clipboard")
          }
          title={
            isClipboardOpen
              ? t("common.close", "Close")
              : sidebarTab === "files"
                ? t("file_manager.title", "File Manager")
                : t("command_clipboard.title", "Command Clipboard")
          }
        >
          {isClipboardOpen ? <PanelRightClose size={14} /> : <PanelRightOpen size={14} />}
        </button>
      </div>
      {isClipboardOpen && <Divider onMouseDown={onStartDragging} />}
      <aside
        className={`${
          isClipboardOpen
            ? "flex h-full min-w-[300px] flex-1 flex-col overflow-hidden bg-[#121212] max-[640px]:min-w-[220px]"
            : "hidden"
        }`}
      >
          <div className="flex h-9 shrink-0 items-center gap-1 bg-[#181818] px-1 pb-1">
            <button
              type="button"
              className={`flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[4px] border-0 px-2 text-xs transition-colors ${sidebarTab === "clipboard" ? "bg-[#37373d] text-white" : "bg-transparent text-[#999] hover:bg-[#2a2d2e] hover:text-white"}`}
              onClick={() => onSidebarTabChange("clipboard")}
            >
              <ClipboardList size={14} />
              <span className="min-w-0 truncate">{t("command_clipboard.title", "Command Clipboard")}</span>
            </button>
            <button
              type="button"
              className={`flex h-7 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-[4px] border-0 px-2 text-xs transition-colors ${sidebarTab === "files" ? "bg-[#37373d] text-white" : "bg-transparent text-[#999] hover:bg-[#2a2d2e] hover:text-white"}`}
              onClick={() => onSidebarTabChange("files")}
            >
              <Files size={14} />
              <span className="min-w-0 truncate">{t("file_manager.title", "File Manager")}</span>
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <div className={sidebarTab === "clipboard" ? "h-full overflow-hidden p-2" : "hidden"}>
              <CommandClipboardPanel showHeader={false} className="h-full w-full" />
            </div>
            <div className={sidebarTab === "files" ? "h-full overflow-hidden" : "hidden"}>
              {remoteControlState(activeClient).known && !remoteControlState(activeClient).file ? (
                <div className="km-terminal-empty-state flex h-full w-full flex-col items-center justify-center gap-3 p-6 text-center">
                  <span className="text-neutral-300">
                    {t(
                      "terminal.file_manager_disabled",
                      "The file manager is not enabled on this agent",
                    )}
                  </span>
                </div>
              ) : (
                <FileManagerPanel uuid={tabs.find((tab) => tab.id === activeTabId)?.uuid ?? null} />
              )}
            </div>
          </div>
      </aside>
    </div>
  );
};

export default TerminalWorkspace;
