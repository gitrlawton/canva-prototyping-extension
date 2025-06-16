import React, { useState } from "react";
import {
  Rows,
  Text,
  Title,
  Button,
  Select,
  Columns,
  Column,
  Box,
} from "@canva/app-ui-kit";

// Mock data for demonstration - in real app this would come from state management
interface Hotspot {
  id: string;
  elementId: string;
  elementName: string;
  targetPage: number;
  elementIcon: string;
}

const mockHotspots: Hotspot[] = [
  {
    id: "1",
    elementId: "e001",
    elementName: "Button",
    targetPage: 2,
    elementIcon: "📱",
  },
  {
    id: "2",
    elementId: "e002",
    elementName: "Home Icon",
    targetPage: 1,
    elementIcon: "🏠",
  },
  {
    id: "3",
    elementId: "e003",
    elementName: "Menu",
    targetPage: 3,
    elementIcon: "📋",
  },
];

// Mock pages data - would come from Canva design in real app
const mockPages = [
  { value: "1", label: "Page 1" },
  { value: "2", label: "Page 2" },
  { value: "3", label: "Page 3" },
  { value: "4", label: "Page 4" },
];

export const HotspotsManager: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>(mockHotspots);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  const handleDelete = (id: string) => {
    setHotspots(hotspots.filter((h) => h.id !== id));
  };

  const handlePageChange = (id: string, newPage: string) => {
    setHotspots(
      hotspots.map((h) =>
        h.id === id ? { ...h, targetPage: parseInt(newPage) } : h,
      ),
    );
    setEditingId(null);
  };

  return (
    <Rows spacing="2u">
      <Title size="small">🔗 Hotspots ({hotspots.length})</Title>

      {hotspots.length === 0 ? (
        <Text tone="tertiary" alignment="center">
          No hotspots defined yet. Select an element to add your first hotspot.
        </Text>
      ) : (
        <Rows spacing="1u">
          {hotspots.map((hotspot) => (
            <Box
              key={hotspot.id}
              padding="2u"
              borderRadius="standard"
              background="neutralLow"
            >
              <Columns spacing="1u" alignY="center">
                <Column>
                  {editingId === hotspot.id ? (
                    <Rows spacing="0.5u">
                      <Text variant="bold">{hotspot.elementName}</Text>
                      <Select
                        options={mockPages}
                        value={hotspot.targetPage.toString()}
                        onChange={(value) =>
                          handlePageChange(hotspot.id, value)
                        }
                        placeholder="Select target page"
                      />
                    </Rows>
                  ) : (
                    <Rows spacing="0.5u">
                      <Text variant="bold">{hotspot.elementName}</Text>
                      <Text tone="tertiary">→ Page {hotspot.targetPage}</Text>
                    </Rows>
                  )}
                </Column>
                <Column width="content">
                  <Rows spacing="0.5u">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(hotspot.id)}
                    >
                      {editingId === hotspot.id ? "Cancel" : "Edit"}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleDelete(hotspot.id)}
                    >
                      Delete
                    </Button>
                  </Rows>
                </Column>
              </Columns>
            </Box>
          ))}
        </Rows>
      )}

      <Button variant="secondary" stretch>
        + Add New Hotspot
      </Button>
    </Rows>
  );
};
