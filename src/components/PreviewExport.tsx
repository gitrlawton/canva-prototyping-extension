import React, { useState, useMemo } from "react";
import { Rows, Text, Title, Button, Columns, Column } from "@canva/app-ui-kit";
import { requestExport } from "@canva/design";
import { PreviewExportProps } from "../types";
import { useFeatureSupport } from "../../utils/use_feature_support";

export const PreviewExport: React.FC<PreviewExportProps> = ({ hotspots }) => {
  const [isExporting, setIsExporting] = useState(false);
  const isSupported = useFeatureSupport();

  const hasHotspots = hotspots.length > 0;
  const isExportSupported = useMemo(
    () => isSupported(requestExport),
    [isSupported],
  );

  const handleExport = async () => {
    if (!hasHotspots) return;
    if (!isExportSupported) {
      alert(
        "Export is not available in this environment. Please use a supported Canva design context.",
      );
      return;
    }

    setIsExporting(true);

    try {
      console.log("Starting prototype export...");

      // For multi-page designs, PNG export returns a ZIP file with individual page images
      // This is easier to handle than PDF conversion, so we'll use PNG directly
      console.log(
        "Exporting design as PNG (multi-page designs will be returned as ZIP)...",
      );
      const exportResult = await requestExport({
        acceptedFileTypes: ["png"],
      });

      if (exportResult.status === "aborted") {
        console.log("User cancelled the export");
        return;
      }

      if (exportResult.status !== "completed") {
        throw new Error("Failed to export design as PNG");
      }

      console.log("PNG export successful:", exportResult);
      console.log(`Export result analysis:`, {
        totalBlobs: exportResult.exportBlobs.length,
        blobUrls: exportResult.exportBlobs.map(
          (blob, i) => `Blob ${i + 1}: ${blob.url.substring(0, 50)}...`,
        ),
      });

      // Analyze the export result
      if (exportResult.exportBlobs.length === 1) {
        if (exportResult.exportBlobs[0].url.includes(".zip")) {
          console.log(
            "✅ Multi-page design detected: PNG export returned ZIP file containing individual page images",
          );
        } else {
          console.log(
            "📄 Single-page design detected: PNG export returned single image file",
          );
        }
      } else {
        console.log(
          `✅ Multiple files exported directly (${exportResult.exportBlobs.length} files)`,
        );
      }

      // Generate the prototype files
      console.log("Generating prototype files...");
      await generatePrototypeZip(
        exportResult.exportBlobs,
        hotspots,
        exportResult.title || "Canva Prototype",
      );

      console.log("Prototype export completed successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      alert(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Rows spacing="2u">
      <Title size="small">Export</Title>

      <Button
        variant="primary"
        stretch
        onClick={handleExport}
        disabled={!hasHotspots || !isExportSupported || isExporting}
      >
        {isExporting ? "Exporting..." : "Export ZIP"}
      </Button>
    </Rows>
  );
};

// Generate and download the prototype ZIP file
const generatePrototypeZip = async (
  exportBlobs: Array<{ url: string }>,
  hotspots: any[],
  designTitle: string,
) => {
  console.log("Generating prototype ZIP with:", {
    exportBlobs,
    hotspots,
    designTitle,
  });
  console.log(`📊 Export analysis:`, {
    totalExportedImages: exportBlobs.length,
    totalHotspots: hotspots.length,
    hotspotTargetPages: hotspots.map((h) => ({
      name: h.elementName,
      targetPage: h.targetPage,
    })),
  });

  // Determine the actual number of pages needed
  const maxTargetPage =
    hotspots.length > 0 ? Math.max(...hotspots.map((h) => h.targetPage)) : 1;
  const actualPages = Math.max(exportBlobs.length, maxTargetPage);

  console.log(`📄 Page analysis:`, {
    exportedPages: exportBlobs.length,
    maxHotspotTargetPage: maxTargetPage,
    finalPageCount: actualPages,
  });

  if (actualPages > exportBlobs.length) {
    console.warn(
      `⚠️ Hotspots reference ${maxTargetPage} pages but only ${exportBlobs.length} exported.`,
    );
    console.log(
      `💡 Creating placeholder pages ${exportBlobs.length + 1} to ${actualPages} for navigation.`,
    );
  }

  try {
    // Import JSZip dynamically
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // Step 1: Download and process the exported files
    console.log("Downloading exported files...");
    let images: Array<{ index: number; data: Blob }> = [];

    for (let i = 0; i < exportBlobs.length; i++) {
      const blob = exportBlobs[i];
      const response = await fetch(blob.url);
      if (!response.ok) {
        throw new Error(`Failed to download file ${i + 1}`);
      }
      const fileData = await response.blob();

      // Check if this is a ZIP file (multi-page export)
      if (blob.url.includes(".zip") || fileData.type === "application/zip") {
        console.log(`📦 Processing ZIP file from Canva (multi-page export)`);

        // Extract images from the ZIP
        const canvaZip = await JSZip.loadAsync(fileData);
        const zipEntries = Object.keys(canvaZip.files);
        console.log(`Found ${zipEntries.length} files in ZIP:`, zipEntries);

        // Extract image files and sort them by name
        const imageFiles = zipEntries
          .filter((name) => name.match(/\.(png|jpg|jpeg)$/i))
          .sort(); // Sort to maintain page order

        console.log(`Extracting ${imageFiles.length} images from ZIP`);

        for (let j = 0; j < imageFiles.length; j++) {
          const imageBlob = await canvaZip.files[imageFiles[j]].async("blob");
          images.push({ index: j, data: imageBlob });
        }
      } else {
        // Single image file
        console.log(`📄 Processing single image file`);
        images.push({ index: i, data: fileData });
      }
    }

    console.log(`Processed ${images.length} total images`);

    // Step 2: Add images to ZIP (including placeholders if needed)
    for (let pageNum = 1; pageNum <= actualPages; pageNum++) {
      const imageIndex = pageNum - 1;
      if (imageIndex < images.length) {
        // Use actual exported image
        zip.file(`slides/page${pageNum}.png`, images[imageIndex].data);
        console.log(`Added actual image for page ${pageNum}`);
      } else {
        // Create placeholder page
        const placeholderImage = await createPlaceholderImage(
          pageNum,
          designTitle,
        );
        zip.file(`slides/page${pageNum}.png`, placeholderImage);
        console.log(`Added placeholder image for page ${pageNum}`);
      }
    }

    // Step 3: Generate hotspot.json
    const hotspotData = {
      designId: "canva-prototype",
      designTitle: designTitle,
      exportedAt: new Date().toISOString(),
      totalPages: actualPages,
      hotspots: hotspots.map((hotspot, index) => ({
        elementId: hotspot.elementId,
        elementName: hotspot.elementName,
        sourcePage: hotspot.sourcePage,
        targetPage: hotspot.targetPage,
        // Generate better positioning to spread hotspots across the page
        boundingBox: {
          x: 150 + (index % 2) * 350 + (hotspot.id.charCodeAt(0) % 100), // Spread horizontally in 2 columns
          y:
            150 + Math.floor(index / 2) * 200 + (hotspot.id.charCodeAt(1) % 80), // Spread vertically with more space
          width: 140,
          height: 70,
        },
      })),
    };

    console.log(`📋 Generated hotspot data:`, {
      totalPages: hotspotData.totalPages,
      hotspots: hotspotData.hotspots.map((h) => ({
        name: h.elementName,
        sourcePage: h.sourcePage,
        targetPage: h.targetPage,
        position: `${h.boundingBox.x}, ${h.boundingBox.y}`,
      })),
    });

    zip.file("hotspot.json", JSON.stringify(hotspotData, null, 2));

    // Step 4: Generate the HTML viewer
    const htmlContent = generateViewerHTML(hotspots, actualPages, designTitle);
    zip.file("index.html", htmlContent);

    // Step 5: Add CSS and JS files
    zip.file("style.css", generateCSS());
    zip.file("prototype.js", generateJS());

    // Step 6: Generate the ZIP
    console.log("Generating ZIP file...");
    const zipBlob = await zip.generateAsync({ type: "blob" });

    // Step 7: Create a blob URL and show it to the user
    const blobUrl = URL.createObjectURL(zipBlob);
    const fileName = `${designTitle.replace(/[^a-zA-Z0-9]/g, "_")}_prototype.zip`;

    console.log("Prototype ZIP generated successfully!");

    // Show the user the download link since automatic download is blocked
    const downloadMessage =
      `🎉 Prototype ZIP generated successfully!\n\n` +
      `File: ${fileName}\n` +
      `Size: ${(zipBlob.size / 1024 / 1024).toFixed(2)} MB\n` +
      `Pages: ${actualPages} (${exportBlobs.length} exported + ${actualPages - exportBlobs.length} placeholders)\n` +
      `Hotspots: ${hotspots.length}\n\n` +
      (actualPages > exportBlobs.length
        ? `Note: Placeholder pages were created for pages ${exportBlobs.length + 1}-${actualPages} to support your hotspot navigation.\n\n`
        : "") +
      `Due to browser security restrictions, please:\n` +
      `1. Right-click the link that will appear\n` +
      `2. Select "Save link as..." or "Download linked file"\n` +
      `3. Save it to your desired location\n\n` +
      `The link will be copied to your clipboard as well.`;

    alert(downloadMessage);

    // Copy the blob URL to clipboard
    try {
      await navigator.clipboard.writeText(blobUrl);
      console.log("Blob URL copied to clipboard");
    } catch (clipboardError) {
      console.log("Could not copy to clipboard:", clipboardError);
    }

    // Create a visible link element that the user can right-click
    const linkElement = document.createElement("a");
    linkElement.href = blobUrl;
    linkElement.download = fileName;
    linkElement.textContent = `Right-click and open new tab to download ${fileName}`;
    linkElement.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      z-index: 10000;
      background: #4299e1;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: bold;
      box-shadow: 0 4px 12px rgba(66, 153, 225, 0.3);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    // Add the link to the page
    document.body.appendChild(linkElement);

    // Remove the link after 60 seconds
    setTimeout(() => {
      document.body.removeChild(linkElement);
      URL.revokeObjectURL(blobUrl);
      console.log("Download link removed and blob URL cleaned up");
    }, 60000);

    // Also try the traditional download approach as a fallback
    try {
      linkElement.click();
    } catch (clickError) {
      console.log("Automatic click failed (expected in sandbox):", clickError);
    }
  } catch (error) {
    console.error("Failed to generate prototype ZIP:", error);
    throw error;
  }
};

// Create a placeholder image for missing pages
const createPlaceholderImage = async (
  pageNumber: number,
  designTitle: string,
): Promise<Blob> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 600;
    const ctx = canvas.getContext("2d")!;

    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);

    // Add text
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(`Page ${pageNumber}`, 400, 250);

    ctx.font = "24px Arial";
    ctx.fillText(`${designTitle}`, 400, 300);

    ctx.font = "18px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.fillText("This page was not exported from Canva", 400, 350);
    ctx.fillText("Placeholder created for navigation testing", 400, 380);

    canvas.toBlob((blob) => {
      resolve(blob!);
    }, "image/png");
  });
};

