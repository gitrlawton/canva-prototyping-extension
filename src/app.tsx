import React, { useState, useCallback, useEffect } from "react";
import { Rows, Alert } from "@canva/app-ui-kit";
import { getCurrentPageContext } from "@canva/design";
import { useSelection } from "utils/use_selection_hook";
import * as styles from "styles/components.css";
import { Header } from "./components/Header";
import { CurrentSelection } from "./components/CurrentSelection";
import { HotspotsManager } from "./components/HotspotsManager";
import { PreviewExport } from "./components/PreviewExport";
import { PageCount } from "./components/PageCount";
import { PreviewModal } from "./components/PreviewModal";
import { Hotspot, SelectedElement, Page } from "./types";

// Generate pages list based on user-specified count
const generatePages = (count: number): Page[] => {
  return Array.from({ length: count }, (_, i) => ({
    value: (i + 1).toString(),
    label: `Page ${i + 1}`,
  }));
};

// Enhanced hotspot management utilities
const STORAGE_KEY = "canva-prototype-hotspots";

const saveHotspotsToStorage = (hotspots: Hotspot[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(hotspots));
  } catch (error) {
    console.warn("Failed to save hotspots to localStorage:", error);
  }
};

const loadHotspotsFromStorage = (): Hotspot[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that the loaded data has the expected structure
      if (Array.isArray(parsed) && parsed.every(isValidHotspot)) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load hotspots from localStorage:", error);
  }
  return [];
};

const isValidHotspot = (hotspot: any): hotspot is Hotspot => {
  return (
    typeof hotspot === "object" &&
    typeof hotspot.id === "string" &&
    typeof hotspot.elementId === "string" &&
    typeof hotspot.elementName === "string" &&
    typeof hotspot.targetPage === "number" &&
    typeof hotspot.sourcePage === "number" &&
    typeof hotspot.elementIcon === "string"
  );
};

const validateHotspot = (hotspot: Partial<Hotspot>): string | null => {
  if (!hotspot.elementId?.trim()) {
    return "Element ID is required";
  }
  if (!hotspot.elementName?.trim()) {
    return "Element name is required";
  }
  if (!hotspot.sourcePage || hotspot.sourcePage < 1) {
    return "Valid source page is required";
  }
  if (!hotspot.targetPage || hotspot.targetPage < 1) {
    return "Valid target page is required";
  }
  return null;
};

const isDuplicateHotspot = (
  hotspots: Hotspot[],
  elementId: string,
  excludeId?: string,
): boolean => {
  return hotspots.some((h) => h.elementId === elementId && h.id !== excludeId);
};

