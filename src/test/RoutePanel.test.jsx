import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoutePanel } from '../components/RoutePanel.jsx';

describe('RoutePanel Component', () => {
  const mockT = (key) => key;
  const mockBuildings = [
    { building_id: 1, name: 'Nhà D3', total_floor: 5 },
    { building_id: 2, name: 'Nhà C1', total_floor: 4 },
  ];

  it('renders nothing when open is false', () => {
    const { container } = render(
      <RoutePanel
        open={false}
        routeStart={null}
        routeEnd={null}
        routeResult={null}
        isSelectingPoint={null}
        onPickPoint={vi.fn()}
        onClose={vi.fn()}
        buildings={mockBuildings}
        onSelectPreset={vi.fn()}
        t={mockT}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders start and end labels when open is true', () => {
    render(
      <RoutePanel
        open={true}
        routeStart={{ name: 'Nhà D3' }}
        routeEnd={null}
        routeResult={null}
        isSelectingPoint={null}
        onPickPoint={vi.fn()}
        onClose={vi.fn()}
        buildings={mockBuildings}
        onSelectPreset={vi.fn()}
        t={mockT}
      />
    );

    expect(screen.getByText('Tìm đường')).toBeInTheDocument();
    expect(screen.getByText('Nhà D3')).toBeInTheDocument();
    expect(screen.getByText('Chưa chọn')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <RoutePanel
        open={true}
        routeStart={null}
        routeEnd={null}
        routeResult={null}
        isSelectingPoint={null}
        onPickPoint={vi.fn()}
        onClose={onClose}
        buildings={mockBuildings}
        onSelectPreset={vi.fn()}
        t={mockT}
      />
    );

    const closeBtn = screen.getByText('×');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('displays route result distance and duration when available', () => {
    const result = {
      distanceM: 650,
      timeMins: 8,
      path: [
        [105.84, 21.0],
        [105.85, 21.01],
      ],
    };

    render(
      <RoutePanel
        open={true}
        routeStart={{ name: 'Start' }}
        routeEnd={{ name: 'End' }}
        routeResult={result}
        isSelectingPoint={null}
        onPickPoint={vi.fn()}
        onClose={vi.fn()}
        buildings={mockBuildings}
        onSelectPreset={vi.fn()}
        t={mockT}
      />
    );

    expect(screen.getByText('650 m')).toBeInTheDocument();
    expect(screen.getByText('~8 phút')).toBeInTheDocument();
    expect(screen.getByText('Xóa đường đi')).toBeInTheDocument();
  });
});
