import { useState } from "react";
import { UIModal } from "@/components/common/UIModal/UIModal";
import { UIButton } from "@/components/common/UIButton";
import { UIInput } from "@/components/common/UIInput/UIInput";
import { Copy, Check, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { TITLES } from "@/shared/constants/titles";
import { MESSAGES } from "@/shared/constants/messages";

interface TenantSuccessDialogProps {
  open: boolean;
  tenantName: string;
  adminEmail: string;
  temporaryPassword?: string;
  onClose: () => void;
}

export function TenantSuccessDialog({
  open,
  tenantName,
  adminEmail,
  temporaryPassword = "",
  onClose,
}: TenantSuccessDialogProps) {
  const [copied, setCopied] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);

  const handleCopy = async () => {
    if (!temporaryPassword) return;
    try {
      await navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      toast.success(MESSAGES.TENANTS.PASSWORD_COPIED);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(MESSAGES.TENANTS.PASSWORD_COPY_FAILED);
    }
  };

  return (
    <UIModal
      open={open}
      onOpenChange={() => {}}
      closeOnBackdropClick={false}
      closeOnEscape={false}
      showCloseButton={false}
      title={TITLES.TENANTS.ONBOARD_SUCCESSFUL}
      description="The tenant account has been successfully created. Please record the credentials below."
      size="md"
    >
      <div className="space-y-4 py-3">
        <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg text-amber-800 dark:text-amber-300 text-xs">
          <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1">
            <span className="font-semibold block">Important Notice for Super Admin</span>
            <span>
              The temporary password is only displayed **once** and cannot be retrieved later. 
              Please copy and securely share it with the Primary Administrator.
            </span>
          </div>
        </div>

        <div className="space-y-2 border-y border-zinc-100 dark:border-zinc-800 py-3 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Company Name</span>
            <span className="font-semibold text-zinc-950 dark:text-zinc-50">{tenantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Admin Email</span>
            <span className="font-semibold text-zinc-950 dark:text-zinc-50 font-mono text-xs">{adminEmail}</span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Temporary Password</span>
          <div className="flex gap-2">
            <div className="flex-1">
              <UIInput
                type="password"
                value={temporaryPassword}
                readOnly
                className="font-mono text-xs bg-zinc-50 dark:bg-zinc-900/50"
              />
            </div>
            <UIButton
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              title="Copy Password"
              className="h-9 w-9 p-0 shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
              )}
            </UIButton>
          </div>
        </div>

        <div className="flex items-start gap-2.5 pt-2">
          <input
            type="checkbox"
            id="acknowledge"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-zinc-300 dark:border-zinc-700 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label
            htmlFor="acknowledge"
            className="text-xs text-zinc-600 dark:text-zinc-400 select-none cursor-pointer"
          >
            I have securely copied the temporary password and understand that it will not be shown again.
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <UIButton
            type="button"
            onClick={onClose}
            disabled={!acknowledged}
            className="w-full sm:w-auto"
          >
            Acknowledge & Close
          </UIButton>
        </div>
      </div>
    </UIModal>
  );
}
