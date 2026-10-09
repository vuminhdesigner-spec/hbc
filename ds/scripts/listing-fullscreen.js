/* Nút toàn màn hình của trang listing — state CSS `.is-fullscreen` trên `.mdm-shell`; contract ds/components/app-shell.md § Fullscreen mode. */
(function (global) {
  "use strict";

  var SELECTOR = "[data-action='toggle-fullscreen']";
  var wired = typeof WeakSet === "function" ? new WeakSet() : null;

  function wire(button) {
    if (wired) {
      if (wired.has(button)) return;
      wired.add(button);
    }

    var shell = button.closest(".mdm-shell");
    if (!shell) return;
    var glyph = button.querySelector(".material-symbols-outlined");

    function isFullscreen() {
      return shell.classList.contains("is-fullscreen");
    }

    function set(on) {
      shell.classList.toggle("is-fullscreen", on);
      button.setAttribute("aria-label", on ? "Thoát toàn màn hình" : "Mở toàn màn hình");
      if (glyph) glyph.textContent = on ? "close_fullscreen" : "open_in_full";
      // Màn tự đặt lại filter panel theo resize.
      global.dispatchEvent(new Event("resize"));
      if (!on && global.OmeuMetricScroll) global.OmeuMetricScroll.refresh();
    }

    button.addEventListener("click", function () {
      set(!isFullscreen());
    });

    // Chụp trạng thái lớp ở pha capture, trước khi handler của lớp đó tự đóng.
    var claimed = false;
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var target = event.target;
      var filterToggle = document.getElementById("filterToggle");
      claimed = !!(
        (filterToggle && filterToggle.getAttribute("aria-expanded") === "true") ||
        document.querySelector(".modal:not([hidden]), .drawer:not([hidden])") ||
        (target && target.matches && target.matches("input[type='search']") && target.value)
      );
    }, true);

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape" || !isFullscreen()) return;
      if (event.defaultPrevented || claimed) return;
      var active = document.activeElement;
      var keepFocus =
        active &&
        active.offsetParent !== null &&
        (active.closest(".listing-toolbar") || active.closest(".table-panel"));
      set(false);
      if (!keepFocus) button.focus();
    });
  }

  function init(root) {
    var scope = root || document;
    scope.querySelectorAll(SELECTOR).forEach(wire);
  }

  global.OmeuListingFullscreen = { init: init };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  } else {
    init();
  }
})(window);