// Generate the HTML viewer content
const generateViewerHTML = (
  hotspots: any[],
  pageCount: number,
  title: string,
): string => {
  // Generate the hotspot data to embed directly in the HTML
  const hotspotData = {
    designId: "canva-prototype",
    designTitle: title,
    exportedAt: new Date().toISOString(),
    totalPages: pageCount,
    hotspots: hotspots.map((hotspot, index) => ({
      elementId: hotspot.elementId,
      elementName: hotspot.elementName,
      sourcePage: hotspot.sourcePage,
      targetPage: hotspot.targetPage,
      // Generate better positioning to spread hotspots across the page
      boundingBox: {
        x: 150 + (index % 2) * 350 + (hotspot.id.charCodeAt(0) % 100), // Spread horizontally in 2 columns
        y: 150 + Math.floor(index / 2) * 200 + (hotspot.id.charCodeAt(1) % 80), // Spread vertically with more space
        width: 140,
        height: 70,
      },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Interactive Prototype</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="header">
        <h1>Prototype Viewer</h1>
        <div class="page-counter">
            Page <span id="currentPage">1</span> of ${pageCount}
        </div>
        <button class="reset-btn" onclick="goToPage(1)">Reset</button>
    </div>

    <div class="instructions">
        Click on the red hotspots to navigate between pages • Press Reset to reset to page 1
    </div>

    <div class="canvas-container">
        <div class="canvas" id="canvas">
            ${Array.from({ length: pageCount }, (_, i) => {
              const pageNumber = i + 1;
              return `
                <div class="page ${i === 0 ? "active" : ""}" data-page="${pageNumber}">
                    <img src="slides/page${pageNumber}.png" alt="Page ${pageNumber}" class="page-image">
                    <div id="hotspots-${pageNumber}" class="hotspots-layer"></div>
                </div>
              `;
            }).join("")}
        </div>
    </div>

    <div class="footer">
        <div class="hotspot-navigation" id="hotspot-navigation">
            <!-- Hotspots will be dynamically populated based on current page -->
        </div>
    </div>

    <!-- Embed hotspot data directly in the HTML -->
    <script type="application/json" id="hotspot-data">
${JSON.stringify(hotspotData, null, 2)}
    </script>

    <script src="prototype.js"></script>
</body>
</html>`;
};

// Generate CSS content
const generateCSS = (): string => {
  return `/* Prototype Viewer Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    color: #333;
}

.header {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
}

.page-counter {
    background: #4299e1;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-weight: 500;
}

.reset-btn {
    background: #48bb78;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
}

.reset-btn:hover {
    background: #38a169;
}

.instructions {
    background: rgba(255, 255, 255, 0.9);
    padding: 0.75rem 2rem;
    text-align: center;
    font-size: 0.9rem;
    color: #4a5568;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.canvas-container {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
}

.canvas {
    max-width: 90vw;
    max-height: 70vh;
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    position: relative;
    overflow: hidden;
}

.page {
    width: 100%;
    height: 100%;
    display: none;
    position: relative;
}

.page.active {
    display: block;
}

.page-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
}

.hotspots-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
}

.hotspot {
    position: absolute;
    background: rgba(255, 69, 0, 0.95);
    border: 4px solid #ff4500;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 0.9rem;
    text-align: center;
    padding: 0.75rem;
    min-width: 140px;
    min-height: 70px;
    max-width: 200px;
    pointer-events: auto;
    box-shadow: 0 4px 16px rgba(255, 69, 0, 0.4);
    z-index: 20;
    /* Ensure hotspots are always visible */
    opacity: 1 !important;
    visibility: visible !important;
    /* Make them stand out more */
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.5px;
}

.hotspot:hover {
    background: rgba(255, 69, 0, 1);
    transform: scale(1.15);
    box-shadow: 0 6px 20px rgba(255, 69, 0, 0.6);
    border-color: #ff6500;
}

.hotspot:active {
    transform: scale(0.95);
}

/* Debug mode - shows hotspot positioning clearly */
.footer {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    padding: 1rem 2rem;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
}

.hotspot-navigation {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    flex: 1;
    justify-content: center;
    align-items: center;
}

.footer-hotspot {
    /* Inherit the original hotspot styling but adapt for footer */
    position: relative !important;
    background: rgba(255, 69, 0, 0.95);
    border: 4px solid #ff4500;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 900;
    font-size: 0.85rem;
    text-align: center;
    padding: 0.75rem 1rem;
    min-width: 120px;
    min-height: 60px;
    box-shadow: 0 4px 16px rgba(255, 69, 0, 0.4);
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    letter-spacing: 0.5px;
    white-space: nowrap;
}

.footer-hotspot:hover {
    background: rgba(255, 69, 0, 1);
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(255, 69, 0, 0.6);
    border-color: #ff6500;
}

.footer-hotspot:active {
    transform: scale(0.98);
}

.no-hotspots {
    color: #a0aec0;
    font-style: italic;
    font-size: 0.9rem;
}

.close-btn {
    background: #e53e3e;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background 0.2s;
    white-space: nowrap;
}

.close-btn:hover {
    background: #c53030;
}

/* Responsive adjustments */
@media (max-width: 900px) {
    .canvas {
        max-width: 95vw;
        max-height: 60vh;
    }
    
    .hotspot {
        font-size: 0.8rem;
        min-width: 100px;
        min-height: 50px;
        padding: 0.5rem;
    }
    
    .footer {
        flex-direction: column;
        gap: 0.75rem;
        padding: 1rem;
    }
    
    .hotspot-navigation {
        justify-content: center;
    }
    
    .footer-hotspot {
        font-size: 0.8rem;
        padding: 0.6rem 0.8rem;
        min-width: 100px;
        min-height: 50px;
    }
}

/* Ensure hotspots are visible on all screen sizes */
@media (max-width: 600px) {
    .hotspot {
        font-size: 0.7rem;
        min-width: 80px;
        min-height: 40px;
        padding: 0.4rem;
    }
    
    .footer-hotspot {
        font-size: 0.75rem;
        padding: 0.5rem 0.6rem;
        min-width: 80px;
        min-height: 40px;
    }
    
    .footer {
        padding: 0.75rem;
    }
}`;
};

// Generate JavaScript content
const generateJS = (): string => {
  return `// Prototype Viewer JavaScript
let currentPage = 1;
let totalPages = 1;
let hotspots = [];

// Load hotspot data from embedded script tag
function loadHotspotData() {
    try {
        console.log('Loading embedded hotspot data...');
        const dataScript = document.getElementById('hotspot-data');
        if (!dataScript) {
            throw new Error('Hotspot data script not found');
        }
        
        const data = JSON.parse(dataScript.textContent);
        hotspots = data.hotspots;
        totalPages = data.totalPages;
        console.log('Loaded embedded prototype data:', data);
        
        // Wait for images to load before positioning hotspots
        waitForImages().then(() => {
            initializeHotspots();
        });
    } catch (error) {
        console.error('Failed to load embedded hotspot data:', error);
        // Fallback: try to load from external file
        loadExternalHotspotData();
    }
}

// Fallback: try to load from external JSON file
async function loadExternalHotspotData() {
    try {
        console.log('Trying to load external hotspot.json...');
        const response = await fetch('hotspot.json');
        const data = await response.json();
        hotspots = data.hotspots;
        totalPages = data.totalPages;
        console.log('Loaded external prototype data:', data);
        
        await waitForImages();
        initializeHotspots();
    } catch (error) {
        console.error('Failed to load external hotspot data:', error);
        alert('Hotspot data could not be loaded. The prototype may not work correctly.');
    }
}

// Wait for all images to load
function waitForImages() {
    return new Promise((resolve) => {
        const images = document.querySelectorAll('.page-image');
        let loadedCount = 0;
        
        console.log(\`Waiting for \${images.length} images to load...\`);
        
        if (images.length === 0) {
            console.log('No images found, proceeding...');
            resolve();
            return;
        }
        
        images.forEach((img, index) => {
            if (img.complete) {
                loadedCount++;
                console.log(\`Image \${index + 1} already loaded\`);
                if (loadedCount === images.length) {
                    console.log('All images loaded!');
                    resolve();
                }
            } else {
                img.onload = () => {
                    loadedCount++;
                    console.log(\`Image \${index + 1} loaded (\${loadedCount}/\${images.length})\`);
                    if (loadedCount === images.length) {
                        console.log('All images loaded!');
                        resolve();
                    }
                };
                img.onerror = () => {
                    console.error(\`Failed to load image \${index + 1}: \${img.src}\`);
                    loadedCount++;
                    if (loadedCount === images.length) {
                        console.log('All images processed (some may have failed)');
                        resolve();
                    }
                };
            }
        });
    });
}

function initializeHotspots() {
    console.log('Initializing footer hotspots:', hotspots);
    
    if (!hotspots || hotspots.length === 0) {
        console.warn('No hotspots to initialize');
        updateFooterHotspots(1); // Show empty state for page 1
        return;
    }
    
    console.log(\`✅ Footer hotspots initialized successfully! \${hotspots.length} total hotspots available.\`);
    
    // Update footer for the initial page (page 1)
    updateFooterHotspots(1);
}

function updateFooterHotspots(pageNumber) {
    console.log(\`Updating footer hotspots for page \${pageNumber}\`);
    
    const footerNavigation = document.getElementById('hotspot-navigation');
    if (!footerNavigation) {
        console.error('Footer navigation element not found');
        return;
    }
    
    // Filter hotspots for the current page
    const pageHotspots = hotspots.filter(h => h.sourcePage === pageNumber);
    console.log(\`Page \${pageNumber} has \${pageHotspots.length} hotspots:\`, pageHotspots);
    
    // Clear existing hotspots
    footerNavigation.innerHTML = '';
    
    if (pageHotspots.length === 0) {
        footerNavigation.innerHTML = '<div class="no-hotspots">No hotspots on this page</div>';
        return;
    }
    
    // Create footer hotspots for this page
    pageHotspots.forEach((hotspot, index) => {
        const hotspotEl = document.createElement('div');
        hotspotEl.className = 'hotspot footer-hotspot';
        hotspotEl.title = \`Go to Page \${hotspot.targetPage}\`;
        hotspotEl.textContent = \`\${hotspot.elementName}\`;
        
        // Add click handler
        const targetPage = hotspot.targetPage;
        hotspotEl.addEventListener('click', function(event) {
            console.log(\`🖱️ Footer hotspot clicked: "\${hotspot.elementName}" -> Page \${targetPage}\`);
            event.preventDefault();
            event.stopPropagation();
            goToPage(targetPage);
        });
        
        footerNavigation.appendChild(hotspotEl);
        console.log(\`Added footer hotspot: "\${hotspot.elementName}" -> Page \${targetPage}\`);
    });
    
    console.log(\`✅ Updated footer with \${pageHotspots.length} hotspots for page \${pageNumber}\`);
}

function goToPage(pageNum) {
    console.log(\`🔄 goToPage called with pageNum: \${pageNum}\`);
    
    if (pageNum < 1 || pageNum > totalPages) {
        console.error(\`❌ Invalid page number: \${pageNum} (valid range: 1-\${totalPages})\`);
        return;
    }
    
    console.log(\`📄 Navigating from page \${currentPage} to page \${pageNum}\`);
    
    // Hide all pages
    const allPages = document.querySelectorAll('.page');
    console.log(\`Found \${allPages.length} pages to hide\`);
    
    allPages.forEach((page, index) => {
        page.classList.remove('active');
        console.log(\`Hidden page \${index + 1}\`);
    });
    
    // Show target page
    const targetPage = document.querySelector(\`.page[data-page="\${pageNum}"]\`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageNum;
        const pageCounter = document.getElementById('currentPage');
        if (pageCounter) {
            pageCounter.textContent = pageNum;
        }
        
        // Update footer hotspots for the new page
        updateFooterHotspots(pageNum);
        
        console.log(\`✅ Successfully navigated to page \${pageNum}\`);
        
        // Verify the page is actually visible
        setTimeout(() => {
            const activePages = document.querySelectorAll('.page.active');
            console.log(\`Active pages after navigation: \${activePages.length}\`);
            if (activePages.length === 1) {
                console.log(\`✅ Navigation successful - page \${pageNum} is now active\`);
            } else {
                console.error(\`❌ Navigation failed - \${activePages.length} active pages found\`);
            }
        }, 50);
    } else {
        console.error(\`❌ Could not find page element with data-page="\${pageNum}"\`);
        
        // Debug: show all available pages
        const allPageElements = document.querySelectorAll('.page');
        console.log('Available pages:');
        allPageElements.forEach((page, index) => {
            console.log(\`  Page \${index + 1}: data-page="\${page.getAttribute('data-page')}"\`);
        });
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'Home':
        case '1':
            goToPage(1);
            break;
        case 'ArrowLeft':
            if (currentPage > 1) goToPage(currentPage - 1);
            break;
        case 'ArrowRight':
            if (currentPage < totalPages) goToPage(currentPage + 1);
            break;
    }
});

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('🧩 Prototype Viewer loading...');
    loadHotspotData();
});

// Fallback initialization
window.addEventListener('load', function() {
    console.log('Window loaded, checking if hotspots are initialized...');
    if (hotspots.length === 0) {
        console.log('Hotspots not loaded yet, trying again...');
        setTimeout(loadHotspotData, 500);
    }
});

console.log('🧩 Prototype Viewer script loaded!');`;
};
