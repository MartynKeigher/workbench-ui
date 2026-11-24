for (const list of document.querySelectorAll('[data-example] .wb-list')) {
  list.addEventListener('click', (event) => {
    const item = event.target.closest('button.wb-list-item');
    if (!item) return;
    list.querySelector('[aria-current]')?.removeAttribute('aria-current');
    item.setAttribute('aria-current', 'true');
  });
}
