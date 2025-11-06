import { useQuery } from "@tanstack/react-query";
import { Text, Stack, Loader, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { getInfluenceGraph } from "../lib/api";
import ForceGraph from "./ForceGraph";

interface GraphVisualizationProps {
  entityId: string;
  onNodeClick: (id: string) => void;
}

export default function GraphVisualization({
  entityId,
  onNodeClick,
}: GraphVisualizationProps) {
  const {
    data: graphData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["influence-graph", entityId],
    queryFn: async () => {
      try {
        const data = await getInfluenceGraph(entityId);
        console.log("Graph data loaded:", data);
        return data;
      } catch (err) {
        console.error("Error loading graph:", err);
        throw err;
      }
    },
    retry: 1,
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading graph...</Text>
        </Stack>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "2rem",
        }}
      >
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error loading graph"
          color="red"
          variant="light"
        >
          Could not load the influence graph for this entity. Please try again.
        </Alert>
      </div>
    );
  }

  if (!graphData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Text c="dimmed">No data available</Text>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Graph takes remaining space */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <ForceGraph data={graphData} onNodeClick={onNodeClick} />
      </div>
    </div>
  );
}
