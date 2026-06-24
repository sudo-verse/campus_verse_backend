// Holds the NotificationService instance so REST routes can reach it too.
let instance = null;

module.exports = {
  set(service) {
    instance = service;
  },
  get() {
    return instance;
  },
};
