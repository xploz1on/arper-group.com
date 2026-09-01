/**
 * ARPER Servicios Generales E.I.R.L. — Main JavaScript
 * Interactivity, Quote Generator, Search/Filter, and Micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Dynamic Year in Footer
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Mobile Navigation Drawer Toggle
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');

  if (burgerBtn && navLinks) {
    burgerBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      burgerBtn.classList.toggle('open', isOpen);
      burgerBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close when clicking any nav link
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        burgerBtn.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        burgerBtn.classList.remove('open');
        burgerBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 3. Header Background on Scroll & ScrollSpy
  const header = document.querySelector('header');
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('nav.links a');

  const onScroll = () => {
    // Header shadow & blur adjustment
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // ScrollSpy active link detection
    let currentSectionId = '';
    const scrollPosition = window.scrollY + 140;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPosition >= top && scrollPosition < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      const href = item.getAttribute('href');
      if (href === `#${currentSectionId}`) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Scroll to Top Button Visibility
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
      if (window.scrollY > 350) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // initial trigger

  // 4. Scroll To Top Trigger
  const scrollTopBtn = document.getElementById('scrollTopBtn');
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. Service Search and Category Filter
  const serviceSearch = document.getElementById('serviceSearch');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const serviceBlocks = document.querySelectorAll('.service-block');
  const noResults = document.getElementById('noResults');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  let currentCategory = 'all';

  const filterServices = () => {
    const query = serviceSearch ? serviceSearch.value.toLowerCase().trim() : '';
    let totalVisible = 0;

    serviceBlocks.forEach(block => {
      const blockCategory = block.getAttribute('data-category');
      const categoryMatch = (currentCategory === 'all' || blockCategory === currentCategory);

      const items = block.querySelectorAll('.service-list li');
      const blockTitle = block.querySelector('.service-head h3')?.textContent.toLowerCase() || '';
      let blockHasMatch = false;

      items.forEach(li => {
        const text = li.textContent.toLowerCase();
        const textMatch = !query || text.includes(query) || blockTitle.includes(query);

        if (textMatch && categoryMatch) {
          li.style.display = '';
          if (query && text.includes(query)) {
            li.classList.add('highlight');
          } else {
            li.classList.remove('highlight');
          }
          blockHasMatch = true;
        } else {
          li.style.display = 'none';
          li.classList.remove('highlight');
        }
      });

      if (categoryMatch && (blockHasMatch || (!query && categoryMatch))) {
        block.style.display = '';
        totalVisible++;
      } else {
        block.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = totalVisible === 0 ? 'block' : 'none';
    }
  };

  if (serviceSearch) {
    serviceSearch.addEventListener('input', filterServices);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter') || 'all';
      filterServices();
    });
  });

  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      if (serviceSearch) serviceSearch.value = '';
      currentCategory = 'all';
      filterBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-filter') === 'all'));
      filterServices();
    });
  }

  // 6. 1-Click Copy-to-Clipboard & Toast Alerts
  window.copyToClipboard = (text, label) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showToast(`✓ ${label} copiado al portapapeles: ${text}`);
      }).catch(() => {
        fallbackCopy(text, label);
      });
    } else {
      fallbackCopy(text, label);
    }
  };

  const fallbackCopy = (text, label) => {
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand('copy');
      showToast(`✓ ${label} copiado: ${text}`);
    } catch (e) {
      showToast(`Información: ${text}`);
    }
    document.body.removeChild(tempInput);
  };

  const showToast = (message) => {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3200);
  };

  // 7. Interactive Quote Request Form with WhatsApp Dispatch
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleQuoteSubmit('whatsapp');
    });

    const emailSubmitBtn = document.getElementById('sendByEmailBtn');
    if (emailSubmitBtn) {
      emailSubmitBtn.addEventListener('click', () => {
        handleQuoteSubmit('email');
      });
    }
  }

  const handleQuoteSubmit = (mode) => {
    const name = document.getElementById('formName')?.value.trim();
    const company = document.getElementById('formCompany')?.value.trim() || 'No especificada';
    const phone = document.getElementById('formPhone')?.value.trim();
    const email = document.getElementById('formEmail')?.value.trim() || 'No especificado';
    const service = document.getElementById('formService')?.value || 'General';
    const details = document.getElementById('formDetails')?.value.trim();
    const urgency = document.querySelector('input[name="formUrgency"]:checked')?.value || 'Normal';

    if (!name || !phone || !details) {
      alert('Por favor complete los campos obligatorios: Nombre, Teléfono y Detalle del requerimiento.');
      return;
    }

    if (mode === 'whatsapp') {
      const messageText = 
`⚓ *SOLICITUD DE COTIZACIÓN - ARPER* ⚓
━━━━━━━━━━━━━━━━━━━━
👤 *Nombre:* ${name}
🏢 *Empresa / Embarcación:* ${company}
📞 *Teléfono:* ${phone}
✉️ *Correo:* ${email}
⚙️ *Servicio:* ${service}
🚨 *Urgencia:* ${urgency}
━━━━━━━━━━━━━━━━━━━━
📝 *Detalle del Requerimiento:*
${details}
━━━━━━━━━━━━━━━━━━━━
_Enviado desde arper.pe_`;

      const encodedMessage = encodeURIComponent(messageText);
      const whatsappUrl = `https://wa.me/51969013980?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
      showToast('✓ Abriendo WhatsApp para enviar tu cotización...');
    } else if (mode === 'email') {
      const subject = encodeURIComponent(`Solicitud de Cotización: ${service} - ${company}`);
      const body = encodeURIComponent(
`SOLICITUD DE COTIZACIÓN - ARPER SERVICIOS GENERALES
--------------------------------------------------
Nombre: ${name}
Empresa / Embarcación: ${company}
Teléfono: ${phone}
Correo: ${email}
Tipo de Servicio: ${service}
Urgencia: ${urgency}

Detalle del requerimiento o falla:
${details}
--------------------------------------------------`
      );
      window.location.href = `mailto:arper.eirl@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  // 8. Floating WhatsApp Widget Popup Toggle
  const waToggleBtn = document.getElementById('waToggleBtn');
  const waPopup = document.getElementById('waPopup');
  const waCloseBtn = document.getElementById('waCloseBtn');

  if (waToggleBtn && waPopup) {
    waToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      waPopup.classList.toggle('active');
    });

    if (waCloseBtn) {
      waCloseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        waPopup.classList.remove('active');
      });
    }

    document.addEventListener('click', (e) => {
      if (!waPopup.contains(e.target) && e.target !== waToggleBtn) {
        waPopup.classList.remove('active');
      }
    });
  }

  // 9. Animated Metric Counters
  const countElements = document.querySelectorAll('[data-count]');
  if (countElements.length > 0 && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const prefix = el.getAttribute('data-prefix') || '';
          const suffix = el.getAttribute('data-suffix') || '';
          const duration = 1800; // ms
          const startTime = performance.now();

          const updateCount = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // easeOutQuad
            const current = Math.floor(progress * (2 - progress) * target);
            el.textContent = `${prefix}${current}${suffix}`;

            if (progress < 1) {
              requestAnimationFrame(updateCount);
            } else {
              el.textContent = `${prefix}${target}${suffix}`;
            }
          };

          requestAnimationFrame(updateCount);
          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    countElements.forEach(el => counterObserver.observe(el));
  }
});
