import { render, screen } from '@testing-library/react';
import App from './App';

// PUBLIC_INTERFACE
test('renders the game and mode selector correctly', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  expect(screen.getByText(/2 Players/i)).toBeInTheDocument();
  expect(screen.getByText(/Vs Computer/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Restart Game/i })).toBeInTheDocument();
});