export const App = () => {
  // Get real element selection from Canva
  const currentSelection = useSelection("plaintext");

  // User-specified page count (default to 0 as a reasonable starting point)
  const [pageCount, setPageCount] = useState(0);

  // Generate pages list based on user's specified count
  const pages = generatePages(pageCount);

  // Centralized state management with persistent storage
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => {
    const stored = loadHotspotsFromStorage();
    // If no stored data, return some sample data for development
    return stored;
  });

  const [editingHotspotId, setEditingHotspotId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

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

  // Auto-persist hotspots to localStorage whenever they change
  useEffect(() => {
    saveHotspotsToStorage(hotspots);
  }, [hotspots]);

  // Auto-hide alerts after 4 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

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

  // Enhanced hotspot management functions
  const handleAddHotspot = useCallback(
    (elementId: string, sourcePage: number, targetPage: number) => {
      try {
        // Validation checks
        if (!selectedElement) {
          setErrorMessage("No element selected");
          return;
        }

        if (sourcePage < 1 || sourcePage > pageCount) {
          setErrorMessage(`Source page must be between 1 and ${pageCount}`);
          return;
        }

        if (targetPage < 1 || targetPage > pageCount) {
          setErrorMessage(`Target page must be between 1 and ${pageCount}`);
          return;
        }

        if (sourcePage === targetPage) {
          setErrorMessage("Source and target pages must be different");
          return;
        }

        // Check for duplicates
        if (isDuplicateHotspot(hotspots, elementId)) {
          setErrorMessage("A hotspot already exists for this element");
          return;
        }

        const elementName = selectedElement.name || "Unknown Element";
        const elementIcon = getElementIcon(selectedElement.type || "");

        const newHotspot: Hotspot = {
          id: `hotspot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          elementId,
          elementName,
          sourcePage,
          targetPage,
          elementIcon,
        };

        // Final validation
        const validationError = validateHotspot(newHotspot);
        if (validationError) {
          setErrorMessage(validationError);
          return;
        }

        setHotspots((prev) => [...prev, newHotspot]);
        setSuccessMessage(
          `Hotspot added: "${elementName}" on Page ${sourcePage} → Page ${targetPage}`,
        );

        console.log("Added hotspot:", newHotspot);
      } catch (error) {
        console.error("Error adding hotspot:", error);
        setErrorMessage("Failed to add hotspot. Please try again.");
      }
    },
    [selectedElement, hotspots, pageCount],
  );

  const handleEditHotspot = useCallback((id: string) => {
    setEditingHotspotId((prev) => (prev === id ? null : id));
  }, []);

  const handleDeleteHotspot = useCallback(
    (id: string) => {
      try {
        const hotspotToDelete = hotspots.find((h) => h.id === id);
        if (!hotspotToDelete) {
          setErrorMessage("Hotspot not found");
          return;
        }

        setHotspots((prev) => prev.filter((h) => h.id !== id));
        setEditingHotspotId(null);

        console.log("Deleted hotspot:", id);
      } catch (error) {
        console.error("Error deleting hotspot:", error);
        setErrorMessage("Failed to delete hotspot. Please try again.");
      }
    },
    [hotspots],
  );

  const handleUpdateHotspot = useCallback(
    (id: string, newPage: string) => {
      try {
        const targetPage = parseInt(newPage, 10);

        // Validation
        if (isNaN(targetPage) || targetPage < 1 || targetPage > pageCount) {
          setErrorMessage(`Target page must be between 1 and ${pageCount}`);
          return;
        }

        const hotspotToUpdate = hotspots.find((h) => h.id === id);
        if (!hotspotToUpdate) {
          setErrorMessage("Hotspot not found");
          return;
        }

        setHotspots((prev) =>
          prev.map((h) => (h.id === id ? { ...h, targetPage } : h)),
        );
        setEditingHotspotId(null);

        console.log("Updated hotspot:", id, "to page:", targetPage);
      } catch (error) {
        console.error("Error updating hotspot:", error);
        setErrorMessage("Failed to update hotspot. Please try again.");
      }
    },
    [hotspots, pageCount],
  );

  const handleClearAllHotspots = useCallback(() => {
    try {
      if (hotspots.length === 0) {
        setErrorMessage("No hotspots to clear");
        return;
      }

      const count = hotspots.length;
      setHotspots([]);
      setEditingHotspotId(null);
      setSuccessMessage(`Cleared ${count} hotspot${count !== 1 ? "s" : ""}`);

      console.log("Cleared all hotspots");
    } catch (error) {
      console.error("Error clearing hotspots:", error);
      setErrorMessage("Failed to clear hotspots. Please try again.");
    }
  }, [hotspots]);

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing="3u">
        <Header />

        <PageCount pageCount={pageCount} onPageCountChange={setPageCount} />

        <CurrentSelection
          selectedElement={selectedElement}
          pages={pages}
          onAddHotspot={handleAddHotspot}
        />

        {successMessage && <Alert tone="positive" title={successMessage} />}

        {errorMessage && <Alert tone="critical" title={errorMessage} />}

        <HotspotsManager
          hotspots={hotspots}
          pages={pages}
          editingHotspotId={editingHotspotId}
          onEdit={handleEditHotspot}
          onDelete={handleDeleteHotspot}
          onPageChange={handleUpdateHotspot}
          onClearAll={handleClearAllHotspots}
        />

        <PreviewExport hotspots={hotspots} />
      </Rows>
    </div>
  );
};
