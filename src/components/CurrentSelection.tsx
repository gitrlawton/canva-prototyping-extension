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
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddHotspot = async () => {
    if (!selectedElement || !selectedPage) return;

    setIsAdding(true);

    try {
      // Convert page string to number
      const targetPageNumber = parseInt(selectedPage);

      // Call the parent's add hotspot function
      onAddHotspot(selectedElement.id, targetPageNumber);

      // Reset the form
      setSelectedPage("");

      console.log(
        `Added hotspot: ${selectedElement.name} → Page ${targetPageNumber}`,
      );
    } catch (error) {
      console.error("Failed to add hotspot:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const canAddHotspot = selectedElement && selectedPage && !isAdding;

  return (
    <Rows spacing="2u">
      <Title size="small">📌 Current Selection</Title>

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
            <Columns spacing="1u" alignY="center">
              <Column width="content">
                <Text>📱</Text>
              </Column>
              <Column>
                <Rows spacing="0.5u">
                  <Text variant="bold">{selectedElement.name}</Text>
                  <Text tone="tertiary">{selectedElement.type}</Text>
                </Rows>
              </Column>
            </Columns>

            <Rows spacing="1u">
              <Text variant="bold">Link to page:</Text>
              <Select
                options={pages}
                value={selectedPage}
                onChange={setSelectedPage}
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
