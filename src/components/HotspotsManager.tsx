import React from "react";
import { Rows, Text, Title } from "@canva/app-ui-kit";
import { HotspotCard } from "./HotspotCard";

interface HotspotsManagerProps {
  hotspots: Array<{
    id: string;
    elementId: string;
    elementName: string;
    targetPage: number;
    elementIcon: string;
  }>;
  pages: Array<{ value: string; label: string }>;
  editingHotspotId: string | null;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (id: string, newPage: string) => void;
}

export const HotspotsManager: React.FC<HotspotsManagerProps> = ({
  hotspots,
  pages,
  editingHotspotId,
  onEdit,
  onDelete,
  onPageChange,
}) => {
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
              isEditing={editingHotspotId === hotspot.id}
              pages={pages}
              onEdit={onEdit}
              onDelete={onDelete}
              onPageChange={onPageChange}
            />
          ))}
        </Rows>
      )}
    </Rows>
  );
};
