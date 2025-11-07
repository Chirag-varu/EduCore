import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '@/context/auth-context';
import ProfilePage from '@/pages/student/profile';

const mockAuth = {
  authenticate: true,
  user: { userName: 'Test User', userEmail: 'test@example.com', role: 'student' }
};

function Wrapper({ children }) {
  return (
    <AuthContext.Provider value={{ auth: mockAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

describe('ProfilePage', () => {
  it('renders user name and email', () => {
    render(
      <Wrapper>
        <MemoryRouter initialEntries={['/profile']}>
          <Routes>
            <Route path='/profile' element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </Wrapper>
    );
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });
});
