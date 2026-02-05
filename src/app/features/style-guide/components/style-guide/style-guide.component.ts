import { Component } from '@angular/core';

interface ColorSwatch {
  name: string;
  variable: string;
  hex: string;
  usage?: string;
}

interface ColorGroup {
  title: string;
  description?: string;
  colors: ColorSwatch[];
}

interface TypographyItem {
  name: string;
  variable: string;
  value: string;
  cssClass?: string;
}

interface SpacingItem {
  name: string;
  variable: string;
  value: string;
  pixels: string;
}

interface ElevationItem {
  name: string;
  variable: string;
  value: string;
}

@Component({
  selector: 'app-style-guide',
  templateUrl: './style-guide.component.html',
  styleUrl: './style-guide.component.scss',
  standalone: false
})
export class StyleGuideComponent {
  // ==========================================
  // COLORS - Foundations
  // ==========================================
  brandColors: ColorGroup = {
    title: 'Brand Colors',
    description: 'Primary brand colors from BD design guidelines',
    colors: [
      { name: 'BD Blue 500', variable: '$bd-blue-500', hex: '#0446ED', usage: 'Primary brand color' },
      { name: 'BD Blue 400', variable: '$bd-blue-400', hex: '#5A86F5', usage: 'Primary light' },
      { name: 'BD Blue 600', variable: '$bd-blue-600', hex: '#033ED5', usage: 'Primary dark' },
      { name: 'BD Orange 500', variable: '$bd-orange-500', hex: '#FF6E00', usage: 'Accent color' },
      { name: 'BD Orange 400', variable: '$bd-orange-400', hex: '#FFA749', usage: 'Accent light' },
      { name: 'BD Orange 600', variable: '$bd-orange-600', hex: '#F56600', usage: 'Accent dark' },
      { name: 'BD Deep Blue', variable: '$bd-deep-blue-500', hex: '#060A3D', usage: 'Text primary' },
    ]
  };

  blueRamp: ColorGroup = {
    title: 'BD Blue Ramp',
    description: 'Full blue color scale for UI elements',
    colors: [
      { name: 'Blue 50', variable: '$bd-blue-50', hex: '#E8EFFE' },
      { name: 'Blue 100', variable: '$bd-blue-100', hex: '#C4D5FC' },
      { name: 'Blue 200', variable: '$bd-blue-200', hex: '#9DB9FA' },
      { name: 'Blue 300', variable: '$bd-blue-300', hex: '#769DF7' },
      { name: 'Blue 400', variable: '$bd-blue-400', hex: '#5A86F5' },
      { name: 'Blue 500', variable: '$bd-blue-500', hex: '#0446ED' },
      { name: 'Blue 600', variable: '$bd-blue-600', hex: '#033ED5' },
      { name: 'Blue 700', variable: '$bd-blue-700', hex: '#0335BA' },
      { name: 'Blue 800', variable: '$bd-blue-800', hex: '#022C9F' },
      { name: 'Blue 900', variable: '$bd-blue-900', hex: '#021E6F' },
    ]
  };

  orangeRamp: ColorGroup = {
    title: 'BD Orange Ramp',
    description: 'Full orange color scale for accents',
    colors: [
      { name: 'Orange 50', variable: '$bd-orange-50', hex: '#FFF3E5' },
      { name: 'Orange 100', variable: '$bd-orange-100', hex: '#FFE0BF' },
      { name: 'Orange 200', variable: '$bd-orange-200', hex: '#FFCC94' },
      { name: 'Orange 300', variable: '$bd-orange-300', hex: '#FFB769' },
      { name: 'Orange 400', variable: '$bd-orange-400', hex: '#FFA749' },
      { name: 'Orange 500', variable: '$bd-orange-500', hex: '#FF6E00' },
      { name: 'Orange 600', variable: '$bd-orange-600', hex: '#F56600' },
      { name: 'Orange 700', variable: '$bd-orange-700', hex: '#E65C00' },
      { name: 'Orange 800', variable: '$bd-orange-800', hex: '#D85200' },
      { name: 'Orange 900', variable: '$bd-orange-900', hex: '#C04000' },
    ]
  };

