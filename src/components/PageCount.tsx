import React, { useState } from "react";
import {
  Rows,
  Text,
  Title,
  Button,
  TextInput,
  Box,
  Columns,
  Column,
} from "@canva/app-ui-kit";

interface PageCountProps {
  pageCount: number;
  onPageCountChange: (count: number) => void;
}

export const PageCount: React.FC<PageCountProps> = ({
  pageCount,
  onPageCountChange,
}) => {
  const [inputValue, setInputValue] = useState(pageCount.toString());
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    const newCount = parseInt(inputValue);
    if (newCount > 0 && newCount <= 100) {
      onPageCountChange(newCount);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setInputValue(pageCount.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setInputValue(pageCount.toString());
  };

  const isValidInput = () => {
    const num = parseInt(inputValue);
    return num > 0 && num <= 100 && !isNaN(num);
  };

  return (
    <Rows spacing="2u">
      <Title size="small">Design</Title>

      <Box padding="2u" borderRadius="standard" background="neutral">
        <Rows spacing="1u">
          <Text variant="bold">How many pages are in your design?</Text>

          {isEditing ? (
            <Rows spacing="1u">
              <TextInput
                value={inputValue}
                onChange={setInputValue}
                placeholder="Enter number of pages"
              />
              <Columns spacing="1u">
                <Column>
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={!isValidInput()}
                    stretch
                  >
                    Save
                  </Button>
                </Column>
                <Column>
                  <Button variant="secondary" onClick={handleCancel} stretch>
                    Cancel
                  </Button>
                </Column>
              </Columns>
              <Text tone="tertiary">Enter a number between 1 and 100</Text>
            </Rows>
          ) : (
            <Rows spacing="1u">
              <Text>
                Your design has{" "}
                <Text variant="bold">
                  {pageCount} page{pageCount !== 1 ? "s" : ""}
                </Text>
              </Text>
              <Button variant="secondary" onClick={handleEdit}>
                Update Page Count
              </Button>
            </Rows>
          )}
        </Rows>
      </Box>
    </Rows>
  );
};
