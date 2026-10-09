/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavScreen, ManifestTarget, GraphNode, GraphEdge, TraceHop, SecurityAlert, ScanRecord } from './types';
import {
  INITIAL_GRAPH_NODES,
  INITIAL_GRAPH_EDGES,
  INITIAL_TRACE_HOPS,
} from './data/mockData';
import { FirebaseProvider, useFirebase } from '@database/FirebaseContext';
import { Navigation } from './components/Navigation';
import { VisualizerView } from './components/Visualizer/VisualizerView';
import { AuditHistoryView } from './components/AuditHistory/AuditHistoryView';
import { ScanHistoryView } from './components/ScanHistory/ScanHistoryView';
import { AlertsView } from './components/Alerts/AlertsView';
import { ScanManifestModal } from './components/Modals/ScanManifestModal';
import { GeneratePrModal } from './components/Modals/GeneratePrModal';
import { ExportSbomModal } from './components/Modals/ExportSbomModal';
import { VerificationScanModal } from './components/Modals/VerificationScanModal';

function ChainSightApp() {
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('visualizer');
  const {
    manifest,
    updateManifest,
    scans,
    addScanRecord,
    alerts,
    resolveAlert,
    dismissAlert,
    addAuditRecord,
  } = useFirebase();

  const [nodes, setNodes] = useState<GraphNode[]>(INITIAL_GRAPH_NODES);
  const [edges, setEdges] = useState<GraphEdge[]>(INITIAL_GRAPH_EDGES);
  const [hops, setHops] = useState<TraceHop[]>(INITIAL_TRACE_HOPS);
  const [transitiveDepth, setTransitiveDepth] = useState<number>(3);
  const [severityFilters, setSeverityFilters] = useState({
    critical: true,
    high: true,
    moderate: false,
    low: false,
  });
  const [isolatePoisonedPath, setIsolatePoisonedPath] = useState<boolean>(true);
  const [selectedNodeId, setSelectedNodeId] = useState<string>('focalVulnerableNode');
  const [isSimulatedPatched, setIsSimulatedPatched] = useState<boolean>(false);

  // Modals state
  const [scanModalOpen, setScanModalOpen] = useState<boolean>(false);
  const [scanModalRepoMode, setScanModalRepoMode] = useState<boolean>(false);
  const [prModalOpen, setPrModalOpen] = useState<boolean>(false);
  const [sbomModalOpen, setSbomModalOpen] = useState<boolean>(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState<boolean>(false);
  const [currentVerificationAuditId, setCurrentVerificationAuditId] = useState<string>('AUD-9022');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Severity toggle handler
  const handleToggleSeverity = (severity: 'critical' | 'high' | 'moderate' | 'low') => {
    setSeverityFilters((prev) => ({
      ...prev,
      [severity]: !prev[severity],
    }));
  };

  // Cross-verification engine trigger
  const triggerCrossVerification = async () => {
    const newAuditId = `AUD-${Math.floor(9020 + Math.random() * 70)}`;
    setCurrentVerificationAuditId(newAuditId);
    setIsSimulatedPatched(true);
    setVerificationModalOpen(true);

    await resolveAlert('ALT-401');

    // Automatically log this cross-verification event into the Audit History
    const verificationAuditRecord = {
      id: newAuditId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      artifact: 'octo-gateway-container:sha256-1.5.0-verified',
      slsaLevel: 'SLSA L3' as const,
      cosignStatus: 'VERIFIED' as const,
      signer: 'chainsight-cross-verifier@internal',
      sha256: '9a4e3fc81928318182931a72182b819283181821818293b984b11f90ca1823bc',
      policyCheck: 'COMPLIANT' as const,
      attestationUri: `https://chainsight.internal/attestations/${newAuditId}-cross-verification.intoto.jsonl`,
    };
    await addAuditRecord(verificationAuditRecord);
  };

  // Simulate patch toggle
  const handleSimulatePatch = async () => {
    if (!isSimulatedPatched) {
      await triggerCrossVerification();
    } else {
      setIsSimulatedPatched(false);
    }
  };

  // PR created callback
  const handlePrCreated = async () => {
    setPrModalOpen(false);
    await triggerCrossVerification();
  };

  // Open scan modal
  const handleOpenScanModal = (isRepoMode = false) => {
    setScanModalRepoMode(isRepoMode);
    setScanModalOpen(true);
  };

  // Scan completion
  const handleScanComplete = async (newManifest: ManifestTarget) => {
    await updateManifest(newManifest);
    await addScanRecord({
      id: `SCN-${Math.floor(1000 + Math.random() * 9000)}`,
      target: `${newManifest.repository} / ${newManifest.filePath}`,
      branch: newManifest.branch,
      commit: newManifest.commitHash,
      scanTime: 'Just now',
      duration: '1.24s',
      packagesCount: newManifest.totalPackages,
      criticalCount: newManifest.vulnerabilities.critical,
      highCount: newManifest.vulnerabilities.high,
      status: newManifest.vulnerabilities.total > 0 ? 'VULNERABLE' : 'CLEAN',
      remediationStatus: 'Analyzed & Indexed',
    });
    setIsSimulatedPatched(false);
    setSelectedNodeId('focalVulnerableNode');
    setCurrentScreen('visualizer');
  };

  // Navigate to visualizer from alert
  const handleInvestigateAlert = (_alert: SecurityAlert) => {
    setCurrentScreen('visualizer');
    setSelectedNodeId('focalVulnerableNode');
  };

  // Navigate to visualizer from historical scan
  const handleLoadScanToVisualizer = (_scan: ScanRecord) => {
    setCurrentScreen('visualizer');
    setSelectedNodeId('focalVulnerableNode');
  };

  const activeAlertCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <div className="min-h-screen bg-[#10141a] text-[#dfe2eb]">
      {/* SIDEBAR & TOP HEADER NAVIGATION */}
      <Navigation
        currentScreen={currentScreen}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onOpenScanModal={() => handleOpenScanModal(false)}
        alertCount={isSimulatedPatched ? Math.max(0, activeAlertCount - 1) : activeAlertCount}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((prev) => !prev)}
      />

      {/* MAIN CONTENT AREA */}
      <div className="md:pl-64 pt-16 min-h-screen bg-[#0a0e14]">
        {currentScreen === 'visualizer' && (
          <VisualizerView
            manifest={manifest}
            nodes={nodes}
            edges={edges}
            hops={hops}
            transitiveDepth={transitiveDepth}
            onDepthChange={setTransitiveDepth}
            severityFilters={severityFilters}
            onToggleSeverity={handleToggleSeverity}
            isolatePoisonedPath={isolatePoisonedPath}
            onToggleIsolatePath={setIsolatePoisonedPath}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
            onOpenScanModal={() => handleOpenScanModal(false)}
            onOpenRepoUrlModal={() => handleOpenScanModal(true)}
            onOpenPrModal={() => setPrModalOpen(true)}
            onOpenSbomModal={() => setSbomModalOpen(true)}
            onSimulatePatch={handleSimulatePatch}
            isSimulatedPatched={isSimulatedPatched}
          />
        )}

        {currentScreen === 'audit-history' && <AuditHistoryView />}

        {currentScreen === 'scan-history' && (
          <ScanHistoryView onLoadScanToVisualizer={handleLoadScanToVisualizer} />
        )}

        {currentScreen === 'alerts' && (
          <AlertsView
            onInvestigateAlert={handleInvestigateAlert}
            onOpenPrModalForAlert={() => setPrModalOpen(true)}
          />
        )}
      </div>

      {/* SCAN MANIFEST MODAL */}
      <ScanManifestModal
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onScanComplete={handleScanComplete}
        initialRepoUrlMode={scanModalRepoMode}
      />

      {/* GENERATE PR MODAL */}
      <GeneratePrModal
        isOpen={prModalOpen}
        onClose={() => setPrModalOpen(false)}
        onPrCreated={handlePrCreated}
      />

      {/* EXPORT SBOM MODAL */}
      <ExportSbomModal
        isOpen={sbomModalOpen}
        onClose={() => setSbomModalOpen(false)}
        manifest={manifest}
      />

      {/* POST-REMEDIATION CROSS-VERIFICATION MODAL */}
      <VerificationScanModal
        isOpen={verificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        onViewAuditHistory={() => {
          setVerificationModalOpen(false);
          setCurrentScreen('audit-history');
        }}
        auditId={currentVerificationAuditId}
      />
    </div>
  );
}

export default function App() {
  return (
    <FirebaseProvider>
      <ChainSightApp />
    </FirebaseProvider>
  );
}
