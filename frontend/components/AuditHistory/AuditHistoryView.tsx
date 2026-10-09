import React, { useState } from 'react';
import { useFirebase } from '@database/FirebaseContext';
import { AuditRecord } from '../../types';

export const AuditHistoryView: React.FC = () => {
  const { audits } = useFirebase();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredRecords = audits.filter(
    (r) =>
      r.artifact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.signer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyHash = (hash: string, id: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5 max-w-7xl mx-auto w-full">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#262a31] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#7bd0ff] text-2xl">history_edu</span>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#dfe2eb]">Cryptographic Audit & Provenance Trail</h1>
          </div>
          <p className="font-mono text-xs text-[#8b949e] mt-1">
            Immutable SLSA Level 3 attestations, Cosign signatures, and in-toto supply chain integrity logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-[#181c22] border border-[#262a31] rounded-lg px-3 py-1.5 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4edea3]"></span>
            <span className="font-mono text-xs text-[#dfe2eb]">SLSA L3 Strict Gate: <strong className="text-[#4edea3]">ENFORCED</strong></span>
          </div>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#1c2026] p-3.5 rounded-lg border border-[#262a31]">
          <span className="font-mono text-[10px] text-[#8b949e] uppercase">Total Attested Builds</span>
          <div className="text-2xl font-mono font-bold text-[#dfe2eb] mt-1">1,482</div>
          <span className="text-[11px] font-mono text-[#4edea3]">100% Signed with Cosign</span>
        </div>
        <div className="bg-[#1c2026] p-3.5 rounded-lg border border-[#262a31]">
          <span className="font-mono text-[10px] text-[#8b949e] uppercase">Active Signers</span>
          <div className="text-2xl font-mono font-bold text-[#7bd0ff] mt-1">3 KMS Keys</div>
          <span className="text-[11px] font-mono text-[#8b949e]">Google Cloud KMS & Sigstore</span>
        </div>
        <div className="bg-[#1c2026] p-3.5 rounded-lg border border-[#262a31]">
          <span className="font-mono text-[10px] text-[#8b949e] uppercase">Policy Gate Exceptions</span>
          <div className="text-2xl font-mono font-bold text-[#ffb4ab] mt-1">1 Overridden</div>
          <span className="text-[11px] font-mono text-[#ffb4ab]">auth-service (Manual Review)</span>
        </div>
        <div className="bg-[#1c2026] p-3.5 rounded-lg border border-[#262a31]">
          <span className="font-mono text-[10px] text-[#8b949e] uppercase">Compliance Status</span>
          <div className="text-2xl font-mono font-bold text-[#4edea3] mt-1">PASSED</div>
          <span className="text-[11px] font-mono text-[#4edea3]">NIST SP 800-218 SSDF Compliant</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center justify-between gap-3 bg-[#181c22] p-3 rounded-lg border border-[#262a31]">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-2.5 top-2.5 text-[#8b949e] text-sm">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by container artifact, audit ID, or signer identity..."
            className="w-full bg-[#0a0e14] border border-[#262a31] rounded pl-8 pr-3 py-1.5 font-mono text-xs text-[#dfe2eb] focus:outline-none focus:border-[#7bd0ff]"
          />
        </div>
        <div className="text-xs font-mono text-[#8b949e]">
          Showing {filteredRecords.length} records
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#1c2026] rounded-lg border border-[#262a31] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#181c22] text-[#8b949e] border-b border-[#262a31] uppercase text-[10px]">
              <tr>
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Artifact Name</th>
                <th className="py-3 px-4">SLSA Level</th>
                <th className="py-3 px-4">Cosign Verification</th>
                <th className="py-3 px-4">Policy Gate</th>
                <th className="py-3 px-4">Signer Identity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262a31]">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-[#181c22]/60 transition-colors">
                  <td className="py-3 px-4 text-[#7bd0ff] font-semibold">{record.id}</td>
                  <td className="py-3 px-4">
                    <div className="text-[#dfe2eb] font-semibold">{record.artifact}</div>
                    <div className="text-[10px] text-[#8b949e] flex items-center gap-1 mt-0.5">
                      <span>SHA: {record.sha256.substring(0, 16)}...</span>
                      <button
                        onClick={() => handleCopyHash(record.sha256, record.id)}
                        className="text-[#7bd0ff] hover:underline"
                        title="Copy full SHA256"
                      >
                        {copiedId === record.id ? '✓ copied' : 'copy'}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-[#00a6e0]/20 text-[#7bd0ff] font-bold">
                      {record.slsaLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold ${
                        record.cosignStatus === 'VERIFIED'
                          ? 'bg-[#003824] text-[#4edea3]'
                          : record.cosignStatus === 'VALID'
                          ? 'bg-[#181c22] text-[#7bd0ff]'
                          : 'bg-[#93000a]/40 text-[#ffb4ab]'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[13px]">
                        {record.cosignStatus === 'VERIFIED' ? 'verified' : 'gpp_maybe'}
                      </span>
                      {record.cosignStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        record.policyCheck === 'COMPLIANT'
                          ? 'bg-[#003824] text-[#4edea3]'
                          : record.policyCheck === 'OVERRIDDEN'
                          ? 'bg-[#262a31] text-[#ffdad7]'
                          : 'bg-[#93000a] text-[#ffdad6]'
                      }`}
                    >
                      {record.policyCheck}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#8b949e]">{record.signer}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="px-2.5 py-1 rounded bg-[#0a0e14] hover:bg-[#262a31] text-[#7bd0ff] border border-[#7bd0ff]/30 transition-colors"
                    >
                      View in-toto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* In-toto Attestation Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#181c22] border border-[#262a31] rounded-lg max-w-2xl w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#262a31] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#4edea3]">verified</span>
                <span className="font-mono text-sm font-semibold text-[#dfe2eb]">
                  in-toto Attestation: {selectedRecord.id}
                </span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="text-[#8b949e] hover:text-[#dfe2eb]"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#0a0e14] p-3 rounded font-mono text-xs text-[#dfe2eb] max-h-80 overflow-y-auto border border-[#262a31]">
              <pre>{JSON.stringify(
                {
                  _type: 'https://in-toto.io/Statement/v0.1',
                  subject: [
                    {
                      name: selectedRecord.artifact,
                      digest: { sha256: selectedRecord.sha256 },
                    },
                  ],
                  predicateType: 'https://slsa.dev/provenance/v0.2',
                  predicate: {
                    builder: { id: selectedRecord.signer },
                    buildType: 'https://github.com/slsa-framework/slsa-github-generator/delegator-generic@v1',
                    invocation: {
                      configSource: {
                        uri: 'git+https://github.com/octo-org/octo-gateway@refs/heads/main',
                        digest: { sha1: '8f3a91c' },
                        entryPoint: '.github/workflows/provenance.yml',
                      },
                    },
                    materials: [
                      { uri: 'pkg:npm/octo-gateway@1.2.0', digest: { sha256: selectedRecord.sha256 } },
                    ],
                  },
                },
                null,
                2
              )}</pre>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#262a31]">
              <span className="text-[11px] font-mono text-[#8b949e]">
                Cryptographic Signature: Cosign ECDSA P-256 (Valid)
              </span>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded bg-[#262a31] text-[#dfe2eb] hover:bg-[#31353c] font-mono text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