  neutralColors: ColorGroup = {
    title: 'Neutral / Warm Gray',
    description: 'Gray scale for backgrounds, borders, and text',
    colors: [
      { name: 'Warm Gray 50', variable: '$bd-warm-gray-50', hex: '#F7F6F6' },
      { name: 'Warm Gray 100', variable: '$bd-warm-gray-100', hex: '#ECEAEA' },
      { name: 'Warm Gray 200', variable: '$bd-warm-gray-200', hex: '#DFDCDC' },
      { name: 'Warm Gray 300', variable: '$bd-warm-gray-300', hex: '#D2CECE' },
      { name: 'Warm Gray 400', variable: '$bd-warm-gray-400', hex: '#C9C3C3' },
      { name: 'Warm Gray 500', variable: '$bd-warm-gray-500', hex: '#BFB8B8' },
      { name: 'Warm Gray 600', variable: '$bd-warm-gray-600', hex: '#B9B1B1' },
      { name: 'Warm Gray 700', variable: '$bd-warm-gray-700', hex: '#B1A8A8' },
      { name: 'Warm Gray 800', variable: '$bd-warm-gray-800', hex: '#A9A0A0' },
      { name: 'Warm Gray 900', variable: '$bd-warm-gray-900', hex: '#9B9191' },
      { name: 'Warm White', variable: '$bd-warm-white', hex: '#F8F4F1' },
    ]
  };

  secondaryColors: ColorGroup = {
    title: 'Secondary Palette',
    description: 'Extended brand colors for data visualization and accents',
    colors: [
      { name: 'Infrared', variable: '$bd-infrared', hex: '#FF6B61', usage: 'Error states' },
      { name: 'Aurora', variable: '$bd-aurora', hex: '#FA7C23', usage: 'Warnings' },
      { name: 'Eclipse', variable: '$bd-eclipse', hex: '#FFC300', usage: 'Caution' },
      { name: 'Comet', variable: '$bd-comet', hex: '#2995C5', usage: 'Info' },
      { name: 'Nebula', variable: '$bd-nebula', hex: '#00C9A7', usage: 'Success' },
      { name: 'Ultraviolet', variable: '$bd-ultraviolet', hex: '#9199D8', usage: 'Charts' },
      { name: 'Bright Blue', variable: '$bd-bright-blue', hex: '#1D74FF', usage: 'Links' },
    ]
  };

  statusColors: ColorGroup = {
    title: 'Status / Feedback',
    description: 'Semantic colors for system feedback',
    colors: [
      { name: 'Success', variable: '$color-success', hex: '#00C9A7', usage: 'Positive actions, confirmations' },
      { name: 'Warning', variable: '$color-warning', hex: '#FFC300', usage: 'Caution, attention needed' },
      { name: 'Error', variable: '$color-error', hex: '#FF6B61', usage: 'Errors, destructive actions' },
      { name: 'Info', variable: '$color-info', hex: '#2995C5', usage: 'Informational messages' },
    ]
  };

  // ==========================================
  // TYPOGRAPHY - Foundations
  // ==========================================
  fontFamilies: TypographyItem[] = [
    { name: 'Primary', variable: '$font-family-primary', value: "Inter, 'Helvetica Neue', sans-serif" },
    { name: 'Monospace', variable: '$font-family-monospace', value: "Roboto Mono, 'Courier New', monospace" },
  ];

  fontSizes: TypographyItem[] = [
    { name: 'XS', variable: '$font-size-xs', value: '0.75rem', cssClass: 'text-xs' },
    { name: 'SM', variable: '$font-size-sm', value: '0.875rem', cssClass: 'text-sm' },
    { name: 'Base', variable: '$font-size-base', value: '1rem', cssClass: 'text-base' },
    { name: 'LG', variable: '$font-size-lg', value: '1.125rem', cssClass: 'text-lg' },
    { name: 'XL', variable: '$font-size-xl', value: '1.25rem', cssClass: 'text-xl' },
    { name: '2XL', variable: '$font-size-2xl', value: '1.5rem', cssClass: 'text-2xl' },
    { name: '3XL', variable: '$font-size-3xl', value: '1.875rem', cssClass: 'text-3xl' },
    { name: '4XL', variable: '$font-size-4xl', value: '2.25rem', cssClass: 'text-4xl' },
  ];

  fontWeights: TypographyItem[] = [
    { name: 'Light', variable: '$font-weight-light', value: '300' },
    { name: 'Regular', variable: '$font-weight-regular', value: '400' },
    { name: 'Medium', variable: '$font-weight-medium', value: '500' },
    { name: 'Semibold', variable: '$font-weight-semibold', value: '600' },
    { name: 'Bold', variable: '$font-weight-bold', value: '700' },
  ];

