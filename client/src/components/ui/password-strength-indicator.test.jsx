import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import PasswordStrengthIndicator from './password-strength-indicator';

describe('PasswordStrengthIndicator', () => {
  it('renders nothing when password is empty', () => {
    const { container } = render(<PasswordStrengthIndicator password="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows strong strength for a compliant password', () => {
    render(<PasswordStrengthIndicator password="StrongP@ss1" />);
    expect(screen.getByText(/Password strength/i)).toBeInTheDocument();
    expect(screen.getByText(/strong/i)).toBeInTheDocument();
    // Requirements labels should be visible
    expect(screen.getByText(/At least 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/One uppercase letter/i)).toBeInTheDocument();
  });
});
