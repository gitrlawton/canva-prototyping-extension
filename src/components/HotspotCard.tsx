import React from "react";
import {
  Rows,
  Text,
  Button,
  Select,
  Columns,
  Column,
  Box,
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
  return (
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
                onChange={(value) => onPageChange(hotspot.id, value)}
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
            <Button variant="secondary" onClick={() => onEdit(hotspot.id)}>
              {isEditing ? "Cancel" : "Edit"}
            </Button>
            <Button variant="secondary" onClick={() => onDelete(hotspot.id)}>
              Delete
            </Button>
          </Rows>
        </Column>
      </Columns>
    </Box>
  );
};
