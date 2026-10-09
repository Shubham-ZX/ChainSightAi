import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
} from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOut, testConnection } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { ManifestTarget, ScanRecord, SecurityAlert, AuditRecord } from '../backend/types';

const INITIAL_MANIFEST_DATA: ManifestTarget = {
  id: 'octo-gateway-npm',
  repository: 'octo-gateway',
  filePath: 'package-lock.json',
  branch: 'main',
  commitHash: '8f3a91c',
  syncedAgo: '4m AGO',
  provenance: 'Verified Build Provenance',
  sha256: '7e2d9...3b98',
  sigValid: true,
  totalPackages: 486,
  directPackages: 312,
  transitivePackages: 174,
  packageDelta: 14,
  vulnerabilities: {
    total: 18,
    cvssAvg: 8.4,
    critical: 4,
    high: 9,
    medium: 5,
    low: 0,
  },
  maxBlastRadius: {
    servicesExposed: 14,
    lethalPercent: 82,
    level: 'High Exploit Propagation',
  },
};

const INITIAL_SCAN_RECORDS: ScanRecord[] = [
  {
    id: 'SCN-1099',
    target: 'octo-gateway / package-lock.json',
    branch: 'main',
    commit: '8f3a91c',
    scanTime: '4m ago (10:48 AM)',
    duration: '1.42s',
    packagesCount: 486,
    criticalCount: 4,
    highCount: 9,
    status: 'VULNERABLE',
    remediationStatus: 'Fix PR Ready (+1.5.0)',
  },
  {
    id: 'SCN-1098',
    target: 'octo-gateway / package-lock.json',
    branch: 'staging',
    commit: '7b20e11',
    scanTime: '2 hours ago',
    duration: '1.38s',
    packagesCount: 472,
    criticalCount: 3,
    highCount: 7,
    status: 'VULNERABLE',
    remediationStatus: 'Triage In Progress',
  },
  {
    id: 'SCN-1097',
    target: 'billing-worker / Cargo.lock',
    branch: 'main',
    commit: '3f92a10',
    scanTime: '5 hours ago',
    duration: '2.10s',
    packagesCount: 318,
    criticalCount: 0,
    highCount: 1,
    status: 'CLEAN',
    remediationStatus: 'Within SLA Threshold',
  },
  {
    id: 'SCN-1096',
    target: 'auth-service / requirements.txt',
    branch: 'main',
    commit: '99e41b2',
    scanTime: 'Yesterday at 16:30',
    duration: '0.85s',
    packagesCount: 194,
    criticalCount: 1,
    highCount: 3,
    status: 'VULNERABLE',
    remediationStatus: 'Dependabot Queued',
  },
  {
    id: 'SCN-1095',
    target: 'telemetry-consumer / go.mod',
    branch: 'main',
    commit: '1a88df4',
    scanTime: '2 days ago',
    duration: '0.94s',
    packagesCount: 162,
    criticalCount: 0,
    highCount: 0,
    status: 'CLEAN',
    remediationStatus: 'Policy Compliant',
  },
];

