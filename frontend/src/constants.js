export const CATS = [
  { id: 'food',      label: 'Food',      icon: '🍛', color: '#1AAD7D', bg: '#E0F7EE', border: '#9FE1C8' },
  { id: 'rent',      label: 'Rent',      icon: '🏠', color: '#185FA5', bg: '#E6F1FB', border: '#B5D4F4' },
  { id: 'util',      label: 'Utilities', icon: '⚡', color: '#B45309', bg: '#FEF3CD', border: '#F6CC6E' },
  { id: 'grocery',   label: 'Grocery',   icon: '🛒', color: '#3B6D11', bg: '#EAF3DE', border: '#C0DD97' },
  { id: 'transport', label: 'Transport', icon: '🚌', color: '#534AB7', bg: '#EEEDFE', border: '#CECBF6' },
  { id: 'health',    label: 'Health',    icon: '💊', color: '#993556', bg: '#FBEAF0', border: '#F4C0D1' },
  { id: 'fun',       label: 'Fun',       icon: '🎬', color: '#993C1D', bg: '#FAECE7', border: '#F5C4B3' },
  { id: 'other',     label: 'Other',     icon: '📦', color: '#5F5E5A', bg: '#F1EFE8', border: '#D3D1C7' },
];
export const catOf = (id) => CATS.find(c => c.id === id) || CATS[CATS.length - 1];

export const PAL = [
  { bg: '#E1F5EE', mid: '#1D9E75', dark: '#085041', border: '#9FE1CB', av: '#0F6E56' },
  { bg: '#FAEEDA', mid: '#BA7517', dark: '#412402', border: '#FAC775', av: '#854F0B' },
  { bg: '#EEEDFE', mid: '#7F77DD', dark: '#26215C', border: '#CECBF6', av: '#534AB7' },
  { bg: '#FAECE7', mid: '#D85A30', dark: '#4A1B0C', border: '#F5C4B3', av: '#993C1D' },
  { bg: '#FBEAF0', mid: '#D4537E', dark: '#4B1528', border: '#F4C0D1', av: '#993556' },
  { bg: '#E6F1FB', mid: '#378ADD', dark: '#042C53', border: '#B5D4F4', av: '#185FA5' },
];
