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
import { CurrentSelectionProps } from "../types";

export const CurrentSelection: React.FC<CurrentSelectionProps> = ({
  selectedElement,
  pages,
  onAddHotspot,
}) => {
  const [sourcePage, setSourcePage] = useState<string>("");
  const [targetPage, setTargetPage] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHotspot = async () => {
    if (!selectedElement || !sourcePage || !targetPage) return;

    setIsAdding(true);

    try {
      // Convert page strings to numbers
      const sourcePageNumber = parseInt(sourcePage);
      const targetPageNumber = parseInt(targetPage);

      // Call the parent's add hotspot function
      onAddHotspot(selectedElement.id, sourcePageNumber, targetPageNumber);

      // Reset the form
      setSourcePage("");
      setTargetPage("");

      console.log(
        `Added hotspot: ${selectedElement.name} on Page ${sourcePageNumber} → Page ${targetPageNumber}`,
      );
    } catch (error) {
      console.error("Failed to add hotspot:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const canAddHotspot =
    selectedElement && sourcePage && targetPage && !isAdding;

  return (
    <Rows spacing="2u">
      <Title size="small">Current Selection</Title>

      {!selectedElement ? (
        <Box padding="2u" borderRadius="standard">
          <Rows spacing="1u">
            <Text tone="tertiary" alignment="center">
              No element selected
            </Text>
            <Text tone="tertiary" alignment="center">
              Select an element in your design to add a hotspot
            </Text>
          </Rows>
        </Box>
      ) : (
        <Box padding="2u" borderRadius="standard" background="neutral">
          <Rows spacing="1u">
            <Text>
              <span style={{ color: "var(--ui-kit-color-text-tertiary)" }}>
                {selectedElement.type.charAt(0).toUpperCase() +
                  selectedElement.type.slice(1)}
                :
              </span>{" "}
              <span style={{ fontWeight: "bold" }}>{selectedElement.name}</span>
            </Text>

            <Rows spacing="1u">
              <Text variant="bold">Hotspot appears on page:</Text>
              <Select
                options={pages}
                value={sourcePage}
                onChange={setSourcePage}
                placeholder="Choose source page"
                disabled={isAdding}
              />

              <Text variant="bold">Links to page:</Text>
              <Select
                options={pages}
                value={targetPage}
                onChange={setTargetPage}
                placeholder="Choose target page"
                disabled={isAdding}
              />

              <Button
                variant="primary"
                stretch
                onClick={handleAddHotspot}
                disabled={!canAddHotspot}
              >
                {isAdding ? "Adding..." : "📍 Add Hotspot"}
              </Button>
            </Rows>
          </Rows>
        </Box>
      )}
    </Rows>
  );
};
