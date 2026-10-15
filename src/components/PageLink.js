// Keep real destinations discoverable and support opening links in a new tab.
export default function PageLink({ page, navigate, children, ...props }) {
  const href = page === 'home' ? '/' : `/${page}`;
  return <a {...props} href={href} onClick={event => {
    if (!navigate || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    navigate(page);
  }}>{children}</a>;
}
