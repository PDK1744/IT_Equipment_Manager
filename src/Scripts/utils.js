document.addEventListener("DOMContentLoaded", () => {
  // ...existing code...

  // Add menu toggle functionality
  const menuToggle = document.getElementById("menuToggle");
  const sidenav = document.querySelector(".sidenav");

  menuToggle.addEventListener("click", () => {
    sidenav.classList.toggle("active");
  });

  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !sidenav.contains(e.target) &&
      !menuToggle.contains(e.target) &&
      sidenav.classList.contains("active")
    ) {
      sidenav.classList.remove("active");
    }
  });

  const themeToggle = document.getElementById("themeToggle");
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = prefersDarkScheme.matches ? "dark" : "light";
  const currentTheme = savedTheme || systemTheme;

  // Apply theme on load
  document.documentElement.setAttribute("data-theme", currentTheme);
  updateIcon(currentTheme);

  // Toggle theme on button click
  themeToggle.addEventListener("click", () => {
    const newTheme =
      document.documentElement.getAttribute("data-theme") === "dark"
        ? "light"
        : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateIcon(newTheme);
  });

  // Update icon based on theme
  function updateIcon(theme) {
    const icon = themeToggle.querySelector("i");
    icon.className = theme === "dark" ? "fas fa-moon" : "fas fa-sun";
  }
});
