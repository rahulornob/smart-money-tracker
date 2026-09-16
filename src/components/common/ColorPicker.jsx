import React, { useRef, useState } from 'react';
import { IconCheck, IconColorPicker, IconPalette } from '@tabler/icons-react';

const CURATED_COLORS = [
  '#B8A9F4', // Soft Pastel Lavender
  '#86EFAC', // Soft Pastel Mint
  '#93C5FD', // Soft Pastel Sky Blue
  '#FCD34D', // Soft Pastel Butter
  '#FDBA74', // Soft Pastel Peach
  '#FDA4AF', // Soft Pastel Blush Rose
  '#A5B4FC', // Soft Pastel Periwinkle
];

const getCheckColor = (hex) => {
  const clean = (hex || '').replace('#', '');
  if (clean.length !== 6) return '#FFFFFF';
  const r = parseInt(clean.slice(0, 2), 16) || 0;
  const g = parseInt(clean.slice(2, 4), 16) || 0;
  const b = parseInt(clean.slice(4, 6), 16) || 0;
  const lum = (r * 299 + g * 587 + b * 114) / 1000;
  return lum > 175 ? '#13141a' : '#FFFFFF';
};

export default function ColorPicker({ value, onChange, label = 'Card Accent Color' }) {
  const [showCustomBar, setShowCustomBar] = useState(false);
  const [hexInput, setHexInput] = useState(value ? value.replace('#', '') : 'B8A9F4');
  const nativeColorInputRef = useRef(null);

  const handleSelectColor = (c) => {
    onChange(c);
    setHexInput(c.replace('#', ''));
  };

  const handleHexInputChange = (e) => {
    const raw = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
    setHexInput(raw);
    if (raw.length === 6) {
      onChange(`#${raw.toUpperCase()}`);
    }
  };

  const handleNativeColorChange = (e) => {
    const newColor = e.target.value.toUpperCase();
    onChange(newColor);
    setHexInput(newColor.replace('#', ''));
  };

  const isCustomColor = !CURATED_COLORS.includes(value?.toUpperCase());

  return (
    <div className="color-picker-component">
      <div className="color-picker-header">
        <label className="color-picker-label">{label}</label>
        <button
          type="button"
          onClick={() => {
            setShowCustomBar(!showCustomBar);
            if (!showCustomBar && nativeColorInputRef.current) {
              nativeColorInputRef.current.click();
            }
          }}
          className="btn-custom-color-toggle"
          title="Open custom color picker"
        >
          <IconColorPicker size={14} stroke={1.8} />
          <span>{showCustomBar ? 'Close Custom' : 'Custom Color'}</span>
        </button>
      </div>

      {/* Swatches Grid */}
      <div className="color-picker-grid">
        {CURATED_COLORS.map((c) => {
          const isSelected = value?.toUpperCase() === c.toUpperCase();
          return (
            <button
              key={c}
              type="button"
              onClick={() => handleSelectColor(c)}
              className={`color-swatch-btn ${isSelected ? 'selected' : ''}`}
              style={{ backgroundColor: c }}
              title={c}
              aria-label={`Select color ${c}`}
            >
              {isSelected && <IconCheck size={14} color={getCheckColor(c)} stroke={2.5} />}
            </button>
          );
        })}

        {/* Rainbow Custom Swatch button */}
        <button
          type="button"
          onClick={() => {
            setShowCustomBar(true);
            if (nativeColorInputRef.current) {
              nativeColorInputRef.current.click();
            }
          }}
          className={`color-swatch-btn rainbow-custom-swatch ${isCustomColor ? 'selected' : ''}`}
          title="Pick any custom color"
          aria-label="Pick any custom color"
        >
          {isCustomColor ? (
            <div
              className="custom-color-indicator"
              style={{ backgroundColor: value }}
            >
              <IconCheck size={13} color={getCheckColor(value)} stroke={2.5} />
            </div>
          ) : (
            <IconPalette size={15} color="#ffffff" stroke={2} />
          )}
        </button>
      </div>

      {/* Rich Custom Color Toolbar */}
      {(showCustomBar || isCustomColor) && (
        <div className="custom-color-bar">
          <div
            className="custom-color-preview-chip"
            style={{ backgroundColor: value }}
            onClick={() => nativeColorInputRef.current?.click()}
            title="Click to open color spectrum wheel"
          >
            <input
              ref={nativeColorInputRef}
              type="color"
              value={value || '#AB9FF2'}
              onChange={handleNativeColorChange}
              className="native-hidden-color-input"
              aria-label="Native color selector"
            />
          </div>

          <div className="custom-hex-input-wrapper">
            <span className="hex-hash-prefix">#</span>
            <input
              type="text"
              value={hexInput}
              onChange={handleHexInputChange}
              maxLength={6}
              placeholder="AB9FF2"
              className="custom-hex-text-input"
              spellCheck="false"
            />
          </div>

          <button
            type="button"
            className="btn-spectrum-trigger"
            onClick={() => nativeColorInputRef.current?.click()}
            title="Pick using system spectrum wheel"
          >
            <IconPalette size={14} stroke={1.8} />
            <span>Spectrum</span>
          </button>
        </div>
      )}
    </div>
  );
}