const INITIAL_SECURITY_ALERTS: SecurityAlert[] = [
  {
    id: 'ALT-401',
    cveId: 'CVE-2024-21907',
    pkgName: 'express-fileupload',
    currentVersion: '1.4.0',
    fixedVersion: '1.5.0',
    severity: 'CRITICAL',
    cvss: 9.8,
    summary: 'Prototype Pollution leading to unauthenticated Remote Code Execution (RCE) via nested object keys.',
    blastServices: 14,
    repo: 'octo-gateway',
    firstDetected: 'Today 10:44 AM',
    slaRemaining: '3h 15m (P0 Breach Risk)',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-402',
    cveId: 'CVE-2024-3094',
    pkgName: 'xz-embedded',
    currentVersion: '5.6.0',
    fixedVersion: '5.6.1',
    severity: 'CRITICAL',
    cvss: 10.0,
    summary: 'Malicious backdoor injection in tarball build stream capable of intercepting sshd open-session crypto.',
    blastServices: 6,
    repo: 'infra-agent',
    firstDetected: 'Yesterday 14:10 PM',
    slaRemaining: '5h 40m',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-403',
    cveId: 'CVE-2024-28849',
    pkgName: 'follow-redirects',
    currentVersion: '1.15.4',
    fixedVersion: '1.15.6',
    severity: 'HIGH',
    cvss: 7.5,
    summary: 'Authorization header leakage during cross-domain redirects leading to bearer token theft.',
    blastServices: 8,
    repo: 'octo-gateway',
    firstDetected: '2 days ago',
    slaRemaining: '18h 20m',
    status: 'ACTIVE',
  },
  {
    id: 'ALT-404',
    cveId: 'CVE-2024-29041',
    pkgName: 'ip-regex',
    currentVersion: '4.3.0',
    fixedVersion: '5.0.0',
    severity: 'MEDIUM',
    cvss: 6.2,
    summary: 'Catastrophic regular expression backtracking (ReDoS) against crafted IPv6 bracket strings.',
    blastServices: 4,
    repo: 'telemetry-consumer',
    firstDetected: '3 days ago',
    slaRemaining: '42h 00m',
    status: 'ACTIVE',
  },
];

