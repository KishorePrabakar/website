// Tiny script – smooth anchor scroll + fun console msg
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href')).scrollIntoView({
      behavior: 'smooth'
    });
  });
});

console.log('%c portfolio vibe loading... 🚀', 'color:#14b8a6; font-size:14px; font-weight:bold;');
