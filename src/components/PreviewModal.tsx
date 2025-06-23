import React, { useEffect } from "react";
import { Hotspot, Page } from "../types";

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotspots: Hotspot[];
  pages: Page[];
}

export const openPreviewWindow = (hotspots: Hotspot[], pages: Page[]) => {
  console.log("Opening preview window...");
  console.log("openPreviewWindow called with:", {
    hotspots: Array(hotspots.length),
    pages: Array(pages.length),
  });

  // Generate the HTML content for the preview
  const htmlContent = generatePreviewHTML(hotspots, pages);
  console.log("Generated HTML content length:", htmlContent.length);

  try {
    // First, try the normal window.open approach
    console.log("Attempting window.open...");
    const newWindow = window.open(
      "",
      "_blank",
      "width=1200,height=800,scrollbars=yes,resizable=yes",
    );
    console.log("window.open result:", newWindow);

    if (newWindow && !newWindow.closed) {
      // Success! Write content to the new window
      console.log("✅ New window opened successfully, writing content...");
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.focus();
      return;
    }
  } catch (error) {
    console.error("❌ window.open failed:", error);
  }

  // Fallback: Use blob URL approach for sandboxed environments
  console.log("🔄 Trying blob URL fallback for sandboxed iframe...");
  try {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const blobUrl = URL.createObjectURL(blob);
    console.log("Created blob URL:", blobUrl);

    // Try to open the blob URL
    const blobWindow = window.open(blobUrl, "_blank");
    console.log("Blob window result:", blobWindow);

    if (blobWindow && !blobWindow.closed) {
      console.log("✅ Blob URL opened successfully!");
      blobWindow.focus();

      // Clean up the blob URL after a delay
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        console.log("🧹 Cleaned up blob URL");
      }, 1000);
      return;
    }
  } catch (error) {
    console.error("❌ Blob URL approach failed:", error);
  }

  // Final fallback: Create a downloadable HTML file
  console.log("🔄 Final fallback: Creating downloadable HTML file...");
  try {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "prototype-preview.html";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    console.log("✅ HTML file download triggered!");
    alert(
      "Preview blocked by browser security. A preview HTML file has been downloaded instead. Open it in your browser to view the prototype.",
    );
  } catch (error) {
    console.error("❌ All preview methods failed:", error);
    alert(
      "Unable to open preview. Please check browser settings and try again.",
    );
  }
};

const generatePreviewHTML = (hotspots: Hotspot[], pages: Page[]): string => {
  const pageCount = pages.length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🧩 Prototype Preview</title>
    <style>
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
            width: 800px;
            height: 600px;
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

        .page-1 { background: linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%); }
        .page-2 { background: linear-gradient(45deg, #a8edea 0%, #fed6e3 100%); }
        .page-3 { background: linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%); }
        .page-4 { background: linear-gradient(45deg, #c3cfe2 0%, #c3cfe2 100%); }
        .page-5 { background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); }

        .page-content {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            color: #2d3748;
        }

        .page-title {
            font-size: 2rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }

        .page-subtitle {
            font-size: 1.1rem;
            opacity: 0.8;
        }

        .hotspot {
            position: absolute;
            background: rgba(59, 130, 246, 0.8);
            border: 2px solid #3b82f6;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 600;
            font-size: 0.8rem;
            text-align: center;
            padding: 0.25rem;
            width: 120px;
            height: 60px;
        }

        .hotspot:hover {
            background: rgba(59, 130, 246, 1);
            transform: scale(1.05);
            box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .footer {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .hotspot-count {
            color: #4a5568;
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
        }

        .close-btn:hover {
            background: #c53030;
        }

        @media (max-width: 900px) {
            .canvas {
                width: 90vw;
                height: 67.5vw;
                max-height: 600px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🧩 Prototype Preview</h1>
        <div class="page-counter">
            Page <span id="currentPage">1</span> of ${pageCount}
        </div>
        <button class="reset-btn" onclick="goToPage(1)">Reset</button>
    </div>

    <div class="instructions">
        Click on the red hotspots to navigate between pages • Click Reset to reset to page 1
    </div>

    <div class="canvas-container">
        <div class="canvas" id="canvas">
            ${pages
              .map((page, index) => {
                const pageNumber = index + 1;
                const pageHotspots = hotspots.filter(
                  (h) => h.targetPage !== pageNumber,
                );

                return `
                <div class="page page-${pageNumber} ${index === 0 ? "active" : ""}" data-page="${pageNumber}">
                    <div class="page-content">
                        <div class="page-title">Page ${pageNumber}</div>
                        <div class="page-subtitle">Interactive Prototype</div>
                    </div>
                    ${pageHotspots
                      .map(
                        (hotspot) => `
                        <div 
                            class="hotspot" 
                            style="top: ${20 + (hotspot.id.charCodeAt(0) % 5) * 100}px; left: ${50 + (hotspot.id.charCodeAt(1) % 6) * 110}px;"
                            onclick="goToPage(${hotspot.targetPage})"
                            title="Go to Page ${hotspot.targetPage}"
                        >
                            ${hotspot.elementIcon} ${hotspot.elementName}
                        </div>
                    `,
                      )
                      .join("")}
                </div>
              `;
              })
              .join("")}
        </div>
    </div>

    <div class="footer">
        <div class="hotspot-count">
            ${hotspots.length} hotspot${hotspots.length !== 1 ? "s" : ""} defined
        </div>
        <button class="close-btn" onclick="window.close()">✕ Close</button>
    </div>

    <script>
        let currentPage = 1;
        const totalPages = ${pageCount};

        function goToPage(pageNum) {
            if (pageNum < 1 || pageNum > totalPages) return;
            
            // Hide all pages
            document.querySelectorAll('.page').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show target page
            const targetPage = document.querySelector(\`.page[data-page="\${pageNum}"]\`);
            if (targetPage) {
                targetPage.classList.add('active');
                currentPage = pageNum;
                document.getElementById('currentPage').textContent = pageNum;
                console.log(\`Navigated to page \${pageNum}\`);
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            switch(e.key) {
                case 'Escape':
                    window.close();
                    break;
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

        console.log('🧩 Prototype Preview loaded successfully!');
        console.log('📊 Stats:', {
            totalPages: ${pageCount},
            totalHotspots: ${hotspots.length},
            hotspotsByPage: ${JSON.stringify(
              pages.reduce((acc, page, index) => {
                const pageNum = index + 1;
                acc[`page${pageNum}`] = hotspots.filter(
                  (h) => h.targetPage !== pageNum,
                ).length;
                return acc;
              }, {}),
            )}
        });
    </script>
</body>
</html>`;
};

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  hotspots,
  pages,
}) => {
  useEffect(() => {
    console.log("PreviewModal useEffect triggered:", {
      isOpen,
      hotspotsCount: hotspots.length,
      pagesCount: pages.length,
    });

    if (isOpen) {
      console.log("Opening preview window...");
      openPreviewWindow(hotspots, pages);
      onClose(); // Close the modal state immediately since we're opening a new window
    }
  }, [isOpen, hotspots, pages, onClose]);

  // This component doesn't render anything visible since we're opening a new window
  return null;
};
