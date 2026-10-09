import React, { useState, useEffect } from 'react';

interface VerificationScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAuditHistory: () => void;
  auditId: string;
}

export const VerificationScanModal: React.FC<VerificationScanModalProps> = ({
  isOpen,
  onClose,
  onViewAuditHistory,
  auditId,
}) => {
  const [step, setStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const verificationStages = [
    'Parsing updated lockfile AST for express-fileupload@1.5.0...',
    'Auditing boundary parser against prototype pollution vector (CVE-2024-21907)...',
    'Simulating injection payload on Object.prototype boundary...',
    'Testing call-graph reachability across 14 downstream microservices...',
    'Synthesizing fresh SBOM cryptographic delta & provenance attestation...',
  ];

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setIsCompleted(false);
      return;
    }

    setStep(0);
    setIsCompleted(false);

    const interval = setInterval(() => {
      setStep((prev) => {
        if (prev >= verificationStages.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            setIsCompleted(true);
          }, 350);
          return prev;
        }
        return prev + 1;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const progressPercent = Math.min(100, Math.round(((step + 1) / verificationStages.length) * 100));

  return (
    <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-[#181c22] border border-[#262a31] rounded-xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#4edea3]/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-xl ${
                isCompleted ? 'text-[#4edea3]' : 'text-[#7bd0ff] animate-spin'
              }`}
            >
              {isCompleted ? 'verified_user' : 'radar'}
            </span>
            <h2 className="text-base sm:text-lg font-semibold text-[#dfe2eb] tracking-tight">
              Post-Remediation Cross-Verification Engine
            </h2>
          </div>
          {isCompleted && (
            <button onClick={onClose} className="text-[#8b949e] hover:text-[#dfe2eb] p-1 cursor-pointer">
              ✕
            </button>
          )}
        </div>

        {/* STAGE 1: SCANNING ANIMATION */}
        {!isCompleted ? (
          <div className="flex flex-col items-center justify-center py-6 gap-5">
            {/* Radar scanner visualization */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#7bd0ff]/20 animate-ping opacity-60"></div>
              <div className="absolute inset-2 rounded-full border border-[#4edea3]/40 animate-pulse"></div>
              <div className="w-14 h-14 rounded-full bg-[#0a0e14] border border-[#7bd0ff] flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.4)]">
                <span className="material-symbols-outlined text-2xl text-[#7bd0ff] animate-spin">
                  sync
                </span>
              </div>
            </div>

            <div className="text-center flex flex-col gap-1 w-full max-w-md">
              <div className="font-mono text-xs uppercase tracking-wider text-[#7bd0ff] font-semibold">
                VERIFICATION SCAN IN PROGRESS • {progressPercent}%
              </div>
              <div className="font-mono text-xs text-[#dfe2eb] h-8 flex items-center justify-center text-center">
                {verificationStages[step]}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#0a0e14] h-2 rounded-full overflow-hidden border border-[#262a31]">
              <div
                className="bg-gradient-to-r from-[#00a6e0] to-[#4edea3] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between w-full font-mono text-[10px] text-[#8b949e]">
              <span>Manifest: octo-gateway / package-lock.json</span>
              <span>Patch: express-fileupload@1.5.0</span>
            </div>
          </div>
        ) : (
          /* STAGE 2: VERIFICATION PASSED SUCCESS MODULE */
          <div className="flex flex-col gap-4 py-1">
            {/* Success Banner */}
            <div className="flex items-center gap-3 bg-[#003824]/40 border border-[#4edea3]/40 p-3.5 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-[#003824] border border-[#4edea3] flex items-center justify-center text-[#4edea3] shrink-0 shadow-[0_0_12px_rgba(78,222,163,0.4)]">
                <span className="material-symbols-outlined text-2xl">check_circle</span>
              </div>
              <div>
                <div className="text-sm font-bold text-[#4edea3] font-mono tracking-wide uppercase">
                  VERIFICATION PASSED: SUPPLY CHAIN SECURED
                </div>
                <div className="text-xs text-[#dfe2eb]">
                  Automated static analysis confirms complete exploit neutralization in <code className="text-[#7bd0ff]">octo-gateway / package-lock.json</code>.
                </div>
              </div>
            </div>

            {/* Three Visual Confirmation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Pillar 1: CVE Eliminated */}
              <div className="bg-[#0a0e14] p-3 rounded-lg border border-[#4edea3]/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#8b949e] uppercase font-bold">CVE ELIMINATED</span>
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                </div>
                <div className="font-mono text-xs font-bold text-[#4edea3]">
                  CVE-2024-21907
                </div>
                <div className="font-mono text-[10px] text-[#8b949e] leading-snug">
                  9.8 RCE prototype pollution neutralized in express-fileupload@1.5.0
                </div>
              </div>

              {/* Pillar 2: Blast Radius Reduced to 0 */}
              <div className="bg-[#0a0e14] p-3 rounded-lg border border-[#4edea3]/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#8b949e] uppercase font-bold">BLAST RADIUS</span>
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                </div>
                <div className="font-mono text-xs font-bold text-[#4edea3]">
                  0 Services Exposed
                </div>
                <div className="font-mono text-[10px] text-[#8b949e] leading-snug">
                  All 14 microservices isolated and fully safeguarded
                </div>
              </div>

              {/* Pillar 3: Dependency Tree Clean */}
              <div className="bg-[#0a0e14] p-3 rounded-lg border border-[#4edea3]/30 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#8b949e] uppercase font-bold">DEPENDENCY TREE</span>
                  <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
                </div>
                <div className="font-mono text-xs font-bold text-[#4edea3]">
                  100% Clean
                </div>
                <div className="font-mono text-[10px] text-[#8b949e] leading-snug">
                  0 breaking changes, verified transitives & carrier integrity
                </div>
              </div>
            </div>

            {/* Audit Trail Notification Strip */}
            <div className="bg-[#1c2026] p-3 rounded-lg border border-[#262a31] flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#7bd0ff] text-base">history_edu</span>
                <span className="text-[#8b949e]">Logged to Audit Trail:</span>
                <span className="text-[#7bd0ff] font-semibold">{auditId}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-[#003824] text-[#4edea3] text-[10px] font-bold">
                SLSA L3 VERIFIED
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#262a31]">
              <button
                onClick={onViewAuditHistory}
                className="px-3.5 py-1.5 rounded bg-[#1c2026] hover:bg-[#262a31] text-[#7bd0ff] font-mono text-xs border border-[#7bd0ff]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">history</span>
                <span>View Audit History</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-1.5 rounded bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-mono text-xs font-bold transition-all shadow-[0_0_12px_rgba(78,222,163,0.35)] flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">task_alt</span>
                <span>Acknowledge & Return to Visualizer</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
