import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Loader2, Puzzle, Check, ExternalLink, Plug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EXTENSION_ID } from "@/constants";
import { useGetExtension } from "@/hooks/queries/useAuth";

declare global {
  interface Window {
    chrome?: any;
  }
}

type ConnectionStatus =
  | "checking"
  | "not_installed"
  | "not_connected"
  | "connected";

export default function ConnectExtensionButton() {
  const [status, setStatus] = useState<ConnectionStatus>("checking");
  const { mutate, isPending } = useGetExtension();

  function refreshStatus() {
    setStatus("checking");

    if (!window.chrome?.runtime) {
      console.log("Chrome runtime unavailable");
      setStatus("not_installed");
      return;
    }

    window.chrome.runtime.sendMessage(
      EXTENSION_ID,
      { type: "PING" },
      (response: any) => {
        const error = window.chrome.runtime.lastError;

        if (error) {
          setStatus("not_installed");
          return;
        }

        if (!response?.ok) {
          setStatus("not_connected");
          return;
        }

        setStatus(response.connected ? "connected" : "not_connected");
      },
    );
  }
  useEffect(() => {
    refreshStatus();
  }, []);

  function handleConnect() {
    mutate(undefined, {
      onSuccess: (data) => {
        if (!data || !data.data) {
          return toast.error("Error occured");
        }
        window.chrome.runtime.sendMessage(
          EXTENSION_ID,
          {
            type: "SYNC_AUTH",
            payload: {
              token: data.data,
            },
          },
          (response: any) => {
            const error = window.chrome.runtime.lastError;

            if (error) {
              toast.error("Couldn't connect to extension");
              return;
            }

            if (!response?.ok) {
              toast.error("Couldn't connect to extension");
              return;
            }

            setStatus("connected");
            toast.success("Extension connected");
          },
        );
      },

      onError: (error) => {
        toast.error("Failed to generate token");
      },
    });
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 4 }}
        transition={{ duration: 0.15 }}
      >
        {status === "checking" && (
          <Button variant="ghost" size="sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking extension...
          </Button>
        )}

        {status === "not_installed" && (
          <Button variant="outline" size="sm">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Puzzle className="mr-2 h-4 w-4" />
              Install Extension
              <ExternalLink className="ml-2 h-3 w-3 text-muted-foreground" />
            </a>
          </Button>
        )}

        {status === "connected" && (
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-600"
            disabled
          >
            <Check className="mr-2 h-4 w-4" />
            Extension Connected
          </Button>
        )}

        {status === "not_connected" && (
          <Button
            variant="default"
            size="sm"
            onClick={handleConnect}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plug className="mr-2 h-4 w-4" />
            )}
            {isPending ? "Connecting..." : "Connect Extension"}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
