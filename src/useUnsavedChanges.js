import { useEffect } from 'react';

export default function useUnsavedChanges(dirty) {
  useEffect(() => {
    if (!dirty) return;
    let leaving = false;
    const unload = event => { if (!leaving) { event.preventDefault(); event.returnValue = ''; } };
    const click = event => {
      const link = event.target.closest?.('a[href]');
      if (!link || link.target === '_blank' || event.ctrlKey || event.metaKey || link.origin !== window.location.origin) return;
      if (!window.confirm('Leave this page? Your unsaved changes will be lost.')) { event.preventDefault(); event.stopPropagation(); } else { leaving = true; }
    };
    window.addEventListener('beforeunload', unload);
    document.addEventListener('click', click, true);
    return () => { window.removeEventListener('beforeunload', unload); document.removeEventListener('click', click, true); };
  }, [dirty]);
}
