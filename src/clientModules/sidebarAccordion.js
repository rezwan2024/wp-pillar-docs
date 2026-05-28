let sidebarObserver = null;

export function onRouteDidUpdate() {
  setup();
}

function setup() {
  if (sidebarObserver) {
    sidebarObserver.disconnect();
    sidebarObserver = null;
  }

  const sidebar = document.querySelector('.theme-doc-sidebar-menu');
  if (!sidebar) return;

  sidebarObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      const cat =
        mutation.target.closest &&
        mutation.target.closest('.theme-doc-sidebar-item-category');
      if (!cat) continue;

      const wasCollapsed =
        mutation.oldValue &&
        mutation.oldValue.includes('menu__list-item--collapsed');
      const isNowOpen = !cat.classList.contains('menu__list-item--collapsed');

      if (wasCollapsed && isNowOpen) {
        // This category just opened — close every other open one
        document
          .querySelectorAll('.theme-doc-sidebar-item-category')
          .forEach((other) => {
            if (other !== cat && !other.classList.contains('menu__list-item--collapsed')) {
              other.querySelector('.menu__list-item-collapsible')?.click();
            }
          });
        break;
      }
    }
  });

  sidebarObserver.observe(sidebar, {
    attributes: true,
    attributeFilter: ['class'],
    attributeOldValue: true,
    subtree: true,
  });
}

if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', setup);
}
