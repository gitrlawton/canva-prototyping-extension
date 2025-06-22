import React, { useState, useEffect } from "react";
import {
  Rows,
  Text,
  Button,
  Select,
  Columns,
  Column,
  Box,
  Alert,
} from "@canva/app-ui-kit";
import { HotspotCardProps } from "../types";

export const HotspotCard: React.FC<HotspotCardProps> = ({
  hotspot,
  isEditing,
  pages,
  onEdit,
  onDelete,
  onPageChange,
}) => {
  const [localAlert, setLocalAlert] = useState<string>("");

  // Auto-hide local alert after 3 seconds
  useEffect(() => {
    if (localAlert) {
      const timer = setTimeout(() => {
        setLocalAlert("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [localAlert]);

  const handleEdit = () => {
    if (isEditing) {
      // Canceling edit
      setLocalAlert("");
    }
    onEdit(hotspot.id);
  };

  const handleDelete = () => {
    // Remove local alert for delete - will be handled globally
    onDelete(hotspot.id);
  };

  const handlePageChange = (value: string) => {
    const newPage = parseInt(value);
    setLocalAlert(`Updated "${hotspot.elementName}" → Page ${newPage}`);
    onPageChange(hotspot.id, value);
  };

  return (
    <Rows spacing="1u">
      <Box
        key={hotspot.id}
        padding="2u"
        borderRadius="standard"
        background="neutralLow"
      >
        <Columns spacing="1u" alignY="center">
          <Column>
            {isEditing ? (
              <Rows spacing="0.5u">
                <Text variant="bold">{hotspot.elementName}</Text>
                <Select
                  options={pages}
                  value={hotspot.targetPage.toString()}
                  onChange={handlePageChange}
                  placeholder="Select target page"
                />
              </Rows>
            ) : (
              <Rows spacing="0.5u">
                <Text variant="bold">{hotspot.elementName}</Text>
                <Text tone="tertiary">
                  Page {hotspot.sourcePage} → Page {hotspot.targetPage}
                </Text>
              </Rows>
            )}
          </Column>
          <Column width="content">
            <Rows spacing="0.5u">
              <Button variant="secondary" onClick={handleEdit}>
                {isEditing ? "Cancel" : "Edit"}
              </Button>
              <Button variant="secondary" onClick={handleDelete}>
                Delete
              </Button>
            </Rows>
          </Column>
        </Columns>
      </Box>

      {localAlert && <Alert tone="positive" title={localAlert} />}
    </Rows>
  );
};
