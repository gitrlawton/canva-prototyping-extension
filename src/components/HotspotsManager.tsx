import React, { useState } from "react";
import { Rows, Text, Title } from "@canva/app-ui-kit";
import { HotspotCard } from "./HotspotCard";
import { AddHotspotButton } from "./AddHotspotButton";

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
            <HotspotCard
              key={hotspot.id}
              hotspot={hotspot}
              isEditing={editingId === hotspot.id}
              pages={mockPages}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPageChange={handlePageChange}
            />
          ))}
        </Rows>
      )}

      <AddHotspotButton onClick={() => console.log("Add new hotspot")} />
    </Rows>
  );
};
