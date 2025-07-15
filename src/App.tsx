import { useState, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { Card } from '@/components/ui/card';
import QRCode from 'qrcode';
import { HexColorPicker } from 'react-colorful';
import Silk from './components/Silk';

function App() {
  const [text, setText] = useState('https://github.com/k4lips0');
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#F3F4F6');
  const [rounding, setRounding] = useState(0);

  // Color picker states
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFgPicker, setShowFgPicker] = useState(false);

  // Refs for click outside detection
  const bgPickerRef = useRef<HTMLDivElement>(null);
  const fgPickerRef = useRef<HTMLDivElement>(null);

  // Color palette - simplified to 2 colors
  const backgroundColors = ['#F3F4F6', '#E5E7EB', '#D1D5DB', '#FEF3C7', '#F3E8FF', '#ECFDF5'];
  const qrColors = ['#000000', '#762C43', '#051681', '#2658C9', '#7961D3', '#991B1B'];

  // New state for the QR code matrix
  const [qrMatrix, setQrMatrix] = useState<boolean[][]>([]);

  // Generate random colors for both background and QR code
  const randomizeColors = () => {
    const randomBgColor = backgroundColors[Math.floor(Math.random() * backgroundColors.length)];
    const randomQrColor = qrColors[Math.floor(Math.random() * qrColors.length)];
    setBgColor(randomBgColor);
    setFgColor(randomQrColor);
  };

  // Click outside detection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bgPickerRef.current && !bgPickerRef.current.contains(event.target as Node)) {
        setShowBgPicker(false);
      }
      if (fgPickerRef.current && !fgPickerRef.current.contains(event.target as Node)) {
        setShowFgPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle color pickers
  const toggleBgPicker = () => {
    setShowBgPicker(!showBgPicker);
    setShowFgPicker(false);
  };

  const toggleFgPicker = () => {
    setShowFgPicker(!showFgPicker);
    setShowBgPicker(false);
  };

  // Function to generate the QR code matrix
  useEffect(() => {
    if (!text) {
      setQrMatrix([]);
      return;
    }
    try {
      // Use qrcode.create to get the QR object
      const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
      const moduleCount = qr.modules.size;
      const matrix: boolean[][] = [];
      for (let r = 0; r < moduleCount; r++) {
        matrix[r] = [];
        for (let c = 0; c < moduleCount; c++) {
          matrix[r][c] = qr.modules.data[r * moduleCount + c];
        }
      }
      setQrMatrix(matrix);
    } catch (error) {
      console.error("Error generating QR matrix:", error);
      setQrMatrix([]);
    }
  }, [text]); // Regenerate matrix when text changes

  // Function to generate SVG path based on matrix and rounding
  const generateSvgPath = (matrix: boolean[][], roundingValue: number, baseModuleSize: number) => {
    if (matrix.length === 0) return '';

    const moduleScale = 1.05; // Slightly increase module size to create overlap
    const moduleSize = baseModuleSize * moduleScale;
    const radius = moduleSize * roundingValue;
    let path = '';

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix.length; c++) {
        if (!matrix[r][c]) continue; // Only draw dark modules

        const x = c * baseModuleSize - (moduleSize - baseModuleSize) / 2; // Adjust position for scaling
        const y = r * baseModuleSize - (moduleSize - baseModuleSize) / 2; // Adjust position for scaling

        // Check neighbors
        const top = r > 0 && matrix[r - 1][c];
        const bottom = r < matrix.length - 1 && matrix[r + 1][c];
        const left = c > 0 && matrix[r][c - 1];
        const right = c < matrix.length - 1 && matrix[r][c + 1];

        // Check diagonal neighbors for smart rounding
        const topLeft = r > 0 && c > 0 && matrix[r - 1][c - 1];
        const topRight = r > 0 && c < matrix.length - 1 && matrix[r - 1][c + 1];
        const bottomLeft = r < matrix.length - 1 && c > 0 && matrix[r + 1][c - 1];
        const bottomRight = r < matrix.length - 1 && c < matrix.length - 1 && matrix[r + 1][c + 1];

        // Determine if a corner should be sharp (connected to another module)
        const sharpTopLeft = top || left || topLeft;
        const sharpTopRight = top || right || topRight;
        const sharpBottomLeft = bottom || left || bottomLeft;
        const sharpBottomRight = bottom || right || bottomRight;

        let d = '';

        // Start at top-left (or rounded start)
        if (!sharpTopLeft) {
            d += `M${x + radius},${y}`;
        } else {
            d += `M${x},${y}`;
        }

        // Top edge
        if (!sharpTopRight) {
            d += `L${x + moduleSize - radius},${y}`;
            d += `A${radius},${radius},0,0,1,${x + moduleSize},${y + radius}`;
        } else {
            d += `L${x + moduleSize},${y}`;
        }

        // Right edge
        if (!sharpBottomRight) {
            d += `L${x + moduleSize},${y + moduleSize - radius}`;
            d += `A${radius},${radius},0,0,1,${x + moduleSize - radius},${y + moduleSize}`;
        } else {
            d += `L${x + moduleSize},${y + moduleSize}`;
        }

        // Bottom edge
        if (!sharpBottomLeft) {
            d += `L${x + radius},${y + moduleSize}`;
            d += `A${radius},${radius},0,0,1,${x},${y + moduleSize - radius}`;
        } else {
            d += `L${x},${y + moduleSize}`;
        }

        // Left edge
        if (!sharpTopLeft) {
            d += `L${x},${y + radius}`;
            d += `A${radius},${radius},0,0,1,${x + radius},${y}`;
        } else {
            d += `L${x},${y}`;
        }
        d += `Z`;
        path += `<path d="${d}" />`;
      }
    }
    return path;
  };

  // Memoized SVG string
  const qrCodeSvg = useMemo(() => {
    const baseModuleSize = 10; // Base size for each QR module
    const size = qrMatrix.length * baseModuleSize;
    const viewBoxMargin = size * 0.1; // 10% margin
    const effectiveSize = size + (viewBoxMargin * 2);

    const path = generateSvgPath(qrMatrix, rounding, baseModuleSize);

    if (qrMatrix.length === 0) {
      return `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; color:#6b7280;">Enter text to generate a QR code</div>`;
    }

    return `<svg width="100%" height="100%" viewBox="${-viewBoxMargin} ${-viewBoxMargin} ${effectiveSize} ${effectiveSize}" style="background-color: ${bgColor};" fill="${fgColor}">${path}</svg>`;
  }, [qrMatrix, rounding, fgColor, bgColor]);


  const downloadQR = async () => {
    try {
      // Generate QR code directly as canvas/PNG
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, {
        width: 1024,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: 'H'
      });

      // Download the canvas as PNG
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.download = 'qrcode.png';
          link.href = url;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png', 1.0);
    } catch (error) {
      console.error('Error generating PNG:', error);
    }
  };

  return (
    <div className="app-container">
      <Silk speed={5} scale={1} color="#7B7481" noiseIntensity={1.5} rotation={0} />
      <div className="main-content-overlay">
        <div className="layout-grid">
          
          {/* QR Code Display */}
          <div className="qr-code-display-panel">
            <div dangerouslySetInnerHTML={{ __html: qrCodeSvg }} className="qr-code-svg-container"></div>
          </div>

          {/* Controls Panel */}
          <Card className="controls-panel">
            
            {/* URL Section */}
            <div className="url-section">
              <label htmlFor="text" className="url-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '0.5rem' }}>
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                Your URL or text
              </label>
              <input
                id="text"
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com"
                className="url-input"
                maxLength={999}
              />
            </div>

            <hr className="separator" />

            {/* Color Section */}
            <div className="color-section">
              <div className="color-section-header">
                <h3 className="section-title">Colors</h3>
                <div className="color-actions">
                  <button className="action-button" onClick={randomizeColors} title="Randomize colors">
                    <span className="material-symbols-outlined">shuffle</span>
                  </button>
                </div>
              </div>
              
              <div className="color-controls">
                <div className="color-control">
                  <div className="color-input-wrapper" style={{ position: 'relative' }}>
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: bgColor }}
                      onClick={toggleBgPicker}
                    ></div>
                    <input
                      type="text"
                      value={bgColor.replace('#', '')}
                      onChange={(e) => setBgColor('#' + e.target.value)}
                      className="color-hex-input"
                      placeholder="FFFFFF"
                    />
                    {showBgPicker && (
                      <div ref={bgPickerRef} className="color-picker-popup">
                        <HexColorPicker color={bgColor} onChange={setBgColor} />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="color-control">
                  <div className="color-input-wrapper" style={{ position: 'relative' }}>
                    <div 
                      className="color-swatch" 
                      style={{ backgroundColor: fgColor }}
                      onClick={toggleFgPicker}
                    ></div>
                    <input
                      type="text"
                      value={fgColor.replace('#', '')}
                      onChange={(e) => setFgColor('#' + e.target.value)}
                      className="color-hex-input"
                      placeholder="000000"
                    />
                    {showFgPicker && (
                      <div ref={fgPickerRef} className="color-picker-popup">
                        <HexColorPicker color={fgColor} onChange={setFgColor} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr className="separator" />

            {/* Rounding Section */}
            <div className="rounding-section">
              <label htmlFor="rounding" className="rounding-label">Border radius · {Math.round(rounding * 100)}%</label>
              <input
                id="rounding"
                type="range"
                min="0"
                max="0.5"
                step="0.01"
                value={rounding}
                onChange={(e) => setRounding(parseFloat(e.target.value))}
                className="rounding-slider"
              />
            </div>

            {/* Download Button */}
            <div className="download-section">
              <a onClick={downloadQR} className="download-link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15L12 3M12 15L8 11M12 15L16 11M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                <span>Download</span>
              </a>
              <a href="https://github.com/k4lips0" target="_blank" rel="noopener noreferrer" className="github-link">
                <span>GitHub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17L17 7"/>
                  <path d="M7 7h10v10"/>
                </svg>
              </a>
            </div>

          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;