const INITIAL_AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'AUD-9021',
    timestamp: '2026-10-09 09:48:12 UTC',
    artifact: 'octo-gateway-container:sha256-7e2d93b98',
    slsaLevel: 'SLSA L3',
    cosignStatus: 'VERIFIED',
    signer: 'github-actions[bot]@google-cloud-kms',
    sha256: '7e2d98c1998319a41031bdf7218318182931a72182b819283181821818293b98',
    policyCheck: 'COMPLIANT',
    attestationUri: 'https://chainsight.internal/attestations/7e2d93b98.intoto.jsonl',
  },
  {
    id: 'AUD-8842',
    timestamp: '2026-10-09 08:30:00 UTC',
    artifact: 'billing-worker:sha256-4b11f90c',
    slsaLevel: 'SLSA L3',
    cosignStatus: 'VERIFIED',
    signer: 'cosign-oidc@sigstore.dev',
    sha256: '4b11f90ca1823bc891048bce912389a01948194b192838184918238128384911',
    policyCheck: 'COMPLIANT',
    attestationUri: 'https://chainsight.internal/attestations/4b11f90c.intoto.jsonl',
  },
  {
    id: 'AUD-8790',
    timestamp: '2026-10-09 07:12:44 UTC',
    artifact: 'auth-service:sha256-2918ca12',
    slsaLevel: 'SLSA L2',
    cosignStatus: 'VALID',
    signer: 'vault-transit@auth0-internal',
    sha256: '2918ca12491b92c8192a83918a93819283019283019283019283019283019283',
    policyCheck: 'OVERRIDDEN',
    attestationUri: 'https://chainsight.internal/attestations/2918ca12.intoto.jsonl',
  },
  {
    id: 'AUD-8655',
    timestamp: '2026-10-08 23:45:10 UTC',
    artifact: 'ingestion-pipeline:sha256-fa919283',
    slsaLevel: 'SLSA L3',
    cosignStatus: 'VERIFIED',
    signer: 'github-actions[bot]@google-cloud-kms',
    sha256: 'fa919283192a83918a9381928301928301928301928301928301928301928301',
    policyCheck: 'COMPLIANT',
    attestationUri: 'https://chainsight.internal/attestations/fa919283.intoto.jsonl',
  },
  {
    id: 'AUD-8512',
    timestamp: '2026-10-08 19:15:02 UTC',
    artifact: 'admin-portal-backend:sha256-55c9183b',
    slsaLevel: 'SLSA L3',
    cosignStatus: 'WARNING',
    signer: 'cosign-oidc@sigstore.dev',
    sha256: '55c9183b819283198a9381928301928301928301928301928301928301928301',
    policyCheck: 'FLAGGED',
    attestationUri: 'https://chainsight.internal/attestations/55c9183b.intoto.jsonl',
  },
];

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOutUser: () => Promise<void>;
  manifest: ManifestTarget;
  updateManifest: (manifest: ManifestTarget) => Promise<void>;
  scans: ScanRecord[];
  addScanRecord: (scan: ScanRecord) => Promise<void>;
  alerts: SecurityAlert[];
  dismissAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  audits: AuditRecord[];
  addAuditRecord: (audit: AuditRecord) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // App data states (with Firestore real-time sync when authenticated)
  const [manifest, setManifest] = useState<ManifestTarget>(INITIAL_MANIFEST_DATA);
  const [scans, setScans] = useState<ScanRecord[]>(INITIAL_SCAN_RECORDS);
  const [alerts, setAlerts] = useState<SecurityAlert[]>(INITIAL_SECURITY_ALERTS);
  const [audits, setAudits] = useState<AuditRecord[]>(INITIAL_AUDIT_RECORDS);

  useEffect(() => {
    // 1. Validate connection on boot
    testConnection();

    // 2. Auth listener
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  // Sync with Firestore when user is authenticated
  useEffect(() => {
    if (!user) {
      return;
    }

    // A. Listen to Manifests
    const manifestPath = 'manifests';
    const unsubManifest = onSnapshot(
      collection(db, manifestPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as unknown as ManifestTarget;
          setManifest((prev) => ({
            ...prev,
            ...docData,
          }));
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, manifestPath);
      }
    );

    // B. Listen to Scans
    const scansPath = 'scans';
    const scansQuery = query(collection(db, scansPath), orderBy('createdAt', 'desc'));
    const unsubScans = onSnapshot(
      scansQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedScans = snapshot.docs.map((d) => d.data() as ScanRecord);
          setScans(loadedScans);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, scansPath);
      }
    );

    // C. Listen to Alerts
    const alertsPath = 'alerts';
    const unsubAlerts = onSnapshot(
      collection(db, alertsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedAlerts = snapshot.docs.map((d) => d.data() as SecurityAlert);
          setAlerts(loadedAlerts);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, alertsPath);
      }
    );

    // D. Listen to Audits
    const auditsPath = 'audits';
    const unsubAudits = onSnapshot(
      collection(db, auditsPath),
      (snapshot) => {
        if (!snapshot.empty) {
          const loadedAudits = snapshot.docs.map((d) => d.data() as AuditRecord);
          setAudits(loadedAudits);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, auditsPath);
      }
    );

    return () => {
      unsubManifest();
      unsubScans();
      unsubAlerts();
      unsubAudits();
    };
  }, [user]);

  const updateManifest = async (newManifest: ManifestTarget) => {
    setManifest(newManifest);
    if (!user) return;

    const path = `manifests/${newManifest.id}`;
    try {
      await setDoc(doc(db, 'manifests', newManifest.id), {
        ...newManifest,
        ownerId: user.uid,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const addScanRecord = async (scan: ScanRecord) => {
    setScans((prev) => [scan, ...prev]);
    if (!user) return;

    const path = `scans/${scan.id}`;
    try {
      await setDoc(doc(db, 'scans', scan.id), {
        ...scan,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const dismissAlert = async (alertId: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    if (!user) return;

    const path = `alerts/${alertId}`;
    try {
      await deleteDoc(doc(db, 'alerts', alertId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const resolveAlert = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'RESOLVED' } : a))
    );
    if (!user) return;

    const path = `alerts/${alertId}`;
    try {
      await setDoc(
        doc(db, 'alerts', alertId),
        { status: 'RESOLVED', updatedAt: new Date().toISOString() },
        { merge: true }
      );
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const addAuditRecord = async (audit: AuditRecord) => {
    setAudits((prev) => [audit, ...prev]);
    if (!user) return;

    const path = `audits/${audit.id}`;
    try {
      await setDoc(doc(db, 'audits', audit.id), {
        ...audit,
        ownerId: user.uid,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        loading,
        signIn: handleSignIn,
        signOutUser: handleSignOut,
        manifest,
        updateManifest,
        scans,
        addScanRecord,
        alerts,
        dismissAlert,
        resolveAlert,
        audits,
        addAuditRecord,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
