import React from "react";
import { Button } from "@canva/app-ui-kit";
import { AddHotspotButtonProps } from "../types";

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
