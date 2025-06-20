// Core data structures for the Prototype Embedder app

export interface Hotspot {
  id: string;
  elementId: string;
  elementName: string;
  targetPage: number;
  elementIcon: string;
}

export interface SelectedElement {
  id: string;
  name: string;
  type: string;
}

export interface Page {
  value: string;
  label: string;
}

// Component prop interfaces
export interface HotspotCardProps {
  hotspot: Hotspot;
  isEditing: boolean;
  pages: Page[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPageChange: (id: string, newPage: string) => void;
}

export interface CurrentSelectionProps {
  selectedElement: SelectedElement | null;
  pages: Page[];
  onAddHotspot: (elementId: string, targetPage: number) => void;
}

export interface HotspotsManagerProps {
  hotspots: Hotspot[];
  pages: Page[];
  onEditHotspot: (id: string) => void;
  onDeleteHotspot: (id: string) => void;
  onUpdateHotspot: (id: string, newPage: string) => void;
  onAddNewHotspot: () => void;
}

export interface PreviewExportProps {
  hotspots: Hotspot[];
}

export interface AddHotspotButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

// App state interfaces
export interface AppState {
  hotspots: Hotspot[];
  selectedElement: SelectedElement | null;
  pages: Page[];
  editingHotspotId: string | null;
}

// Export data structure (for ZIP generation)
export interface ExportData {
  designId: string;
  hotspots: Array<{
    elementId: string;
    targetPage: number;
    boundingBox: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}
