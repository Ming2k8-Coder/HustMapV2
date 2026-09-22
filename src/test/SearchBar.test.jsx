import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../components/SearchBar.jsx';

describe('SearchBar Component', () => {
  const mockTranslations = {
    searchPlaceholder: 'Tìm kiếm tòa nhà, phòng học...',
  };

  it('renders search input with placeholder', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} lang="vi" t={mockTranslations} />);

    const input = screen.getByPlaceholderText('Tìm kiếm tòa nhà, phòng học...');
    expect(input).toBeInTheDocument();
  });

  it('updates input value on typing', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} lang="vi" t={mockTranslations} />);

    const input = screen.getByPlaceholderText('Tìm kiếm tòa nhà, phòng học...');
    fireEvent.change(input, { target: { value: 'D3' } });
    expect(input.value).toBe('D3');
  });

  it('triggers onSearch when enter key is pressed', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} lang="vi" t={mockTranslations} />);

    const input = screen.getByPlaceholderText('Tìm kiếm tòa nhà, phòng học...');
    fireEvent.change(input, { target: { value: 'B1' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSearch).toHaveBeenCalledWith('B1');
  });

  it('triggers onSearch when search button is clicked', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} lang="vi" t={mockTranslations} />);

    const input = screen.getByPlaceholderText('Tìm kiếm tòa nhà, phòng học...');
    fireEvent.change(input, { target: { value: 'C1' } });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledWith('C1');
  });
});
