/**
 * ShareSheet — copies the result text, or shows a selectable sheet
 * when the browser refuses clipboard access.
 */
class ShareSheet {
  static copy(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).then(
          () => true,
          () => false
        );
      }
    } catch (e) {
      /* fall through to the sheet */
    }
    return Promise.resolve(false);
  }

  static show(text) {
    ShareSheet.close();

    const overlay = document.createElement('div');
    overlay.className = 'share-sheet';
    overlay.id = 'share-sheet';

    const card = document.createElement('div');
    card.className = 'share-card';
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', 'Share your result');

    const title = document.createElement('h2');
    title.textContent = 'Share your result';

    const hint = document.createElement('p');
    hint.textContent = 'Select the text below and copy it.';

    const box = document.createElement('textarea');
    box.id = 'share-text';
    box.readOnly = true;
    box.value = text;

    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.addEventListener('click', ShareSheet.close);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) ShareSheet.close();
    });

    card.append(title, hint, box, close);
    overlay.append(card);
    document.body.append(overlay);
    box.focus();
    box.select();
  }

  static close() {
    const el = document.getElementById('share-sheet');
    if (el) el.remove();
  }
}
