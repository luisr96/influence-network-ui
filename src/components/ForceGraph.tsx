import { useEffect, useRef } from "react";
import * as d3 from "d3";
import type { InfluenceGraph } from "../lib/api";

interface ForceGraphProps {
  data: InfluenceGraph;
  onNodeClick: (id: string) => void;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: string;
  group: "center" | "influenced_by" | "influences";
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  type: "influenced_by" | "influences";
}

export default function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!containerRef.current || !svgRef.current || !data) return;

    d3.select(svgRef.current).selectAll("*").remove();

    // Get container dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Guard against invalid dimensions
    if (width === 0 || height === 0) return;

    const nodes: GraphNode[] = [
      {
        id: data.center.id,
        name: data.center.name,
        type: data.center.type,
        group: "center",
      },
      ...data.influenced_by.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        group: "influenced_by" as const,
      })),
      ...data.influences.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        group: "influences" as const,
      })),
    ];

    const links: GraphLink[] = [
      ...data.influenced_by.map((node) => ({
        source: node.id,
        target: data.center.id,
        type: "influenced_by" as const,
      })),
      ...data.influences.map((node) => ({
        source: data.center.id,
        target: node.id,
        type: "influences" as const,
      })),
    ];

    const color = d3
      .scaleOrdinal<string>()
      .domain(["center", "influenced_by", "influences"])
      .range(["#3b82f6", "#10b981", "#f59e0b"]);

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(150)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(30))
      // Add bounds to keep nodes visible
      .force("x", d3.forceX(width / 2).strength(0.05))
      .force("y", d3.forceY(height / 2).strength(0.05));

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    svg
      .append("defs")
      .selectAll("marker")
      .data(["influenced_by", "influences"])
      .join("marker")
      .attr("id", (d) => `arrow-${d}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 20)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("fill", "#999")
      .attr("d", "M0,-5L10,0L0,5");

    const link = svg
      .append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2)
      .attr("marker-end", (d) => `url(#arrow-${d.type})`);

    const node = svg
      .append("g")
      .selectAll("g")
      .data(nodes)
      .join("g")
      .style("cursor", "pointer")
      .call(
        d3
          .drag<SVGGElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended) as any
      );

    node
      .append("circle")
      .attr("r", (d) => (d.group === "center" ? 12 : 8))
      .attr("fill", (d) => color(d.group))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    node
      .append("text")
      .text((d) => d.name)
      .attr("x", 0)
      .attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "#1f2937")
      .style("pointer-events", "none")
      .style("user-select", "none");

    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #ddd")
      .style("border-radius", "4px")
      .style("padding", "8px")
      .style("pointer-events", "none")
      .style("font-size", "12px")
      .style("box-shadow", "0 2px 4px rgba(0,0,0,0.1)")
      .style("z-index", "1000");

    node
      .on("mouseenter", (event, d) => {
        // Show tooltip
        tooltip.style("visibility", "visible").html(`
          ${d.group == "center" ? "" : d.group.replace(/_/g, " ")}
          <strong>${d.name}</strong><br/>
          Type: ${d.type}<br/>
        `);

        // Highlight node
        d3.select(event.currentTarget)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", d.group === "center" ? 15 : 10)
          .attr("stroke-width", 3);
      })
      .on("mousemove", (event) => {
        tooltip
          .style(
            "top",
            `${
              event.pageY -
              containerRef.current!.getBoundingClientRect().top -
              10
            }px`
          )
          .style(
            "left",
            `${
              event.pageX -
              containerRef.current!.getBoundingClientRect().left +
              10
            }px`
          );
      })
      .on("mouseleave", (event, d) => {
        // Hide tooltip
        tooltip.style("visibility", "hidden");

        // Reset node
        d3.select(event.currentTarget)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", d.group === "center" ? 12 : 8)
          .attr("stroke-width", 2);
      });

    node.on("click", (event, d) => {
      event.stopPropagation();
      onNodeClick(d.id);
    });

    function ticked() {
      nodes.forEach((d) => {
        d.x = Math.max(30, Math.min(width - 30, d.x || 0));
        d.y = Math.max(30, Math.min(height - 30, d.y || 0));
      });

      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    }

    function dragstarted(
      event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>
    ) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;

      // Hide tooltip when dragging starts
      tooltip.style("visibility", "hidden");
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>) {
      event.subject.fx = Math.max(30, Math.min(width - 30, event.x));
      event.subject.fy = Math.max(30, Math.min(height - 30, event.y));
    }

    function dragended(
      event: d3.D3DragEvent<SVGGElement, GraphNode, GraphNode>
    ) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    simulation.on("tick", ticked);
    simulation.alpha(1);

    return () => {
      simulation.stop();
      tooltip.remove();
    };
  }, [data, onNodeClick]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    >
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          display: "block",
        }}
      />
    </div>
  );
}
