/**
 * Shared Full-Stack Supply Chain & Security Types
 * Bridges Frontend, Backend API Services, and Cloud Firestore Models
 */

export type NavScreen = 'visualizer' | 'audit-history' | 'scan-history' | 'alerts';

export type GraphLayout = 'radial' | 'hierarchical' | 'force';

export interface GraphNode {
  id: string;
  name: string;
  version?: string;
  type: 'root' | 'transitive' | 'carrier' | 'vulnerable' | 'downstream' | 'clean';
  cve?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
  cvss?: number;
  label?: string;
  sublabel?: string;
  integrity?: string;
  blastServicesExposed?: number;
  x: number;
  y: number;
  hierarchicalX?: number;
  hierarchicalY?: number;
  forceX?: number;
  forceY?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  pathType: 'poison' | 'safe';
  animated?: boolean;
  d: string;
  hierarchicalD?: string;
  forceD?: string;
}

export interface ManifestTarget {
  id: string;
  repository: string;
  filePath: string;
  branch: string;
  commitHash: string;
  syncedAgo: string;
  provenance: string;
  sha256: string;
  sigValid: boolean;
  totalPackages: number;
  directPackages: number;
  transitivePackages: number;
  packageDelta: number;
  vulnerabilities: {
    total: number;
    cvssAvg: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  maxBlastRadius: {
    servicesExposed: number;
    lethalPercent: number;
    level: string;
  };
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TraceHop {
  index: number;
  package: string;
  version?: string;
  location: string;
  type: string;
  badge: string;
  connectorText?: string;
  isCritical?: boolean;
}

export interface AuditRecord {
  id: string;
  timestamp: string;
  artifact: string;
  slsaLevel: 'SLSA L3' | 'SLSA L2' | 'SLSA L1';
  cosignStatus: 'VERIFIED' | 'VALID' | 'WARNING';
  signer: string;
  sha256: string;
  policyCheck: 'COMPLIANT' | 'OVERRIDDEN' | 'FLAGGED';
  attestationUri: string;
  ownerId?: string;
  createdAt?: string;
}

export interface ScanRecord {
  id: string;
  target: string;
  branch: string;
  commit: string;
  scanTime: string;
  duration: string;
  packagesCount: number;
  criticalCount: number;
  highCount: number;
  status: 'CLEAN' | 'VULNERABLE' | 'FIXED';
  remediationStatus: string;
  ownerId?: string;
  createdAt?: string;
}

export interface SecurityAlert {
  id: string;
  cveId: string;
  pkgName: string;
  currentVersion: string;
  fixedVersion: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  cvss: number;
  summary: string;
  blastServices: number;
  repo: string;
  firstDetected: string;
  slaRemaining: string;
  status: 'ACTIVE' | 'PATCH_PENDING' | 'RESOLVED' | 'TRIAGED' | 'DISMISSED';
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
