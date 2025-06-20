import React, { useState, useCallback } from "react";
import { Rows } from "@canva/app-ui-kit";
import * as styles from "styles/components.css";
import { Header } from "./components/Header";
import { CurrentSelection } from "./components/CurrentSelection";
import { HotspotsManager } from "./components/HotspotsManager";
import { PreviewExport } from "./components/PreviewExport";
import { Hotspot, SelectedElement, Page } from "./types";

// Mock data - in real app this would come from Canva SDK
const mockPages: Page[] = [
  { value: "1", label: "Page 1" },
  { value: "2", label: "Page 2" },
  { value: "3", label: "Page 3" },
  { value: "4", label: "Page 4" },
];

const mockSelectedElement: SelectedElement = {
  id: "element_123",
  name: "Login Button",
  type: "text",
};

export const App = () => {
  // Centralized state management
  const [hotspots, setHotspots] = useState<Hotspot[]>([
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
  ]);

  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(mockSelectedElement);
  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);

  // Hotspot management functions
  const handleAddHotspot = useCallback(
    (elementId: string, targetPage: number) => {
      const newHotspot: Hotspot = {
        id: Date.now().toString(), // Simple ID generation
        elementId,
        elementName: selectedElement?.name || "Unknown Element",
        targetPage,
        elementIcon: "📱", // Default icon
      };

      setHotspots((prev) => [...prev, newHotspot]);
      console.log("Added hotspot:", newHotspot);
    },
    [selectedElement],
  );

  const handleEditHotspot = useCallback((id: string) => {
    setEditingHotspotId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteHotspot = useCallback((id: string) => {
    setHotspots((prev) => prev.filter((h) => h.id !== id));
    setEditingHotspotId(null);
    console.log("Deleted hotspot:", id);
  }, []);

  const handleUpdateHotspot = useCallback((id: string, newPage: string) => {
    setHotspots((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, targetPage: parseInt(newPage) } : h,
      ),
    );
    setEditingHotspotId(null);
    console.log("Updated hotspot:", id, "to page:", newPage);
  }, []);

  const handleAddNewHotspot = useCallback(() => {
    // This could open a modal or scroll to CurrentSelection
    console.log("Add new hotspot clicked - focus on CurrentSelection");
  }, []);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Header />

        <CurrentSelection
          selectedElement={selectedElement}
          pages={mockPages}
          onAddHotspot={handleAddHotspot}
        />

        <HotspotsManager
          hotspots={hotspots}
          pages={mockPages}
          editingHotspotId={editingHotspotId}
          onEdit={handleEditHotspot}
          onDelete={handleDeleteHotspot}
          onPageChange={handleUpdateHotspot}
          onAddNewHotspot={handleAddNewHotspot}
        />

        <PreviewExport hotspots={hotspots} />
      </Rows>
    </div>
  );
};
