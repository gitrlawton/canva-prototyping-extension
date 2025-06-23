import React, { useState, useEffect } from "react";
import { Rows, Text, Title, Button, Columns, Alert } from "@canva/app-ui-kit";
import { HotspotCard } from "./HotspotCard";
import { HotspotsManagerProps } from "../types";
import * as styles from "../../styles/components.css";

export const HotspotsManager: React.FC<HotspotsManagerProps> = ({
  hotspots,
  pages,
  editingHotspotId,
  onEdit,
  onDelete,
  onPageChange,
  onClearAll,
}) => {
  const [deleteAlert, setDeleteAlert] = useState<{
    position: number;
    message: string;
  } | null>(null);

  // Auto-hide delete alert after 3 seconds
  useEffect(() => {
    if (deleteAlert) {
      const timer = setTimeout(() => {
        setDeleteAlert(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteAlert]);

  const handleDelete = (id: string) => {
    // Find the position of the card being deleted
    const position = hotspots.findIndex((h) => h.id === id);
    const hotspotToDelete = hotspots.find((h) => h.id === id);

    if (hotspotToDelete && position !== -1) {
      // Set the delete alert for this position
      setDeleteAlert({
        position,
        message: `Deleted "${hotspotToDelete.elementName}"`,
      });
    }

    // Call the parent delete handler
    onDelete(id);
  };

  // Create the list items with alerts inserted at the correct positions
  const renderHotspotsWithAlerts = () => {
    const items: React.ReactNode[] = [];

    // Add each hotspot card
    hotspots.forEach((hotspot, index) => {
      items.push(
        <HotspotCard
          key={hotspot.id}
          hotspot={hotspot}
          isEditing={editingHotspotId === hotspot.id}
          pages={pages}
          onEdit={onEdit}
          onDelete={handleDelete}
          onPageChange={onPageChange}
        />,
      );
    });

    // Insert delete alert at the correct position
    if (deleteAlert) {
      const alertElement = (
        <Alert key="delete-alert" tone="positive" title={deleteAlert.message} />
      );

      // Insert at the position where the card was deleted
      items.splice(deleteAlert.position, 0, alertElement);
    }

    return items;
  };

  return (
    <Rows spacing="2u">
      <Columns spacing="2u" alignY="center">
        <div className={styles.hotspotsTitle}>
          <Title size="small">Hotspots ({hotspots.length})</Title>
        </div>
        {hotspots.length > 0 && (
          <div className={styles.clearAllButton}>
            <Button variant="secondary" onClick={onClearAll}>
              Clear All
            </Button>
          </div>
        )}
      </Columns>

      {hotspots.length === 0 && !deleteAlert ? (
        <Text tone="tertiary" alignment="center">
          No hotspots defined yet. Select an element to add your first hotspot.
        </Text>
      ) : (
        <Rows spacing="1u">{renderHotspotsWithAlerts()}</Rows>
      )}
    </Rows>
  );
};
