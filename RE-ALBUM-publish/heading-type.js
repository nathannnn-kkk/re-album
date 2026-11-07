(() => {
  const headings = [...document.querySelectorAll('[data-text-type]')];
  if (!headings.length) return;

  const segment = (value) => {
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
      return [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(value)].map((part) => part.segment);
    }
    return Array.from(value);
  };

  const prepare = (heading) => {
    if (heading.dataset.textTypeReady) return;
    heading.dataset.textTypeReady = 'true';
    heading.setAttribute('aria-label', heading.innerText.replace(/\s+/g, ' ').trim());
    heading.setAttribute('aria-busy', 'true');
    heading.querySelectorAll('*').forEach((node) => node.setAttribute('aria-hidden', 'true'));
    const chars = [];
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach((textNode) => {
      const fragment = document.createDocumentFragment();
      segment(textNode.nodeValue).forEach((character) => {
        const span = document.createElement('span');
        span.className = 'text-type__char';
        span.textContent = character;
        fragment.append(span);
        chars.push(span);
      });
      textNode.replaceWith(fragment);
    });
    return chars;
  };

  const showAll = (heading, chars) => {
    chars.forEach((char) => char.classList.add('text-type__char--visible'));
    heading.removeAttribute('aria-busy');
  };

  const animate = (heading) => {
    const chars = prepare(heading);
    if (!chars || !chars.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      showAll(heading, chars);
      return;
    }

    const cursor = document.createElement('span');
    cursor.className = 'text-type__cursor';
    cursor.setAttribute('aria-hidden', 'true');
    chars[0].before(cursor);
    let index = 0;
    const typeNext = () => {
      if (index >= chars.length) {
        cursor.remove();
        heading.removeAttribute('aria-busy');
        return;
      }
      const char = chars[index];
      char.classList.add('text-type__char--visible');
      char.after(cursor);
      index += 1;
      window.setTimeout(typeNext, index === 1 ? 36 : 43);
    };
    window.setTimeout(typeNext, 180);
  };

  if (!('IntersectionObserver' in window)) {
    headings.forEach(animate);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      animate(entry.target);
    });
  }, { threshold: 0.12 });
  headings.forEach((heading) => observer.observe(heading));
})();
