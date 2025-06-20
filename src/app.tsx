import React, { useState, useCallback, useEffect } from "react";
import { Rows, Alert } from "@canva/app-ui-kit";
import { getCurrentPageContext } from "@canva/design";
import { useSelection } from "utils/use_selection_hook";
import * as styles from "styles/components.css";
import { Header } from "./components/Header";
import { CurrentSelection } from "./components/CurrentSelection";
import { HotspotsManager } from "./components/HotspotsManager";
import { PreviewExport } from "./components/PreviewExport";
import { Hotspot, SelectedElement, Page } from "./types";

// Mock pages data - in real app this would come from Canva design
const mockPages: Page[] = [
  { value: "1", label: "Page 1" },
  { value: "2", label: "Page 2" },
  { value: "3", label: "Page 3" },
  { value: "4", label: "Page 4" },
];

export const App = () => {
  // Get real element selection from Canva
  const currentSelection = useSelection("plaintext");

  // Centralized state management
  const [hotspots, setHotspots] = useState<Hotspot[]>([
    {
      id: "1",
      elementId: "e001",
      elementName: "Button",
      targetPage: 2,
      elementIcon: "T",
    },
    {
      id: "2",
      elementId: "e002",
      elementName: "Home Icon",
      targetPage: 1,
      elementIcon: "🖼️",
    },
  ]);

  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);

  // State for storing the selected element - only set when text is ready
  const [selectedElement, setSelectedElement] =
    useState<SelectedElement | null>(null);

  // Effect to read text content when selection changes
  useEffect(() => {
    const readTextContent = async () => {
      if (currentSelection.count === 0) {
        // No selection - hide the selected element immediately
        setSelectedElement(null);
        return;
      }

      // Don't show anything until we have the text content
      try {
        const draft = await currentSelection.read();
        if (draft.contents.length > 0 && "text" in draft.contents[0]) {
          const textContent = draft.contents[0].text.trim();
          // Only now show the selected element with the actual text content
          setSelectedElement({
            id: `selection_${Date.now()}`,
            name: textContent || "Empty Text",
            type: "text",
          });
        } else {
          setSelectedElement({
            id: `selection_${Date.now()}`,
            name: "Selected Text",
            type: "text",
          });
        }
      } catch (error) {
        console.warn("Could not read text content:", error);
        setSelectedElement({
          id: `selection_${Date.now()}`,
          name: "Selected Text",
          type: "text",
        });
      }
    };

    readTextContent();
  }, [currentSelection]);

  // Auto-hide success alert after 3 seconds
  useEffect(() => {
    if (showSuccessAlert) {
      const timer = setTimeout(() => {
        setShowSuccessAlert(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessAlert]);

  // Function to get the appropriate icon for different element types
  const getElementIcon = (elementType: string): string => {
    switch (elementType.toLowerCase()) {
      case "text":
      case "plaintext":
      case "richtext":
        return "T"; // Text icon
      case "image":
        return "🖼️"; // Image icon
      case "video":
        return "🎬"; // Video icon
      case "shape":
        return "🔷"; // Shape icon
      default:
        return "📱"; // Default fallback icon
    }
  };

  // Hotspot management functions
  const handleAddHotspot = useCallback(
    (elementId: string, targetPage: number) => {
      // Use the already-read element name from selectedElement
      const elementName = selectedElement?.name || "Unknown Element";
      const elementIcon = getElementIcon(selectedElement?.type || "");

      const newHotspot: Hotspot = {
        id: Date.now().toString(), // Simple ID generation
        elementId,
        elementName,
        targetPage,
        elementIcon,
      };

      setHotspots((prev) => [...prev, newHotspot]);
      setShowSuccessAlert(true);
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

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Header />

        <CurrentSelection
          selectedElement={selectedElement}
          pages={mockPages}
          onAddHotspot={handleAddHotspot}
        />

        {showSuccessAlert && (
          <Alert tone="positive" title="Hotspot added successfully!" />
        )}

        <HotspotsManager
          hotspots={hotspots}
          pages={mockPages}
          editingHotspotId={editingHotspotId}
          onEdit={handleEditHotspot}
          onDelete={handleDeleteHotspot}
          onPageChange={handleUpdateHotspot}
        />

        <PreviewExport hotspots={hotspots} />
      </Rows>
    </div>
  );
};
