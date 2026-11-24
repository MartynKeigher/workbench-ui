for (const remove of document.querySelectorAll('#tags .wb-tag-remove')) {
  remove.addEventListener('click', () => remove.closest('.wb-tag').remove());
}
