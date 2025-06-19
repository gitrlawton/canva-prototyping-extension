import React from "react";
import { Button } from "@canva/app-ui-kit";

interface AddHotspotButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const AddHotspotButton: React.FC<AddHotspotButtonProps> = ({
  onClick,
  disabled = false,
}) => {
  return (
    <Button variant="secondary" stretch onClick={onClick} disabled={disabled}>
      + Add New Hotspot
    </Button>
  );
};
