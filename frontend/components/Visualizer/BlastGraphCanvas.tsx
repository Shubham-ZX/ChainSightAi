import React, { useState, useRef, useMemo } from 'react';
import { GraphNode, GraphEdge, GraphLayout } from '../../types';

interface BlastGraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isolatePoisonedPath: boolean;
  transitiveDepth: number;
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  onFocusChain: () => void;
  onOpenPrModal: () => void;
  isSimulatedPatched: boolean;
}

export const BlastGraphCanvas: React.FC<BlastGraphCanvasProps> = ({
  nodes,
  edges,
  isolatePoisonedPath,
  transitiveDepth,
  selectedNodeId,
  onSelectNode,
  onFocusChain,
  onOpenPrModal,
  isSimulatedPatched,
}) => {
  const [layoutMode, setLayoutMode] = useState<GraphLayout>('radial');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Layout node coordinates
  const resolvedNodes = useMemo(() => {
    return nodes.map((node) => {
      let x = node.x;
      let y = node.y;

      if (layoutMode === 'hierarchical') {
        x = node.hierarchicalX ?? node.x;
        y = node.hierarchicalY ?? node.y;
      } else if (layoutMode === 'force') {
        x = node.forceX ?? node.x;
        y = node.forceY ?? node.y;
      }

      return { ...node, renderX: x, renderY: y };
    });
  }, [nodes, layoutMode]);

  // Layout edge paths
  const resolvedEdges = useMemo(() => {
    return edges.map((edge) => {
      let d = edge.d;
      if (layoutMode === 'hierarchical' && edge.hierarchicalD) {
        d = edge.hierarchicalD;
      } else if (layoutMode === 'force' && edge.forceD) {
        d = edge.forceD;
      }
      return { ...edge, renderD: d };
    });
  }, [edges, layoutMode]);

  // Find currently selected node for HUD
  const selectedNode = useMemo(() => {
    return resolvedNodes.find((n) => n.id === selectedNodeId) || resolvedNodes.find((n) => n.id === 'focalVulnerableNode');
  }, [resolvedNodes, selectedNodeId]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // left click only
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoomLevel((prev) => Math.min(Math.max(prev * zoomFactor, 0.6), 2.2));
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.15, 2.2));
  };

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.15, 0.6));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  };

  // Node search match
  const isMatchSearch = (node: GraphNode) => {
    if (!searchQuery.trim()) return false;
    const q = searchQuery.toLowerCase().trim();
    return (
      node.name.toLowerCase().includes(q) ||
      (node.cve && node.cve.toLowerCase().includes(q)) ||
      (node.version && node.version.toLowerCase().includes(q))
    );
  };

  // Depth filtering for nodes
  const isNodeWithinDepth = (node: GraphNode) => {
    if (node.type === 'clean') {
      if (transitiveDepth < 2 && node.id.includes('parser') === false && node.id.includes('ioredis') === false) {
        return false;
      }
    }
    return true;
  };

  return (
    <div className="relative w-full h-[620px] bg-[#0a0e14] rounded-lg overflow-hidden shadow-lg flex flex-col border border-[#262a31]">
      {/* HUD Canvas Overlay Header / Toolbar */}
      <div className="absolute top-0 left-0 right-0 z-20 p-3.5 flex flex-wrap items-center justify-between gap-2.5 bg-gradient-to-b from-[#0a0e14]/95 via-[#0a0e14]/75 to-transparent backdrop-blur-sm pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#181c22] px-3 py-1.5 rounded shadow-sm border border-[#262a31]">
            <span
              className={`material-symbols-outlined text-base ${
                isSimulatedPatched ? 'text-[#4edea3]' : 'text-[#ff5451]'
              }`}
            >
              bubble_chart
            </span>
            <span className="font-mono text-[11px] font-semibold text-[#dfe2eb] tracking-wide uppercase">
              PROPAGATION BLAST RADIUS GRAPH
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 font-mono text-[10px] bg-[#262a31] px-2 py-1 rounded text-[#7bd0ff] border border-[#7bd0ff]/20">
            <span>MODE: {isSimulatedPatched ? 'SIMULATED SAFEGUARD' : 'EXPLOIT CASCADE'}</span>
          </div>
        </div>

        {/* Controls: Search, View Mode & Zoom */}
        <div className="flex items-center gap-2">
          {/* Search within graph */}
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2 text-[#8b949e] text-base pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search package or CVE-2024-..."
              className="bg-[#181c22] text-[#dfe2eb] pl-8 pr-3 py-1.5 rounded font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-[#7bd0ff] w-44 sm:w-60 placeholder:text-[#8b949e] border border-[#262a31]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 text-[#8b949e] hover:text-[#dfe2eb] text-xs font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* View Modes */}
          <div className="hidden sm:flex items-center bg-[#181c22] p-0.5 rounded border border-[#262a31]">
            <button
              onClick={() => setLayoutMode('radial')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'radial'
                  ? 'bg-[#262a31] text-[#7bd0ff] font-medium'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Radial Blast
            </button>
            <button
              onClick={() => setLayoutMode('hierarchical')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'hierarchical'
                  ? 'bg-[#262a31] text-[#7bd0ff] font-medium'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Hierarchical
            </button>
            <button
              onClick={() => setLayoutMode('force')}
              className={`px-2.5 py-1 rounded font-mono text-[11px] transition-colors cursor-pointer ${
                layoutMode === 'force'
                  ? 'bg-[#262a31] text-[#7bd0ff] font-medium'
                  : 'text-[#8b949e] hover:text-[#dfe2eb]'
              }`}
            >
              Force Directed
            </button>
          </div>

          {/* Zoom actions */}
          <div className="flex items-center bg-[#181c22] rounded border border-[#262a31]">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-[#8b949e] hover:text-[#dfe2eb] transition-colors cursor-pointer"
              title="Zoom in"
            >
              <span className="material-symbols-outlined text-base">add</span>
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-[#8b949e] hover:text-[#dfe2eb] transition-colors cursor-pointer"
              title="Zoom out"
            >
              <span className="material-symbols-outlined text-base">remove</span>
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 text-[#8b949e] hover:text-[#dfe2eb] transition-colors cursor-pointer"
              title="Center & Reset"
            >
              <span className="material-symbols-outlined text-base">fit_screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Vector Graphic / Blast Radius Topology */}
      <div
        className="relative w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Background Grid Overlay */}
        <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38BDF8_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <svg
          ref={svgRef}
          className="w-full h-full select-none"
          viewBox="0 0 1000 600"
          preserveAspectRatio="xMidYMid meet"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
        >
          <defs>
            {/* Glowing Filters */}
            <filter id="glow-crimson" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.8" />
            </filter>
            <filter id="glow-cyan" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38BDF8" floodOpacity="0.7" />
            </filter>
            <filter id="glow-tertiary" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#10B981" floodOpacity="0.7" />
            </filter>

            {/* Arrow Markers */}
            <marker
              id="arrow-crimson"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#EF4444" />
            </marker>
            <marker
              id="arrow-cyan"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38BDF8" />
            </marker>
            <marker
              id="arrow-emerald"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#10B981" />
            </marker>
            <marker
              id="arrow-dim"
              viewBox="0 0 10 10"
              refX="22"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#31353C" />
            </marker>
          </defs>

          {/* CONNECTIONS / EDGES LAYER */}
          <g id="edgesGroup">
            {resolvedEdges.map((edge) => {
              const isPoison = edge.pathType === 'poison';
              const isSafeEdge = edge.pathType === 'safe';

              // If simulated patched, turn poison edges into emerald safe edges
              const strokeColor = isSimulatedPatched
                ? '#4edea3'
                : isPoison
                ? '#ff5451'
                : '#31353C';

              const markerEnd = isSimulatedPatched
                ? 'url(#arrow-emerald)'
                : isPoison
                ? 'url(#arrow-crimson)'
                : undefined;

              const opacityClass = isSafeEdge && isolatePoisonedPath
                ? 'opacity-15'
                : isSafeEdge
                ? 'opacity-40 hover:opacity-100'
                : 'opacity-100';

              const strokeWidth = isPoison ? 2.5 : 1.5;
              const strokeDasharray = isPoison ? (isSimulatedPatched ? 'none' : '6,4') : 'none';

              return (
                <path
                  key={edge.id}
                  d={edge.renderD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  markerEnd={markerEnd}
                  className={`transition-all duration-300 ${opacityClass}`}
                >
                  {edge.animated && !isSimulatedPatched && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="40"
                      to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>
              );
            })}
          </g>

          {/* NODES LAYER */}
          <g id="nodesGroup">
            {resolvedNodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isFocal = node.id === 'focalVulnerableNode';
              const isRoot = node.id === 'rootNode';
              const isClean = node.type === 'clean';
              const isDownstream = node.type === 'downstream';
              const isHighlighted = isMatchSearch(node);
              const withinDepth = isNodeWithinDepth(node);

              const dimSafe = isClean && isolatePoisonedPath;
              const opacity = !withinDepth
                ? 0.15
                : dimSafe
                ? 0.25
                : 1;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.renderX}, ${node.renderY})`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectNode(node.id);
                  }}
                  className="cursor-pointer transition-transform duration-200 hover:scale-110"
                  style={{ opacity, transition: 'opacity 0.3s ease, transform 0.2s ease' }}
                >
                  {/* Root Node Octo-gateway */}
                  {isRoot && (
                    <>
                      <circle
                        r={26}
                        fill="#10141A"
                        stroke="#7BD0FF"
                        strokeWidth="2.5"
                        filter="url(#glow-cyan)"
                      />
                      <circle r={12} fill="#00A6E0" />
                      <text
                        x="0"
                        y="-36"
                        textAnchor="middle"
                        fill="#DFE2EB"
                        fontFamily="JetBrains Mono"
                        fontSize="13"
                        fontWeight="600"
                      >
                        {node.name}
                      </text>
                      <text
                        x="0"
                        y="-22"
                        textAnchor="middle"
                        fill="#7BD0FF"
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                      >
                        {node.label || '[ROOT MANIFEST]'}
                      </text>
                    </>
                  )}

                  {/* Clean Nodes */}
                  {isClean && (
                    <>
                      <circle
                        r={node.integrity ? 14 : 10}
                        fill="#1C2026"
                        stroke="#4EDEA3"
                        strokeWidth={node.integrity ? 2 : 1.5}
                        filter={node.integrity ? 'url(#glow-tertiary)' : undefined}
                      />
                      <circle r={node.integrity ? 5 : 4} fill="#4EDEA3" />
                      <text
                        x={node.integrity ? 0 : 18}
                        y={node.integrity ? (node.integrity.includes('100%') ? -20 : 28) : 4}
                        textAnchor={node.integrity ? 'middle' : 'start'}
                        fill="#DFE2EB"
                        fontFamily="JetBrains Mono"
                        fontSize={node.integrity ? '11' : '10'}
                        fontWeight="500"
                      >
                        {node.name}@{node.version}
                      </text>
                      {node.integrity && (
                        <text
                          x="0"
                          y={node.integrity.includes('100%') ? 28 : -18}
                          textAnchor="middle"
                          fill="#4EDEA3"
                          fontFamily="JetBrains Mono"
                          fontSize="9"
                        >
                          {node.integrity}
                        </text>
                      )}
                    </>
                  )}

                  {/* Intermediary cascade nodes (core-router, file-handler) */}
                  {(node.type === 'transitive' || node.type === 'carrier') && (
                    <>
                      <circle
                        r={16}
                        fill="#1C2026"
                        stroke={isSimulatedPatched ? '#4EDEA3' : '#FF5451'}
                        strokeWidth="2"
                      />
                      <circle r={6} fill={isSimulatedPatched ? '#4EDEA3' : '#FFB3AD'} />
                      <text
                        x="0"
                        y="-24"
                        textAnchor="middle"
                        fill="#DFE2EB"
                        fontFamily="JetBrains Mono"
                        fontSize="11"
                      >
                        {node.name}@{node.version}
                      </text>
                      <text
                        x="0"
                        y="26"
                        textAnchor="middle"
                        fill={isSimulatedPatched ? '#4EDEA3' : '#FF5451'}
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                      >
                        {node.sublabel}
                      </text>
                    </>
                  )}

                  {/* Focal Critical Node: express-fileupload */}
                  {isFocal && (
                    <g id="focalVulnerableNode">
                      {!isSimulatedPatched && (
                        <circle
                          r="34"
                          fill="none"
                          stroke="#EF4444"
                          strokeWidth="1.5"
                          opacity="0.3"
                          className="animate-ping"
                        />
                      )}
                      <circle
                        r={26}
                        fill="#10141A"
                        stroke={isSimulatedPatched ? '#4EDEA3' : '#EF4444'}
                        strokeWidth="3"
                        filter={isSimulatedPatched ? 'url(#glow-tertiary)' : 'url(#glow-crimson)'}
                      />
                      <circle r={13} fill={isSimulatedPatched ? '#4EDEA3' : '#EF4444'} />

                      {/* Green Verified Clean Badge when Patched */}
                      {isSimulatedPatched && (
                        <g transform="translate(0, -78)">
                          <rect
                            x="-64"
                            y="-11"
                            width="128"
                            height="22"
                            rx="11"
                            fill="#003824"
                            stroke="#4EDEA3"
                            strokeWidth="1.5"
                            filter="url(#glow-tertiary)"
                          />
                          <circle cx="-48" cy="0" r="3.5" fill="#4EDEA3" className="animate-pulse" />
                          <text
                            x="6"
                            y="4"
                            textAnchor="middle"
                            fill="#4EDEA3"
                            fontFamily="JetBrains Mono"
                            fontSize="10"
                            fontWeight="800"
                            letterSpacing="0.06em"
                          >
                            VERIFIED CLEAN
                          </text>
                        </g>
                      )}

                      {/* Tagging Banner */}
                      <rect
                        x="-85"
                        y="-58"
                        width="170"
                        height="24"
                        rx="4"
                        fill={isSimulatedPatched ? '#003824' : '#93000A'}
                        opacity="0.95"
                      />
                      <text
                        x="0"
                        y="-42"
                        textAnchor="middle"
                        fill={isSimulatedPatched ? '#6FFBBE' : '#FFDAD6'}
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                        fontWeight="700"
                      >
                        {isSimulatedPatched ? 'PATCHED: v1.5.0 SECURED' : 'CVE-2024-21907 [9.8 RCE]'}
                      </text>

                      {/* Label */}
                      <text
                        x="0"
                        y="44"
                        textAnchor="middle"
                        fill={isSimulatedPatched ? '#4EDEA3' : '#FFB4AB'}
                        fontFamily="JetBrains Mono"
                        fontSize="13"
                        fontWeight="700"
                      >
                        {node.name}@{isSimulatedPatched ? '1.5.0' : node.version}
                      </text>
                      <text
                        x="0"
                        y="58"
                        textAnchor="middle"
                        fill="#DFE2EB"
                        fontFamily="JetBrains Mono"
                        fontSize="10"
                      >
                        {isSimulatedPatched ? 'SANITIZED PROTOTYPE BOUNDARY' : 'PROTOTYPE POLLUTION EXPLOIT'}
                      </text>
                    </g>
                  )}

                  {/* Downstream Microservices */}
                  {isDownstream && (
                    <>
                      <circle
                        r={15}
                        fill="#1C2026"
                        stroke={isSimulatedPatched ? '#4EDEA3' : '#EF4444'}
                        strokeWidth="1.5"
                      />
                      <circle r={5} fill={isSimulatedPatched ? '#4EDEA3' : '#EF4444'} />
                      <text
                        x="22"
                        y="4"
                        fill="#DFE2EB"
                        fontFamily="JetBrains Mono"
                        fontSize="11"
                        fontWeight="500"
                      >
                        {node.name}
                      </text>
                      <text
                        x="22"
                        y="18"
                        fill={isSimulatedPatched ? '#4EDEA3' : '#FF5451'}
                        fontFamily="JetBrains Mono"
                        fontSize="9"
                      >
                        {isSimulatedPatched ? 'SAFEGUARDED' : node.sublabel}
                      </text>
                    </>
                  )}

                  {/* Highlighting search or active selection halo */}
                  {(isHighlighted || isSelected) && (
                    <circle
                      r={36}
                      fill="none"
                      stroke="#7BD0FF"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      className="animate-spin"
                      style={{ animationDuration: '6s' }}
                    />
                  )}
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Focal Target HUD Popover (Floating bottom-right) */}
        {selectedNode && (
          <div
            className="absolute bottom-4 right-4 bg-[#262a31]/95 backdrop-blur-md rounded-lg p-3.5 shadow-xl max-w-sm flex flex-col gap-2 pointer-events-auto border border-[#31353c]"
            id="graphHoverHUD"
          >
            <div className="flex items-center justify-between border-b border-[#31353c] pb-2">
              <span className="font-mono text-[10px] text-[#ffb4ab] flex items-center gap-1 font-semibold uppercase">
                <span className="material-symbols-outlined text-sm">crisis_alert</span>
                SELECTED FOCAL TARGET
              </span>
              <span
                className={`px-1.5 py-0.5 rounded font-mono text-[11px] font-bold ${
                  isSimulatedPatched
                    ? 'bg-[#003824] text-[#4edea3]'
                    : 'bg-[#93000a] text-[#ffdad6]'
                }`}
              >
                {isSimulatedPatched ? 'PATCHED' : 'CRITICAL 9.8'}
              </span>
            </div>

            <div>
              <div className="font-mono text-[13px] text-[#dfe2eb] font-bold">
                {selectedNode.name}@{isSimulatedPatched && selectedNode.id === 'focalVulnerableNode' ? '1.5.0' : selectedNode.version || 'latest'}
              </div>
              <div className="font-mono text-[11px] text-[#8b949e]">
                {isSimulatedPatched && selectedNode.id === 'focalVulnerableNode'
                  ? 'Sanitized Prototype Parser Active: Zero downstream microservices compromised.'
                  : 'Vulnerability: Prototype Pollution leading to Remote Code Execution'}
              </div>
            </div>

            <div className="flex items-center justify-between font-mono text-[11px] text-[#8b949e] bg-[#0a0e14] p-2 rounded border border-[#31353c]/30">
              <span>Blast Radius Traversal:</span>
              <span className={isSimulatedPatched ? 'text-[#4edea3] font-bold' : 'text-[#ff5451] font-bold'}>
                {isSimulatedPatched ? '0 Services Compromised' : '14 Services Compromised'}
              </span>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={onFocusChain}
                className="flex-1 bg-[#0a0e14] hover:bg-[#1c2026] text-[#7bd0ff] py-1.5 px-2 rounded font-mono text-[11px] transition-colors text-center border border-[#7bd0ff]/20 cursor-pointer"
              >
                Focus Chain
              </button>
              <button
                onClick={onOpenPrModal}
                className="flex-1 bg-[#ff5451] text-[#5c0008] font-semibold hover:opacity-90 py-1.5 px-2 rounded font-mono text-[11px] transition-opacity text-center cursor-pointer shadow-[0_0_8px_rgba(255,84,81,0.4)]"
              >
                Remediate PR
              </button>
            </div>
          </div>
        )}

        {/* Mini Legend Pill (Bottom Left) */}
        <div className="absolute bottom-4 left-4 hidden sm:flex items-center gap-3 bg-[#181c22]/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#8b949e] border border-[#262a31]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5451]"></span>
            <span>Poison Cascade</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4edea3]"></span>
            <span>Verified Node</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7bd0ff]"></span>
            <span>Root Origin</span>
          </div>
        </div>
      </div>
    </div>
  );
};
