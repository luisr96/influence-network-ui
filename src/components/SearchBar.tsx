import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Autocomplete, Loader, Text, Group } from "@mantine/core";
import type { ComboboxItem } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { searchEntities } from "../lib/api";
import type { EntitySummary } from "../lib/api";

interface SearchBarProps {
  onSelectEntity: (id: string) => void;
}

interface CustomComboboxItem extends ComboboxItem {
  label: string;
  description: string;
  entityId: string;
}

export default function SearchBar({ onSelectEntity }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebouncedValue(searchTerm, 300);
  const entitiesRef = useRef<Map<string, EntitySummary>>(new Map());

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: ["search", debouncedSearchTerm],
    queryFn: async () => {
      try {
        return await searchEntities(debouncedSearchTerm);
      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: debouncedSearchTerm.length > 0,
  });

  // Store entities in a map by their unique key
  entitiesRef.current.clear();
  const autocompleteData: CustomComboboxItem[] = suggestions.map(
    (entity, index) => {
      const uniqueKey = `${entity.id}-${index}`;
      entitiesRef.current.set(uniqueKey, entity);

      return {
        value: uniqueKey,
        label: entity.name,
        description: entity.type,
        entityId: entity.id,
      };
    }
  );

  const handleSelect = (value: string) => {
    const entity = entitiesRef.current.get(value);
    if (entity) {
      setSearchTerm(entity.name);
      onSelectEntity(entity.id);
    }
  };

  return (
    <Autocomplete
      placeholder="Search for people, groups, genres..."
      data={autocompleteData}
      value={searchTerm}
      onChange={setSearchTerm}
      onOptionSubmit={handleSelect}
      rightSection={isFetching ? <Loader size="xs" /> : null}
      limit={10}
      maxDropdownHeight={400}
      renderOption={({ option }) => {
        const customOption = option as CustomComboboxItem;
        return (
          <Group
            justify="space-between"
            wrap="nowrap"
            style={{ width: "100%" }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm">{customOption.label}</Text>
              <Text size="xs" c="dimmed">
                {customOption.description}
              </Text>
            </div>
            <Text
              size="xs"
              c="gray.6"
              style={{
                fontFamily: "monospace",
                flexShrink: 0,
                marginLeft: "1rem",
              }}
            >
              {customOption.entityId}
            </Text>
          </Group>
        );
      }}
    />
  );
}