  // ==========================================
  // SPACING - Foundations
  // ==========================================
  spacingScale: SpacingItem[] = [
    { name: 'spacing-0', variable: '$spacing-0', value: '0', pixels: '0px' },
    { name: 'spacing-1', variable: '$spacing-1', value: '0.25rem', pixels: '4px' },
    { name: 'spacing-2', variable: '$spacing-2', value: '0.5rem', pixels: '8px' },
    { name: 'spacing-3', variable: '$spacing-3', value: '0.75rem', pixels: '12px' },
    { name: 'spacing-4', variable: '$spacing-4', value: '1rem', pixels: '16px' },
    { name: 'spacing-5', variable: '$spacing-5', value: '1.25rem', pixels: '20px' },
    { name: 'spacing-6', variable: '$spacing-6', value: '1.5rem', pixels: '24px' },
    { name: 'spacing-8', variable: '$spacing-8', value: '2rem', pixels: '32px' },
    { name: 'spacing-10', variable: '$spacing-10', value: '2.5rem', pixels: '40px' },
    { name: 'spacing-12', variable: '$spacing-12', value: '3rem', pixels: '48px' },
    { name: 'spacing-16', variable: '$spacing-16', value: '4rem', pixels: '64px' },
  ];

  borderRadii: TypographyItem[] = [
    { name: 'SM', variable: '$border-radius-sm', value: '4px' },
    { name: 'MD', variable: '$border-radius-md', value: '8px' },
    { name: 'LG', variable: '$border-radius-lg', value: '12px' },
    { name: 'XL', variable: '$border-radius-xl', value: '16px' },
    { name: 'Full', variable: '$border-radius-full', value: '9999px' },
  ];

  // ==========================================
  // ELEVATION - Foundations
  // ==========================================
  elevations: ElevationItem[] = [
    { name: 'Shadow SM', variable: '$shadow-sm', value: '0 1px 3px rgba(6, 10, 61, 0.08)' },
    { name: 'Shadow MD', variable: '$shadow-md', value: '0 4px 6px rgba(6, 10, 61, 0.12)' },
    { name: 'Shadow LG', variable: '$shadow-lg', value: '0 10px 15px rgba(6, 10, 61, 0.16)' },
    { name: 'Shadow XL', variable: '$shadow-xl', value: '0 20px 25px rgba(6, 10, 61, 0.20)' },
  ];

  // ==========================================
  // CHART COLORS - Data Visualization
  // ==========================================
  chartColors: ColorGroup = {
    title: 'Chart Series Colors',
    description: 'Sequential colors for data visualization series',
    colors: [
      { name: 'Series 1', variable: '$chart-color-1', hex: '#0446ED', usage: 'Primary data series' },
      { name: 'Series 2', variable: '$chart-color-2', hex: '#FF6E00', usage: 'Secondary data series' },
      { name: 'Series 3', variable: '$chart-color-3', hex: '#2995C5', usage: 'Comet Blue' },
      { name: 'Series 4', variable: '$chart-color-4', hex: '#FA7C23', usage: 'Aurora Orange' },
      { name: 'Series 5', variable: '$chart-color-5', hex: '#9199D8', usage: 'Ultraviolet' },
      { name: 'Series 6', variable: '$chart-color-6', hex: '#00C9A7', usage: 'Nebula Teal' },
      { name: 'Series 7', variable: '$chart-color-7', hex: '#FFC300', usage: 'Eclipse Yellow' },
      { name: 'Series 8', variable: '$chart-color-8', hex: '#FF6B61', usage: 'Infrared Red' },
    ]
  };

  // ==========================================
  // COMPONENT TOKENS
  // ==========================================
  toolbarTokens = [
    { token: '$toolbar-bg', value: '$color-brand-primary', resolved: '#0446ED' },
    { token: '$toolbar-text', value: '$color-text-inverse', resolved: '#FFFFFF' },
    { token: '$toolbar-height (full)', value: '48px', resolved: '48px' },
    { token: '$toolbar-height (compact)', value: '40px', resolved: '40px' },
  ];

  cardTokens = [
    { token: '$card-bg', value: '$color-surface-primary', resolved: '#FFFFFF' },
    { token: '$card-border', value: '$color-border-subtle', resolved: '#DFDCDC' },
    { token: '$card-shadow', value: '$shadow-sm', resolved: '0 1px 3px rgba(...)' },
    { token: '$card-padding', value: '$spacing-6', resolved: '24px' },
  ];

  buttonTokens = [
    { token: '$button-primary-bg', value: '$color-interactive-primary', resolved: '#0446ED' },
    { token: '$button-primary-text', value: '$color-text-inverse', resolved: '#FFFFFF' },
    { token: '$button-primary-hover', value: '$color-interactive-primary-hover', resolved: '#033ED5' },
  ];

  // Copy to clipboard functionality
  copiedVariable: string | null = null;

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text);
    this.copiedVariable = text;
    setTimeout(() => this.copiedVariable = null, 2000);
  }
}
