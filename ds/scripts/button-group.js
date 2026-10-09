/* button-group.js — menu "⋯" cho group >4 ô (button-group.md § Overflow); chọn trong menu thì DI CHUYỂN node vào ô thứ 3 để listener của màn vẫn chạy. */
(function (global, document) {
  "use strict";

  var GROUP_SELECTOR = ".button-group";
  var MORE_SELECTOR = ".button-group__more";
  var MENU_SELECTOR = ".button-group__menu";
  var ITEM_SELECTOR = ".button-group__menu-item";

  var openGroup = null; // the one group whose menu is open, or null

  function children(el, selector) {
    return Array.prototype.filter.call(el.children, function (child) {
      return child.matches(selector);
    });
  }

  function menuItems(menu) {
    return Array.prototype.slice.call(menu.querySelectorAll(ITEM_SELECTOR));
  }

  /* Đặt vị trí như select.js place(), không lật. */
  function place(group) {
    var more = group.querySelector(MORE_SELECTOR);
    var menu = group.querySelector(MENU_SELECTOR);
    if (!more || !menu) return;
    var box = more.getBoundingClientRect();
    var styles = getComputedStyle(document.documentElement);
    var offset =
      parseFloat(styles.getPropertyValue("--utui-button-group-menu-offset")) || 4;
    var viewportWidth = document.documentElement.clientWidth;
    menu.style.top = Math.round(box.bottom + offset) + "px";
    var left = box.right - menu.offsetWidth;
    var maxLeft = viewportWidth - menu.offsetWidth - offset;
    menu.style.left = Math.round(Math.max(offset, Math.min(left, maxLeft))) + "px";
  }

  function open(group) {
    if (openGroup === group) return;
    if (openGroup) close(openGroup, false);
    var more = group.querySelector(MORE_SELECTOR);
    var menu = group.querySelector(MENU_SELECTOR);
    if (!more || !menu) return;
    menu.hidden = false;
    more.setAttribute("aria-expanded", "true");
    openGroup = group;
    place(group);
  }

  function close(group, returnFocus) {
    if (openGroup !== group) return;
    var more = group.querySelector(MORE_SELECTOR);
    var menu = group.querySelector(MENU_SELECTOR);
    openGroup = null;
    if (menu) menu.hidden = true;
    if (more) {
      more.setAttribute("aria-expanded", "false");
      if (returnFocus) more.focus();
    }
  }

  function focusItem(item) {
    if (item) item.focus();
  }

  /* Đổi chỗ item menu với ô thứ 3, giữ nguyên node. */
  function selectMenuItem(group, item) {
    var more = group.querySelector(MORE_SELECTOR);
    var menu = group.querySelector(MENU_SELECTOR);
    if (!more || !menu) return;
    var displaced = more.previousElementSibling;
    if (!displaced || !displaced.classList.contains("button-group__item")) return;

    item.classList.remove("button-group__menu-item");
    item.classList.add("button-group__item");
    item.removeAttribute("role");
    item.removeAttribute("aria-checked");
    item.removeAttribute("tabindex");
    group.insertBefore(item, more);

    displaced.classList.remove("button-group__item");
    displaced.classList.add("button-group__menu-item");
    displaced.setAttribute("role", "menuitemradio");
    displaced.setAttribute(
      "aria-checked",
      displaced.classList.contains("is-active") ? "true" : "false"
    );
    displaced.setAttribute("tabindex", "-1");
    menu.insertBefore(displaced, menu.firstChild);

    close(group, false);
    item.focus();
  }

  function onMoreClick(event) {
    var more = event.currentTarget;
    var group = more.closest(GROUP_SELECTOR);
    if (!group) return;
    if (openGroup === group) close(group, true);
    else open(group);
  }

  function onMoreKeydown(event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    var more = event.currentTarget;
    var group = more.closest(GROUP_SELECTOR);
    if (!group) return;
    event.preventDefault();
    open(group);
    var menu = group.querySelector(MENU_SELECTOR);
    var items = menu ? menuItems(menu) : [];
    if (!items.length) return;
    focusItem(event.key === "ArrowUp" ? items[items.length - 1] : items[0]);
  }

  function onMenuClick(event) {
    var item = event.target.closest(ITEM_SELECTOR);
    if (!item) return;
    var group = event.currentTarget.closest(GROUP_SELECTOR);
    if (!group) return;
    selectMenuItem(group, item);
  }

  function onMenuKeydown(event) {
    var menu = event.currentTarget;
    var group = menu.closest(GROUP_SELECTOR);
    if (!group) return;
    var items = menuItems(menu);
    var active = document.activeElement;
    var index = items.indexOf(active);

    if (event.key === "Escape") {
      event.preventDefault();
      close(group, true);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusItem(items[(index + 1 + items.length) % items.length]);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      focusItem(items[(index - 1 + items.length) % items.length]);
      return;
    }
    if (event.key === "Tab") {
      close(group, false);
    }
  }

  function init(root) {
    var scope = root || document;
    var groups = scope.querySelectorAll(GROUP_SELECTOR + ":has(> " + MORE_SELECTOR + ")");
    groups.forEach(function (group) {
      if (group.dataset.buttonGroupInit) return;
      group.dataset.buttonGroupInit = "true";

      var more = group.querySelector(MORE_SELECTOR);
      var menu = group.querySelector(MENU_SELECTOR);
      if (!more || !menu) return;

      if (!more.hasAttribute("aria-haspopup")) more.setAttribute("aria-haspopup", "menu");
      if (!more.hasAttribute("aria-expanded")) more.setAttribute("aria-expanded", "false");
      if (!more.hasAttribute("aria-label")) more.setAttribute("aria-label", "Thêm lựa chọn");
      if (!more.hasAttribute("type")) more.setAttribute("type", "button");
      if (!menu.hasAttribute("role")) menu.setAttribute("role", "menu");
      if (!menu.hasAttribute("hidden")) menu.hidden = true;

      menuItems(menu).forEach(function (item) {
        if (!item.hasAttribute("role")) item.setAttribute("role", "menuitemradio");
        if (!item.hasAttribute("aria-checked")) item.setAttribute("aria-checked", "false");
        item.setAttribute("tabindex", "-1");
      });

      more.addEventListener("click", onMoreClick);
      more.addEventListener("keydown", onMoreKeydown);
      menu.addEventListener("click", onMenuClick);
      menu.addEventListener("keydown", onMenuKeydown);
    });
  }

  /* Bấm ngoài thì đóng menu. */
  document.addEventListener(
    "pointerdown",
    function (event) {
      if (!openGroup) return;
      if (openGroup.contains(event.target)) return;
      close(openGroup, false);
    },
    true
  );

  /* Đặt lại vị trí khi cuộn/đổi cỡ. */
  ["scroll", "resize"].forEach(function (type) {
    global.addEventListener(
      type,
      function () {
        if (openGroup) place(openGroup);
      },
      { capture: true, passive: true }
    );
  });

  init(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  }

  global.OmeuButtonGroup = { init: init };
})(window, document);
