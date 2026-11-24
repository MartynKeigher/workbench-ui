for (const close of document.querySelectorAll('.wb-message-close')) {
  close.addEventListener('click', () => close.closest('.wb-message').remove());
}
