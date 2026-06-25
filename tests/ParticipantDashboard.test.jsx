import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock useAuth
vi.mock('../src/features/auth/useAuth', () => ({
  useAuth: () => ({
    user: { uid: 'test-uid', email: 'test@test.com' },
    loading: false,
    isAdmin: false,
  }),
}));

// Mock Firebase
vi.mock('../src/firebase/client', () => ({
  auth: {},
  db: {},
  rtdb: {},
}));

vi.mock('../src/firebase/services', () => ({
  getUserProfile: vi.fn().mockResolvedValue(null),
  getRegistrationsByUser: vi.fn().mockResolvedValue([]),
  getMatchesByUser: vi.fn().mockResolvedValue([]),
}));

import ParticipantDashboard from '../src/features/dashboard/ParticipantDashboard';

describe('ParticipantDashboard', () => {
  it('renders dashboard heading', () => {
    render(
      <MemoryRouter>
        <ParticipantDashboard />
      </MemoryRouter>
    );
    expect(screen.getByText(/Panel del Jugador/i)).toBeInTheDocument();
  });
});
