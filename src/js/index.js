const focusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const getItems = (container, selector) => [
  ...(container.matches?.(selector) ? [container] : []),
  ...container.querySelectorAll(selector),
];

export const trapFocus = (container) => {
  const onKeydown = (event) => {
    if (event.key !== 'Tab') return;

    const items = getItems(container, focusableSelector).filter(
      (item) => item.getAttribute('aria-hidden') !== 'true',
    );
    if (!items.length) {
      event.preventDefault();
      container.focus();
      return;
    }

    const first = items[0];
    const last = items.at(-1);
    if (event.shiftKey && container.ownerDocument.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && container.ownerDocument.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
};

export const setRovingTabindex = (container, selector) => {
  const items = getItems(container, selector);
  const selected =
    items.find(
      (item) =>
        item.getAttribute('aria-selected') === 'true' || item.classList.contains('is-active'),
    ) ?? items[0];
  items.forEach((item) => item.setAttribute('tabindex', String(item === selected ? 0 : -1)));
  return items;
};

export const positionTooltip = (anchor, tooltip) => {
  const bounds = anchor.getBoundingClientRect();
  const tooltipBounds = tooltip.getBoundingClientRect();
  const gap = 8;
  const top =
    bounds.top >= tooltipBounds.height + gap
      ? bounds.top - tooltipBounds.height - gap
      : bounds.bottom + gap;
  const left = Math.max(
    gap,
    Math.min(
      bounds.left + (bounds.width - tooltipBounds.width) / 2,
      window.innerWidth - tooltipBounds.width - gap,
    ),
  );
  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
};

export const stackToast = (region, message, duration = 5000) => {
  const toast = document.createElement('div');
  toast.className = 'notification is-info';
  toast.setAttribute('role', 'status');
  toast.textContent = message;
  region.append(toast);

  const timeout = duration > 0 ? window.setTimeout(() => toast.remove(), duration) : null;
  return () => {
    if (timeout !== null) window.clearTimeout(timeout);
    toast.remove();
  };
};

export const initFluent2 = (root = document) => {
  const documentRoot = root.nodeType === Node.DOCUMENT_NODE ? root.documentElement : root;
  const ownerDocument = root.nodeType === Node.DOCUMENT_NODE ? root : root.ownerDocument;
  documentRoot.setAttribute('data-fluent-js', '');
  const cleanups = [];
  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    cleanups.push(() => target.removeEventListener(type, handler, options));
  };

  getItems(root, '[data-fluent-navbar]').forEach((navbar) => {
    const toggle = navbar.querySelector('[data-fluent-navbar-toggle][aria-controls]');
    const menu = toggle && ownerDocument.getElementById(toggle.getAttribute('aria-controls'));
    if (!toggle || !menu) return;

    const setExpanded = (expanded) => {
      toggle.setAttribute('aria-expanded', String(expanded));
      menu.hidden = !expanded;
      toggle.classList.toggle('is-active', expanded);
      menu.classList.toggle('is-active', expanded);
    };
    setExpanded(false);
    if (window.matchMedia('(min-width: 769px)').matches) menu.hidden = false;
    listen(toggle, 'click', () => setExpanded(toggle.getAttribute('aria-expanded') !== 'true'));
    listen(window, 'resize', () => {
      if (window.matchMedia('(min-width: 769px)').matches) menu.hidden = false;
      else menu.hidden = toggle.getAttribute('aria-expanded') !== 'true';
    });
  });

  getItems(root, '[data-fluent-tabs]').forEach((tabs) => {
    const tablist = tabs.querySelector('[data-fluent-tablist]');
    const tabLinks = tablist && getItems(tablist, '[data-fluent-tab]');
    const panels = getItems(tabs, '[data-fluent-tabpanel]');
    if (!tablist || !tabLinks?.length || !panels.length) return;

    tablist.setAttribute('role', 'tablist');
    const update = (activeTab, moveFocus = false) => {
      tabLinks.forEach((tab) => {
        const active = tab === activeTab;
        const panel = ownerDocument.getElementById(tab.hash.slice(1));
        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-selected', String(active));
        tab.setAttribute('tabindex', active ? '0' : '-1');
        if (panel) {
          if (!tab.id) tab.id = `${panel.id}-tab`;
          tab.setAttribute('aria-controls', panel.id);
          panel.setAttribute('role', 'tabpanel');
          panel.setAttribute('aria-labelledby', tab.id);
          panel.hidden = !active;
          if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '0');
        }
        tab.parentElement?.classList.toggle('is-active', active);
        if (active && moveFocus) tab.focus();
      });
      setRovingTabindex(tablist, '[role="tab"]');
    };
    const initial =
      tabLinks.find((tab) => tab.parentElement?.classList.contains('is-active')) ?? tabLinks[0];
    update(initial);
    tabLinks.forEach((tab) => {
      listen(tab, 'click', (event) => {
        if (!tab.hash) return;
        event.preventDefault();
        update(tab);
      });
      listen(tab, 'keydown', (event) => {
        const horizontal = tablist.getAttribute('aria-orientation') !== 'vertical';
        const forward = horizontal ? 'ArrowRight' : 'ArrowDown';
        const backward = horizontal ? 'ArrowLeft' : 'ArrowUp';
        const currentIndex = tabLinks.indexOf(tab);
        let nextIndex;
        if (event.key === forward) nextIndex = (currentIndex + 1) % tabLinks.length;
        if (event.key === backward)
          nextIndex = (currentIndex - 1 + tabLinks.length) % tabLinks.length;
        if (event.key === 'Home') nextIndex = 0;
        if (event.key === 'End') nextIndex = tabLinks.length - 1;
        if (nextIndex !== undefined) {
          event.preventDefault();
          update(tabLinks[nextIndex], true);
        }
      });
    });
  });

  getItems(root, '[data-fluent-accordion]').forEach((accordion) => {
    const panels = [...accordion.querySelectorAll(':scope > details')];
    if (accordion.getAttribute('data-fluent-accordion') === 'multiple') return;
    panels.forEach((panel) => {
      listen(panel, 'toggle', () => {
        if (!panel.open) return;
        panels.forEach((sibling) => {
          if (sibling !== panel) sibling.open = false;
        });
      });
    });
  });

  getItems(root, '[data-fluent-menu][popover]').forEach((menu) => {
    const items = getItems(menu, '[role="menuitem"]');
    const getTrigger = () =>
      getItems(root, '[popovertarget]').find(
        (trigger) => trigger.getAttribute('popovertarget') === menu.id,
      );
    listen(menu, 'toggle', (event) => {
      const open = event.newState === 'open';
      getTrigger()?.setAttribute('aria-expanded', String(open));
      if (open) items[0]?.focus();
    });
    listen(menu, 'keydown', (event) => {
      const index = items.indexOf(ownerDocument.activeElement);
      let nextIndex;
      if (event.key === 'ArrowDown') nextIndex = (index + 1 + items.length) % items.length;
      if (event.key === 'ArrowUp') nextIndex = (index - 1 + items.length) % items.length;
      if (event.key === 'Home') nextIndex = 0;
      if (event.key === 'End') nextIndex = items.length - 1;
      if (nextIndex !== undefined && items.length) {
        event.preventDefault();
        items[nextIndex].focus();
      }
      if (event.key === 'Escape') {
        menu.hidePopover?.();
        getTrigger()?.focus();
      }
    });
  });

  getItems(root, '[data-fluent-dialog-trigger][href^="#"]').forEach((trigger) => {
    const dialog = ownerDocument.getElementById(trigger.hash.slice(1));
    if (!(dialog instanceof HTMLDialogElement)) return;
    dialog.close();
    const releaseFocusTrap = () => trapFocus(dialog);
    let stopFocusTrap;
    listen(trigger, 'click', (event) => {
      event.preventDefault();
      dialog.classList.add('is-modal');
      dialog.showModal();
      stopFocusTrap?.();
      stopFocusTrap = releaseFocusTrap();
      dialog.querySelector(focusableSelector)?.focus();
    });
    listen(dialog, 'close', () => {
      dialog.classList.remove('is-modal');
      stopFocusTrap?.();
      trigger.focus();
    });
    getItems(dialog, '[data-fluent-dialog-close]').forEach((close) => {
      listen(close, 'click', () => dialog.close());
    });
  });

  let tooltipId = 0;
  getItems(root, '[data-fluent-tooltip]').forEach((anchor) => {
    const tooltip = document.createElement('span');
    tooltip.id = `fluent-tooltip-${++tooltipId}`;
    tooltip.setAttribute('role', 'tooltip');
    tooltip.setAttribute('data-fluent-tooltip-node', '');
    tooltip.textContent = anchor.getAttribute('data-fluent-tooltip');
    let previousDescribedBy = anchor.getAttribute('aria-describedby');
    let focused = false;
    let hovered = false;

    const show = () => {
      if (!tooltip.isConnected) {
        previousDescribedBy = anchor.getAttribute('aria-describedby');
        document.body.append(tooltip);
        anchor.setAttribute(
          'aria-describedby',
          [previousDescribedBy, tooltip.id].filter(Boolean).join(' '),
        );
      }
      positionTooltip(anchor, tooltip);
    };
    const hide = () => {
      if (!tooltip.isConnected) return;
      tooltip.remove();
      if (previousDescribedBy) anchor.setAttribute('aria-describedby', previousDescribedBy);
      else anchor.removeAttribute('aria-describedby');
    };
    const hideIfInactive = () => {
      if (!focused && !hovered) hide();
    };
    listen(anchor, 'focus', () => {
      focused = true;
      show();
    });
    listen(anchor, 'blur', () => {
      focused = false;
      hideIfInactive();
    });
    listen(anchor, 'pointerenter', () => {
      hovered = true;
      show();
    });
    listen(anchor, 'pointerleave', () => {
      hovered = false;
      hideIfInactive();
    });
    listen(anchor, 'keydown', (event) => {
      if (event.key === 'Escape') {
        focused = false;
        hovered = false;
        hide();
      }
    });
    cleanups.push(hide);
  });

  getItems(root, '[data-fluent-toast-trigger]').forEach((trigger) => {
    const region = root.querySelector('[data-fluent-toast-region]');
    if (!region) return;
    listen(trigger, 'click', () => {
      stackToast(
        region,
        trigger.getAttribute('data-fluent-toast-message') ?? 'Notification',
        Number(trigger.getAttribute('data-fluent-toast-duration') ?? 5000),
      );
    });
  });

  getItems(root, '[data-fluent-dismiss]').forEach((button) => {
    listen(button, 'click', () => button.closest('.message')?.remove());
  });

  return () => {
    cleanups.reverse().forEach((cleanup) => cleanup());
    documentRoot.removeAttribute('data-fluent-js');
  };
};
