import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  AppShell,
  Burger,
  Group,
  Title,
  Button,
  Stack,
} from "@mantine/core";
import { Shuffle } from "lucide-react";
import { useDisclosure } from "@mantine/hooks";
import SearchBar from "./components/SearchBar";
import GraphVisualization from "./components/GraphVisualization";
import { getRandomEntity } from "./lib/api";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function AppContent() {
  const [opened, { toggle }] = useDisclosure();
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [isLoadingRandom, setIsLoadingRandom] = useState(false);
  const handleRandomEntity = async () => {
    setIsLoadingRandom(true);
    try {
      const entity = await getRandomEntity();
      setSelectedEntityId(entity.id);
    } catch (error) {
      console.error("Error fetching random entity:", error);
    } finally {
      setIsLoadingRandom(false);
    }
  };
  return (
    <AppShell
      header={{ height: { base: 120, sm: 70 } }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Stack
          gap="xs"
          p="md"
          style={{ height: "100%" }}
          justify="center"
          hiddenFrom="sm"
        >
          <Group justify="space-between" wrap="nowrap">
            <Burger opened={opened} onClick={toggle} size="sm" />
            <Title
              order={2}
              style={{
                cursor: "pointer",
                fontSize: "clamp(1.125rem, 4vw, 1.5rem)",
                whiteSpace: "nowrap",
                flex: 1,
                textAlign: "center",
              }}
              onClick={() => setSelectedEntityId(null)}
            >
              Influence Network
            </Title>
            <div style={{ width: 28, visibility: "hidden" }} />
          </Group>
          <div>
            <SearchBar onSelectEntity={setSelectedEntityId} />
          </div>
        </Stack>
        <Group h="100%" px="md" justify="space-between" visibleFrom="sm">
          <Title
            order={2}
            style={{ cursor: "pointer" }}
            onClick={() => setSelectedEntityId(null)}
          >
            Influence Network
          </Title>

          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "100%",
              maxWidth: 600,
              paddingLeft: "1rem",
              paddingRight: "1rem",
            }}
          >
            <SearchBar onSelectEntity={setSelectedEntityId} />
          </div>
          <div style={{ width: 40 }} />
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">Navbar content</AppShell.Navbar>

      <AppShell.Main
        style={{
          height: "calc(100vh - 120px)",
          padding: 0,
          overflow: "hidden",
        }}
        className="app-main"
      >
        {selectedEntityId ? (
          <div style={{ height: "100%", width: "100%" }}>
            <GraphVisualization
              key={selectedEntityId} // Force remount on entity change
              entityId={selectedEntityId}
              onNodeClick={setSelectedEntityId}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#666",
              padding: "1rem",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "clamp(1rem, 3vw, 1.25rem)",
                  marginBottom: "0.5rem",
                }}
              >
                Search for an entity to explore influences
              </p>
              <p
                style={{
                  fontSize: "clamp(0.75rem, 2.5vw, 0.875rem)",
                  marginBottom: "1.5rem",
                }}
              >
                Try "Nirvana," "Expressionism," or "French"
              </p>
              <Button
                leftSection={<Shuffle size={18} />}
                variant="light"
                size="md"
                onClick={handleRandomEntity}
                loading={isLoadingRandom}
              >
                or explore a random network
              </Button>
            </div>
          </div>
        )}
      </AppShell.Main>
    </AppShell>
  );
}

function App() {
  return (
    <MantineProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </MantineProvider>
  );
}

export default App;
