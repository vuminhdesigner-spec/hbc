/* resize-handle.js — behaviour for `.resize-handle[data-resize-target]`; contract ds/components/resize-handle.md. */
(function (global, document) {
  "use strict";

  var VAR = "--resize-size";

  function init(handle) {
    var column = handle.parentElement;
    var container = column.parentElement;
    var key = handle.getAttribute("data-resize-storage-key");
    var drag = null; // { offset, min, max, def, raf, next }
    var wasActive = false;

    // Min/step are authored as tokens in CSS; measure them through a probe.
    function measure(prop) {
      var probe = document.createElement("div");
      probe.style.cssText = "position:absolute;visibility:hidden;inline-size:var(" + prop + ")";
      handle.appendChild(probe);
      var px = probe.getBoundingClientRect().width;
      handle.removeChild(probe);
      return Math.round(px);
    }

    function active() {
      return getComputedStyle(handle).display !== "none";
    }

    function bounds() {
      var min = measure("--resize-min");
      return { min: min, max: Math.max(min, Math.floor(container.clientWidth / 2)) };
    }

    // Width the screen's CSS gives with no override (differs per tier).
    function getDefault() {
      var o = container.style.getPropertyValue(VAR);
      if (o) container.style.removeProperty(VAR);
      var w = Math.round(column.getBoundingClientRect().width);
      if (o) container.style.setProperty(VAR, o);
      return w;
    }

    function current() {
      return Math.round(column.getBoundingClientRect().width);
    }

    function sync(b) {
      b = b || bounds();
      var now = current();
      handle.setAttribute("aria-valuemin", String(b.min));
      handle.setAttribute("aria-valuemax", String(b.max));
      handle.setAttribute("aria-valuenow", String(now));
      handle.setAttribute("aria-valuetext", now + " px");
    }

    function apply(width, b, def) {
      var next = Math.min(b.max, Math.max(b.min, Math.round(width)));
      if (next === def) container.style.removeProperty(VAR);
      else container.style.setProperty(VAR, next + "px");
      sync(b);
      return next;
    }

    function save(value) {
      if (!key) return;
      try {
        if (value === null) global.localStorage.removeItem(key);
        else global.localStorage.setItem(key, String(value));
      } catch (e) {
        /* storage blocked: width is simply not remembered */
      }
    }

    function load() {
      if (!key) return null;
      try {
        var n = parseInt(global.localStorage.getItem(key), 10);
        return isFinite(n) ? n : null;
      } catch (e) {
        return null;
      }
    }

    function reset() {
      container.style.removeProperty(VAR);
      save(null);
      sync();
    }

    function stop() {
      if (!drag) return;
      if (drag.raf) global.cancelAnimationFrame(drag.raf);
      var def = drag.def;
      drag = null;
      handle.classList.remove("is-dragging");
      container.classList.remove("is-resizing");
      var w = current();
      save(w === def ? null : w);
    }

    handle.addEventListener("pointerdown", function (event) {
      if (event.button !== 0 || !active()) return;
      event.preventDefault();
      var b = bounds();
      drag = {
        // Pointer offset from the column's inline-end edge, so the edge does not jump to the pointer.
        offset: event.clientX - column.getBoundingClientRect().right,
        min: b.min,
        max: b.max,
        def: getDefault(),
        raf: 0,
        next: 0,
      };
      handle.setPointerCapture(event.pointerId);
      handle.classList.add("is-dragging");
      container.classList.add("is-resizing");
      handle.focus();
    });

    handle.addEventListener("pointermove", function (event) {
      if (!drag) return;
      drag.next = event.clientX - drag.offset - column.getBoundingClientRect().left;
      if (drag.raf) return;
      drag.raf = global.requestAnimationFrame(function () {
        if (!drag) return;
        drag.raf = 0;
        apply(drag.next, drag, drag.def);
      });
    });

    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("lostpointercapture", stop);
    handle.addEventListener("dblclick", reset);

    handle.addEventListener("keydown", function (event) {
      var b = bounds();
      var width;
      if (event.key === "Enter") {
        event.preventDefault();
        reset();
        return;
      }
      if (event.key === "ArrowLeft") width = current() - measure("--resize-step");
      else if (event.key === "ArrowRight") width = current() + measure("--resize-step");
      else if (event.key === "Home") width = b.min;
      else if (event.key === "End") width = b.max;
      else return;
      event.preventDefault();
      var def = getDefault();
      var next = apply(width, b, def);
      save(next === def ? null : next);
    });

    // Container size changes (window, nav collapse, tier switch): re-clamp, or re-apply the saved width on narrow -> wide.
    function onContainerResize() {
      var isActive = active();
      if (isActive && !wasActive) {
        var saved = load();
        if (saved !== null) apply(saved, bounds(), getDefault());
      } else if (isActive && !drag) {
        if (container.style.getPropertyValue(VAR)) apply(current(), bounds(), getDefault());
      }
      wasActive = isActive;
      if (isActive) sync();
    }

    onContainerResize();
    if (global.ResizeObserver) new global.ResizeObserver(onContainerResize).observe(container);
    else global.addEventListener("resize", onContainerResize);
  }

  var handles = document.querySelectorAll(".resize-handle[data-resize-target]");
  for (var i = 0; i < handles.length; i++) init(handles[i]);
})(window, document);
