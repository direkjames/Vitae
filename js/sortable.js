// Vitae — lightweight drag-to-reorder (mouse, touch and keyboard)
// Author: direk james
//
// Markup contract:
//   <div data-sort-list="listName">            container
//     <div data-sort-item> <button data-drag>   item + handle
// onMove(listName, from, to) is called when an item is dropped in a new spot.

export function enableSorting(root, onMove) {
  root.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    const handle = e.target.closest('[data-drag]');
    if (!handle || !root.contains(handle)) return;
    const item = handle.closest('[data-sort-item]');
    const list = item?.parentElement;
    if (!list?.dataset.sortList) return;
    e.preventDefault();

    const items = [...list.children].filter((c) => c.hasAttribute('data-sort-item'));
    const from = items.indexOf(item);
    if (items.length < 2) return;
    const rects = items.map((it) => it.getBoundingClientRect());
    const gap = rects[1].top - rects[0].bottom;
    const span = rects[from].height + gap;
    const startY = e.clientY;
    const minDy = rects[0].top - rects[from].top;
    const maxDy = rects[rects.length - 1].bottom - rects[from].bottom;
    let to = from;
    let moved = false;

    item.classList.add('dragging');
    list.classList.add('sorting');
    document.body.classList.add('is-dragging');
    handle.setPointerCapture(e.pointerId);

    const onPointerMove = (ev) => {
      const dy = Math.max(minDy - 12, Math.min(maxDy + 12, ev.clientY - startY));
      if (Math.abs(dy) > 3) moved = true;
      item.style.transform = `translateY(${dy}px)`;
      // Use the pointer position (not the item's center) so tall cards reorder naturally
      const center = startY + dy;
      to = from;
      for (let i = 0; i < from; i++) {
        if (center < rects[i].top + rects[i].height / 2) { to = i; break; }
      }
      if (to === from) {
        for (let i = rects.length - 1; i > from; i--) {
          if (center > rects[i].top + rects[i].height / 2) { to = i; break; }
        }
      }
      items.forEach((it, i) => {
        if (i === from) return;
        let shift = 0;
        if (from < to && i > from && i <= to) shift = -span;
        if (from > to && i >= to && i < from) shift = span;
        it.style.transform = shift ? `translateY(${shift}px)` : '';
      });
    };

    const finish = () => {
      handle.removeEventListener('pointermove', onPointerMove);
      handle.removeEventListener('pointerup', finish);
      handle.removeEventListener('pointercancel', finish);
      items.forEach((it) => (it.style.transform = ''));
      item.classList.remove('dragging');
      list.classList.remove('sorting');
      document.body.classList.remove('is-dragging');
      if (moved && to !== from) onMove(list.dataset.sortList, from, to);
    };
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', finish);
    handle.addEventListener('pointercancel', finish);
  });

  // Keyboard: focus a handle and press ArrowUp / ArrowDown
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    const handle = e.target.closest('[data-drag]');
    if (!handle) return;
    const item = handle.closest('[data-sort-item]');
    const list = item?.parentElement;
    if (!list?.dataset.sortList) return;
    const items = [...list.children].filter((c) => c.hasAttribute('data-sort-item'));
    const from = items.indexOf(item);
    const to = e.key === 'ArrowUp' ? from - 1 : from + 1;
    if (to < 0 || to >= items.length) return;
    e.preventDefault();
    onMove(list.dataset.sortList, from, to, { refocus: item.dataset.id || item.dataset.key });
  });
}
