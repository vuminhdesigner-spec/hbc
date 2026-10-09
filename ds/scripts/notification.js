/* notification.js — renderer dùng chung cho ds/components/notification.md (thay toast).
   Nguồn: OMEU Design System V2, node 9984:54071. Nạp bằng <script src> TRƯỚC bundle của màn.

   Announcement (dễ hỏng nhất):
   - Live region là .notification__text (title + description), không phải cả thẻ: nút không bị đọc lại. Append RỖNG, chữ ghi sau một nhịp (setTimeout, không rAF vì tab ẩn không chạy rAF).
   - success/info/warning: role="status" (polite). alert: role="alert" (assertive).
   - Không bao giờ lấy focus; nút đóng phải với tới được bằng Tab. */

(function () {
  "use strict";

  var STACK_ID = "notificationStack";
  // Tự đóng: success/info không có CTA. Đếm dừng khi hover/focus-within.
  var AUTO_DISMISS_MS = 5000;

  // Tone -> modifier featured-icon. Glyph luôn là `info` (Figma). info dùng tông brand mặc định.
  var TONES = {
    alert: { modifier: "featured-icon--error", role: "alert" },
    warning: { modifier: "featured-icon--warning", role: "status" },
    success: { modifier: "featured-icon--success", role: "status" },
    info: { modifier: "", role: "status" },
  };

  // Stack nằm sẵn trong HTML của màn (có mặt ở cây a11y từ first paint); thiếu thì tạo.
  function getStack() {
    var stack = document.getElementById(STACK_ID);
    if (stack) return stack;
    stack = document.createElement("div");
    stack.className = "notification-stack";
    stack.id = STACK_ID;
    document.body.appendChild(stack);
    return stack;
  }

  function glyph(name) {
    var span = document.createElement("span");
    span.className = "material-symbols-outlined";
    span.setAttribute("aria-hidden", "true");
    span.textContent = name;
    return span;
  }

  function linkButton(label, gray) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "button " + (gray ? "button--link-gray" : "button--link");
    button.textContent = label;
    return button;
  }

  // Thẻ bị gỡ khỏi DOM thì focus rơi về <body>; nên chuyển focus sang nút đóng của thẻ kế bên nếu có.
  function dismiss(card) {
    var stack = card.parentNode;
    if (!stack) return;
    if (card._timer) clearTimeout(card._timer);
    var cards = Array.prototype.slice.call(stack.children);
    var index = cards.indexOf(card);
    var hadFocus = card.contains(document.activeElement);
    stack.removeChild(card);
    if (!hadFocus) return;
    var next = stack.children[index] || stack.children[index - 1];
    if (next) {
      var close = next.querySelector(".notification__close");
      if (close) close.focus();
    }
  }

  /* show({ title, description, tone, cta: { label, onActivate }, autoDismiss, closeLabel, slot }) -> thẻ.
     tone: alert | warning | success | info (mặc định success).
     cta: một hành động; success/info có cta thì kèm nút "Đóng" (link-gray) đứng trước.
     autoDismiss: bỏ trống = theo luật (success/info không cta -> 5000ms); false = ở lại; số = ms. */
  function show(options) {
    var config = options || {};
    var tone = TONES[config.tone] ? config.tone : "success";
    var toneConfig = TONES[tone];
    var cta = config.cta && config.cta.label ? config.cta : null;

    var card = document.createElement("div");
    card.className = "notification notification--" + tone;
    if (config.slot) card._slot = String(config.slot);

    var icon = document.createElement("span");
    icon.className = "featured-icon featured-icon--sm featured-icon--ring" + (toneConfig.modifier ? " " + toneConfig.modifier : "");
    icon.setAttribute("aria-hidden", "true");
    icon.appendChild(glyph("info"));

    var body = document.createElement("div");
    body.className = "notification__body";
    var text = document.createElement("div");
    text.className = "notification__text";
    text.setAttribute("role", toneConfig.role);
    text.setAttribute("aria-atomic", "true");
    var title = document.createElement("p");
    title.className = "notification__title";
    var description = document.createElement("p");
    description.className = "notification__description";
    text.appendChild(title);
    text.appendChild(description);
    body.appendChild(text);

    if (cta) {
      var actions = document.createElement("div");
      actions.className = "notification__actions";
      if (tone === "success" || tone === "info") {
        var dismissButton = linkButton("Đóng", true);
        dismissButton.setAttribute("aria-label", "Đóng thông báo" + (config.title ? ": " + String(config.title) : ""));
        dismissButton.addEventListener("click", function () {
          dismiss(card);
        });
        actions.appendChild(dismissButton);
      }
      var ctaButton = linkButton(cta.label, false);
      ctaButton.addEventListener("click", function () {
        dismiss(card);
        if (typeof cta.onActivate === "function") cta.onActivate();
      });
      actions.appendChild(ctaButton);
      body.appendChild(actions);
    }

    var close = document.createElement("button");
    close.type = "button";
    close.className = "notification__close";
    // Nhãn ghép tiêu đề để hai thẻ đang mở không có hai nút đóng trùng tên.
    var closeLabel = config.closeLabel;
    if (!closeLabel) {
      closeLabel = "Đóng thông báo";
      if (config.title != null && String(config.title) !== "") closeLabel += ": " + String(config.title);
    }
    close.setAttribute("aria-label", closeLabel);
    close.appendChild(glyph("close"));
    close.addEventListener("click", function () {
      dismiss(card);
    });

    card.appendChild(icon);
    card.appendChild(body);
    card.appendChild(close);

    // Esc đóng thẻ đang có focus; không stopPropagation nên Esc của modal/drawer không bị chặn.
    card.addEventListener("keydown", function (event) {
      if (event.key === "Escape") dismiss(card);
    });

    // Một slot một thẻ: thẻ mới cùng slot thay thế thẻ cũ.
    if (card._slot) dismissSlot(card._slot);
    getStack().appendChild(card);
    var titleText = config.title == null ? "" : String(config.title);
    var descriptionText = config.description == null ? "" : String(config.description);
    setTimeout(function () {
      title.textContent = titleText;
      description.textContent = descriptionText;
      description.hidden = descriptionText === "";
    }, 32);

    var ms = config.autoDismiss;
    if (ms === undefined) ms = (tone === "success" || tone === "info") && !cta ? AUTO_DISMISS_MS : false;
    if (typeof ms === "number" && ms > 0) armAutoDismiss(card, ms);

    return card;
  }

  // Dừng đếm khi con trỏ hoặc focus ở trong thẻ; rời hết thì đếm lại từ đầu.
  function armAutoDismiss(card, ms) {
    var hovered = false;
    function arm() {
      if (card._timer) clearTimeout(card._timer);
      card._timer = setTimeout(function () {
        dismiss(card);
      }, ms);
    }
    function pause() {
      if (card._timer) clearTimeout(card._timer);
      card._timer = 0;
    }
    function resume() {
      if (hovered || card.contains(document.activeElement)) return;
      arm();
    }
    card.addEventListener("mouseenter", function () {
      hovered = true;
      pause();
    });
    card.addEventListener("mouseleave", function () {
      hovered = false;
      resume();
    });
    card.addEventListener("focusin", pause);
    card.addEventListener("focusout", function () {
      // activeElement chỉ cập nhật sau focusout.
      setTimeout(resume, 0);
    });
    arm();
  }

  /* notify(title, tone | options) — lối tắt cho thông điệp một dòng: title = thông điệp, không description. */
  function notify(title, extra) {
    var options = typeof extra === "string" ? { tone: extra } : extra || {};
    options.title = title;
    return show(options);
  }

  // Đóng mọi thẻ thuộc một slot (vd. "undo"); không đụng thẻ khác.
  function dismissSlot(slot) {
    var stack = document.getElementById(STACK_ID);
    if (!stack) return;
    Array.prototype.slice.call(stack.children).forEach(function (card) {
      if (card._slot === slot) dismiss(card);
    });
  }

  function dismissAll() {
    var stack = document.getElementById(STACK_ID);
    if (!stack) return;
    while (stack.firstChild) dismiss(stack.firstChild);
  }

  window.OmeuNotification = { show: show, notify: notify, dismiss: dismiss, dismissSlot: dismissSlot, dismissAll: dismissAll };
})();
