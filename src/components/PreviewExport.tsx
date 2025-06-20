import React, { useState } from "react";
import { Rows, Text, Title, Button, Columns, Column } from "@canva/app-ui-kit";

interface Hotspot {
  id: string;
  elementId: string;
  elementName: string;
  targetPage: number;
  elementIcon: string;
}

interface PreviewExportProps {
  hotspots: Hotspot[];
}

export const PreviewExport: React.FC<PreviewExportProps> = ({ hotspots }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const hasHotspots = hotspots.length > 0;
  const isReady = hasHotspots;

  const handlePreview = () => {
    if (!hasHotspots) return;

    setIsPreviewOpen(true);
    // TODO: Open preview modal/window with interactive prototype
    console.log("Opening preview with hotspots:", hotspots);

    // Mock preview window - in real implementation this would open a modal
    setTimeout(() => {
      setIsPreviewOpen(false);
      console.log("Preview window closed");
    }, 2000);
  };

  const handleExport = async () => {
    if (!hasHotspots) return;

    setIsExporting(true);

    try {
      // TODO: Implement actual export logic
      // 1. Fetch slide images via Canva Connect API
      // 2. Generate hotspot.json file
      // 3. Create HTML/JS/CSS files
      // 4. Bundle everything with JSZip
      // 5. Trigger download

      console.log("Exporting prototype with hotspots:", hotspots);

      // Mock export process
      await new Promise((resolve) => setTimeout(resolve, 3000));

      console.log("Export completed successfully!");
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusIcon = () => {
    if (isExporting) return "⏳";
    if (!hasHotspots) return "⚠️";
    return "✅";
  };

  const getStatusText = () => {
    if (isExporting) return "Generating prototype...";
    if (!hasHotspots) return "Add hotspots to enable export";
    return "Ready to export";
  };

  return (
    <Rows spacing="2u">
      <Title size="small">👁️ Preview & Export</Title>

      <Rows spacing="1u">
        <Button
          variant="secondary"
          stretch
          onClick={handlePreview}
          disabled={!hasHotspots || isPreviewOpen}
        >
          {isPreviewOpen ? "Preview Opening..." : "🔍 Preview Prototype"}
        </Button>

        <Button
          variant="primary"
          stretch
          onClick={handleExport}
          disabled={!hasHotspots || isExporting}
        >
          {isExporting ? "Exporting..." : "📥 Export ZIP"}
        </Button>
      </Rows>

      <Columns spacing="1u" alignY="center">
        <Column width="content">
          <Text>{getStatusIcon()}</Text>
        </Column>
        <Column>
          <Rows spacing="0.5u">
            <Text variant="bold" tone="tertiary">
              Status: {getStatusText()}
            </Text>
            <Text tone="tertiary">
              {hotspots.length} hotspot{hotspots.length !== 1 ? "s" : ""}{" "}
              defined
            </Text>
          </Rows>
        </Column>
      </Columns>
    </Rows>
  );
};
