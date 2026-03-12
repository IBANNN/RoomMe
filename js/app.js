// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();   // Load cached user from localStorage
  Router.init(); // Start routing
});
