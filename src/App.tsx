import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  MantineProvider,
  AppShell,
  Burger,
  Group,
  Title,
  Button,
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
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: true },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Title
              order={2}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedEntityId(null)}
            >
              Influence Network
            </Title>
          </Group>
          <div
            style={{
              flex: 1,
              maxWidth: 600,
              marginLeft: "auto",
              marginRight: "auto",
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
          height: "calc(100vh - 70px)",
          padding: 0,
          overflow: "hidden",
        }}
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
            }}
          >
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
                Search for an entity to explore influences
              </p>
              <p style={{ fontSize: "0.875rem", marginBottom: "1.5rem" }}>
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
