import { useQuery } from "@tanstack/react-query";
import { Text, Stack, Group, Loader, Badge, Alert } from "@mantine/core";
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
      {/* Stats Bar at Top */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e9ecef",
          backgroundColor: "#fff",
        }}
      >
        <Group justify="center" gap="xl">
          <Group gap="xs">
            <Text size="sm" fw={600}>
              Influenced by:
            </Text>
            <Badge size="lg" variant="light" color="green">
              {graphData.influenced_by?.length || 0}
            </Badge>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={600}>
              Influences:
            </Text>
            <Badge size="lg" variant="light" color="orange">
              {graphData.influences?.length || 0}
            </Badge>
          </Group>
          <Group gap="xs">
            <Text size="sm" fw={600}>
              Total connections:
            </Text>
            <Badge size="lg" variant="light" color="blue">
              {(graphData.influenced_by?.length || 0) +
                (graphData.influences?.length || 0)}
            </Badge>
          </Group>
        </Group>
      </div>

      {/* Graph takes remaining space */}
      <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
        <ForceGraph data={graphData} onNodeClick={onNodeClick} />
      </div>
    </div>
  );
}
