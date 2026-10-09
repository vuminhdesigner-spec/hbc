/* attachment.js — thu gọn/mở Attachment pane (attachment.md); lưu sessionStorage, phát "attachment:toggle"; { persist: false } và data-attachment-persist="none" tắt lưu. */
(function (global) {
  "use strict";

  const SELECTOR = ".attachment-pane";
  const STORAGE_PREFIX = "mdm.attachment-collapsed.";

  function storageKey(pane) {
    return STORAGE_PREFIX + location.pathname + "#" + (pane.id || "attachmentPane");
  }

  // null = "chưa từng chọn" (khác true/false) — để authored state làm mặc định thay vì luôn đọc ra "expanded".
  function readStored(pane) {
    try {
      const raw = global.sessionStorage.getItem(storageKey(pane));
      return raw === null ? null : raw === "1";
    } catch (error) {
      return null;
    }
  }

  function writeStored(pane, collapsed) {
    try {
      global.sessionStorage.setItem(storageKey(pane), collapsed ? "1" : "0");
    } catch (error) {
      // Không fatal: state trang hiện tại vẫn đúng.
    }
  }

  function create(pane) {
    const collapse = pane.querySelector(".attachment-pane__collapse");
    const expand = pane.querySelector(".attachment-pane__expand");
    // Phải có cả hai nút, không thì pane có state không thoát ra được.
    if (!collapse || !expand) return null;

    const persists = pane.dataset.attachmentPersist !== "none";

    function apply(collapsed) {
      pane.classList.toggle("is-collapsed", collapsed);
      const expanded = String(!collapsed);
      collapse.setAttribute("aria-expanded", expanded);
      expand.setAttribute("aria-expanded", expanded);
    }

    function set(collapsed, options) {
      const opts = options || {};
      // changed gate cả event lẫn ghi storage; reveal() trên pane đã mở không được cướp focus hay bắn event thừa.
      const changed = collapsed !== pane.classList.contains("is-collapsed");
      if (!changed && opts.focus !== true) return;
      const active = document.activeElement;
      const losing = Boolean(active && active !== document.body && pane.contains(active));

      apply(collapsed);
      if (changed && persists && opts.persist !== false) writeStored(pane, collapsed);

      // Control vừa nhấn biến mất khỏi DOM nên focus rơi về <body> nếu không dời — dời trong cùng task để không lọt qua <body>.
      const next = collapsed ? expand : collapse;
      if (opts.focus === true || (opts.focus !== false && losing)) next.focus();

      if (changed) {
        pane.dispatchEvent(
          new CustomEvent("attachment:toggle", {
            bubbles: true,
            detail: { collapsed: collapsed, pane: pane },
          }),
        );
      }
    }

    function onCollapse() {
      set(true, { focus: true });
    }

    function onExpand() {
      set(false, { focus: true });
    }

    collapse.addEventListener("click", onCollapse);
    expand.addEventListener("click", onExpand);

    // Khôi phục trước paint đầu tiên; authored state (.is-collapsed trong markup) là mặc định khi chưa có gì lưu.
    const stored = persists ? readStored(pane) : null;
    apply(stored === null ? pane.classList.contains("is-collapsed") : stored);

    return {
      element: pane,
      get collapsed() {
        return pane.classList.contains("is-collapsed");
      },
      collapse: function (options) {
        set(true, options);
      },
      expand: function (options) {
        set(false, options);
      },
      destroy: function () {
        collapse.removeEventListener("click", onCollapse);
        expand.removeEventListener("click", onExpand);
      },
    };
  }

  const instances = [];

  function init(root) {
    const scope = root || document;
    scope.querySelectorAll(SELECTOR).forEach(function (pane) {
      if (instances.some((entry) => entry.element === pane)) return;
      const instance = create(pane);
      if (instance) instances.push(instance);
    });
    return instances;
  }

  function get(target) {
    const element = typeof target === "string" ? document.getElementById(target) : target;
    if (!element) return null;
    return instances.find((entry) => entry.element === element) || null;
  }

  function destroy() {
    while (instances.length) instances.pop().destroy();
  }

  global.OmeuAttachment = { init: init, get: get, destroy: destroy, instances: instances };

  init();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init();
    });
  }
})(window);
