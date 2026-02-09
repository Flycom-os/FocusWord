import { render, screen } from '@testing-library/react';
import UiPageHeader from '@/src/shared/ui/Header/ui-page-header'
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';

// Mock Link from next/link
jest.mock('next/link', () => {
  return ({ href, children }: any) => <a href={href}>{children}</a>;
});

describe('UiPageHeader', () => {
  it('renders title and subtitle correctly', () => {
    render(<UiPageHeader title="Медиафайлы" subTitle="Главная" />);
    expect(screen.getByText('Медиафайлы')).toBeInTheDocument();
    expect(screen.getByText('Медиафайлы/')).toBeInTheDocument();
    expect(screen.getByText('Главная')).toBeInTheDocument();
  });

  it('renders without subtitle', () => {
    render(<UiPageHeader title="Только заголовок" />);
    expect(screen.getByText('Только заголовок')).toBeInTheDocument();
    // ссылка с пустым subtitle рендерится, но без текста
    expect(screen.getByRole('link', { name: '' })).toBeInTheDocument();
  });

  it('links point to the correct routes', () => {
    render(<UiPageHeader title="Files" subTitle="Home" />);
    expect(screen.getByText('Files/')).toHaveAttribute('href', 'admin/media-files');
    expect(screen.getByText('Home')).toHaveAttribute('href', '/');
  });
});
