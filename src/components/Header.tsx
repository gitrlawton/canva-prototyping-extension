import React from "react";
import { Rows, Text, Title } from "@canva/app-ui-kit";

export const Header: React.FC = () => {
  return (
    <Rows spacing="1u">
      <Title size="small">🧩 Prototype Embedder</Title>
      <Text variant="regular" tone="tertiary">
        Create interactive clickable prototypes
      </Text>
    </Rows>
  );
};
