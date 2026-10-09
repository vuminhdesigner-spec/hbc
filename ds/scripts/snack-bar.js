/* snack-bar.js — thanh hành động chọn nhiều (ds/components/snack-bar.md). Tự chèn markup; load TRƯỚC bundle của màn. Port từ mdm-portal + setCta/setItem (nhãn, vô hiệu kèm lý do). */

(function (global) {
  "use strict";
  var ICON_GLYPH_CLASS = "material-symbols-outlined";
  var menuSeq = 0;
  function glyph(name) {
    var span = global.document.createElement("span");
    span.className = ICON_GLYPH_CLASS;
    span.setAttribute("aria-hidden", "true");
    span.textContent = name;
    return span;
  }
  function iconButton(glyphName, label) {
    var button = global.document.createElement("button");
    button.type = "button";
    button.className = "snack-bar__icon-button";
    button.setAttribute("aria-label", label);
    button.appendChild(glyph(glyphName));
    return button;
  }
  function defaultMessage(count, noun) {
    return "Đang chọn " + count + " " + noun;
  }
  function create(options) {
    var config = options || {};
    var doc = global.document;
    var mode = config.mode === "light" ? "light" : "dark";
    var noun = config.noun || "mục";
    var formatMessage =
      typeof config.message === "function"
        ? config.message
        : function (count) {
            return defaultMessage(count, noun);
          };
    var region = doc.createElement("div");
    region.className = "snack-bar-region" + (config.inline ? " snack-bar-region--inline" : "") + (config.anchored ? " snack-bar-region--anchored" : "");
    var bar = doc.createElement("div");
    bar.className = "snack-bar" + (mode === "light" ? " snack-bar--light" : "");
    bar.hidden = true;
    var message = doc.createElement("p");
    message.className = "snack-bar__message";
    message.setAttribute("role", "status");
    var actions = doc.createElement("div");
    actions.className = "snack-bar__actions";
    var cta = null;
    if (config.cta && config.cta.label) {
      cta = doc.createElement("button");
      cta.type = "button";
      cta.className = "snack-bar__cta";
      cta.textContent = config.cta.label;
      cta.addEventListener("click", function () {
        if (cta.getAttribute("aria-disabled") === "true") return;
        if (typeof config.cta.onSelect === "function") config.cta.onSelect();
      });
      actions.appendChild(cta);
    }
    var icons = doc.createElement("div");
    icons.className = "snack-bar__icons";
    // Hành động phụ dạng icon (đứng trước ⋮ và nút bỏ chọn); nhãn là aria-label, không có chữ.
    var iconActions = Array.isArray(config.iconActions) ? config.iconActions : [];
    var iconActionButtons = iconActions.map(function (action) {
      var btn = iconButton(action.glyph, action.label || "");
      btn.setAttribute("data-tooltip", action.label || "");
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-disabled") === "true") return;
        if (typeof action.onSelect === "function") action.onSelect();
      });
      icons.appendChild(btn);
      return btn;
    });
    var items = Array.isArray(config.items) ? config.items : [];
    var menu = null;
    var trigger = null;
    var open = false;
    if (items.length) {
      menuSeq += 1;
      var menuId = "snackBarMenu" + menuSeq;
      menu = doc.createElement("div");
      menu.className = "snack-bar__menu";
      menu.id = menuId;
      menu.setAttribute("role", "menu");
      menu.setAttribute("aria-label", config.moreLabel || "Thao tác khác");
      menu.hidden = true;
      items.forEach(function (item) {
        if (item.divider) {
          var rule = doc.createElement("hr");
          rule.className = "snack-bar__menu-divider";
          menu.appendChild(rule);
        }
        var row = doc.createElement("button");
        row.type = "button";
        row.className = "snack-bar__menu-item";
        row.setAttribute("role", "menuitem");
        if (item.glyph) row.appendChild(glyph(item.glyph));
        var label = doc.createElement("span");
        label.textContent = item.label == null ? "" : String(item.label);
        row.appendChild(label);
        row._label = label;
        row.addEventListener("click", function () {
          if (row.getAttribute("aria-disabled") === "true") return;
          closeMenu(false);
          if (typeof item.onSelect === "function") item.onSelect();
        });
        menu.appendChild(row);
      });
      trigger = iconButton("more_vert", config.moreLabel || "Thao tác khác");
      trigger.setAttribute("aria-haspopup", "menu");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", menuId);
      icons.appendChild(trigger);
    }
    var clear = iconButton("close", config.clearLabel || "Bỏ chọn tất cả");
    clear.addEventListener("click", function () {
      hide();
      if (typeof config.onClear === "function") config.onClear();
    });
    icons.appendChild(clear);
    actions.appendChild(icons);
    bar.appendChild(message);
    bar.appendChild(actions);
    if (menu) bar.appendChild(menu);
    region.appendChild(bar);
    (config.mount || doc.body).appendChild(region);
    function rows() {
      return Array.prototype.slice.call(menu.querySelectorAll(".snack-bar__menu-item"));
    }
    function setOpen(next) {
      if (!menu) return;
      open = next;
      menu.hidden = !next;
      trigger.setAttribute("aria-expanded", String(next));
      if (next) {
        var first = rows()[0];
        if (first) first.focus();
      }
    }
    function closeMenu(returnFocus) {
      if (!open) return;
      setOpen(false);
      if (returnFocus) trigger.focus();
    }
    function onDocumentKeydown(event) {
      if (!open) return;
      if (event.key === "Escape") {
        closeMenu(true);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      var all = rows();
      var index = all.indexOf(doc.activeElement);
      if (index === -1) return;
      event.preventDefault();
      var step = event.key === "ArrowDown" ? 1 : -1;
      var next = all[(index + step + all.length) % all.length];
      if (next) next.focus();
    }
    function onDocumentClick(event) {
      if (!open) return;
      if (bar.contains(event.target)) return;
      closeMenu(false);
    }
    if (menu) {
      trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        setOpen(!open);
      });
      doc.addEventListener("keydown", onDocumentKeydown);
      doc.addEventListener("click", onDocumentClick);
    }
    var pending = null;
    var lastCount = 0;
    function moveFocusOut() {
      if (!bar.contains(doc.activeElement)) return;
      var target = typeof config.returnFocus === "function" ? config.returnFocus() : config.returnFocus;
      if (!target || typeof target.focus !== "function") {
        target = region.parentNode;
        if (!target || typeof target.focus !== "function") return;
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      }
      target.focus();
    }
    function show() {
      bar.hidden = false;
      if (lastCount > 0 && message.textContent === "") setCount(lastCount);
    }
    function hide() {
      closeMenu(false);
      if (pending) {
        global.clearTimeout(pending);
        pending = null;
      }
      moveFocusOut();
      bar.hidden = true;
      message.textContent = "";
    }
    function setCount(count) {
      var value = Number(count) || 0;
      if (value <= 0) {
        hide();
        return;
      }
      lastCount = value;
      bar.hidden = false;
      var text = formatMessage(value);
      if (pending) global.clearTimeout(pending);
      pending = global.setTimeout(function () {
        pending = null;
        message.textContent = text;
      }, 32);
    }

    // reason rỗng = dùng được; có reason = aria-disabled + tooltip + tên truy cập kèm lý do
    function applyState(el, labelNode, label, reason) {
      labelNode.textContent = label;
      if (reason) {
        el.setAttribute("aria-disabled", "true");
        el.setAttribute("data-tooltip", reason);
        el.setAttribute("aria-label", label + ". " + reason);
      } else {
        el.removeAttribute("aria-disabled");
        el.removeAttribute("data-tooltip");
        el.removeAttribute("aria-label");
      }
    }

    function setCta(label, reason) {
      if (cta) applyState(cta, cta, label, reason);
    }

    // Icon-button: bật = aria-label và tooltip cùng `label`; reason = aria-disabled, tooltip là lý do, aria-label "label. reason".
    function setIconAction(index, label, reason) {
      var btn = iconActionButtons[index];
      if (!btn) return;
      if (reason) {
        btn.setAttribute("aria-disabled", "true");
        btn.setAttribute("aria-label", label + ". " + reason);
        btn.setAttribute("data-tooltip", reason);
      } else {
        btn.removeAttribute("aria-disabled");
        btn.setAttribute("aria-label", label);
        btn.setAttribute("data-tooltip", label);
      }
    }

    function setItem(index, label, reason) {
      if (!menu) return;
      var row = rows()[index];
      if (row) applyState(row, row._label, label, reason);
    }

    function destroy() {
      if (menu) {
        doc.removeEventListener("keydown", onDocumentKeydown);
        doc.removeEventListener("click", onDocumentClick);
      }
      if (pending) global.clearTimeout(pending);
      if (region.parentNode) region.parentNode.removeChild(region);
    }
    return {
      element: bar,
      region: region,
      setCount: setCount,
      setCta: setCta,
      setItem: setItem,
      setIconAction: setIconAction,
      show: show,
      hide: hide,
      destroy: destroy,
    };
  }
  global.OmeuSnackBar = { create: create };
})(window);
