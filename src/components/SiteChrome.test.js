import React, { useState } from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import Navigation from './Navigation';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';

function Header({ user = null, navigate = jest.fn(), logout = jest.fn(), bag = jest.fn() }) {
  const [open, setOpen] = useState(false);
  return <Navigation currentPage="home" setCurrentPage={navigate} cart={[{ quantity: 2 }]} showCart={false} setShowCart={bag} showMobileMenu={open} setShowMobileMenu={setOpen} user={user} handleLogout={logout} />;
}

test('header preserves shop, account and bag actions with accessible names', () => {
  const navigate = jest.fn(); const bag = jest.fn();
  render(<Header navigate={navigate} bag={bag} />);
  fireEvent.click(screen.getByRole('link', { name: 'Shop' }));
  expect(navigate).toHaveBeenCalledWith('shop');
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(navigate).toHaveBeenCalledWith('auth');
  fireEvent.click(screen.getByRole('button', { name: 'Shopping bag, 2 items' }));
  expect(bag).toHaveBeenCalledWith(true);
  expect(screen.queryByRole('button', { name: 'Analytics' })).not.toBeInTheDocument();
});

test('mobile menu traps focus, closes on Escape and restores scroll and focus', () => {
  render(<Header />);
  const toggle = screen.getByRole('button', { name: 'Open menu' });
  toggle.focus(); fireEvent.click(toggle);
  const dialog = screen.getByRole('dialog', { name: 'Explore Anjola' });
  const close = within(dialog).getByRole('button', { name: 'Close menu' });
  expect(close).toHaveFocus();
  expect(document.body.style.overflow).toBe('hidden');
  fireEvent.keyDown(close, { key: 'Tab', shiftKey: true });
  const last = within(dialog).getByRole('link', { name: /Find us on Instagram/ });
  expect(last).toHaveFocus();
  fireEvent.keyDown(last, { key: 'Tab' });
  expect(close).toHaveFocus();
  fireEvent.keyDown(close, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(document.body.style.overflow).toBe('');
  expect(toggle).toHaveFocus();
});

test('admin links and sign-out remain available in the menu', () => {
  const navigate = jest.fn(); const logout = jest.fn();
  render(<Header user={{ name: 'Admin', role: 'admin' }} navigate={navigate} logout={logout} />);
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
  fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Orders' }));
  expect(navigate).toHaveBeenCalledWith('admin-orders');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
  fireEvent.click(screen.getByRole('button', { name: 'Sign out' }));
  expect(logout).toHaveBeenCalledTimes(1);
  expect(navigate).toHaveBeenLastCalledWith('home');
});

test('bottom navigation opens the bag and routes guests to sign-in', () => {
  const navigate = jest.fn(); const bag = jest.fn();
  render(<MobileBottomNav currentPage="home" setCurrentPage={navigate} cart={[{ quantity: 3 }]} setShowCart={bag} />);
  expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(screen.getByRole('button', { name: 'Bag, 3 items' }));
  expect(bag).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: 'Account' }));
  expect(navigate).toHaveBeenCalledWith('auth');
});

test('footer navigation and contact links have working destinations', () => {
  const navigate = jest.fn(); render(<Footer setCurrentPage={navigate} />);
  fireEvent.click(screen.getByRole('link', { name: 'Shop the collection' }));
  expect(navigate).toHaveBeenCalledWith('shop');
  expect(screen.getByRole('link', { name: 'anjolaaestheticsng@gmail.com' })).toHaveAttribute('href', 'mailto:anjolaaestheticsng@gmail.com');
  expect(screen.getByRole('link', { name: '+234 706 594 3625' })).toHaveAttribute('href', 'tel:+2347065943625');
});
