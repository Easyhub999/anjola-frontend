import { render, screen, fireEvent } from '@testing-library/react';
import BlogPage from './BlogPage';

test('journal has usable guides and working shop links instead of placeholder subscriptions', () => {
  const { container } = render(<BlogPage />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Everyday living.Thoughtful giving.');
  expect(container.querySelectorAll('article')).toHaveLength(6);
  const summary = screen.getAllByText('Read the guide')[0];
  fireEvent.click(summary);
  expect(summary.closest('details')).toHaveAttribute('open');
  expect(screen.getByRole('link', { name: 'Shop the collection' })).toHaveAttribute('href','/shop');
  expect(container.querySelector('form')).toBeNull();
  fireEvent.click(screen.getByRole('button', { name: 'Gifting' }));
  expect(container.querySelectorAll('article')).toHaveLength(2);
  expect(screen.getByRole('button', { name: 'Gifting' })).toHaveAttribute('aria-pressed','true');
});
