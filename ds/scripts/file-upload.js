/* file-upload.js — drag-over class + click-anywhere-to-pick for .file-upload (file-upload.md); picker stays the consumer's, reached via the .file-upload__trigger button. */
(function () {
  "use strict";

  const PANE = ".file-upload";
  const depth = new WeakMap();

  // Only an empty pane (State A) takes drops; preview panes never do.
  function paneOf(event) {
    const pane = event.target instanceof Element ? event.target.closest(PANE) : null;
    return pane && !pane.classList.contains("is-filled") && !pane.classList.contains("is-unsupported") ? pane : null;
  }

  function hasFiles(event) {
    const types = event.dataTransfer && event.dataTransfer.types;
    return !!types && Array.prototype.indexOf.call(types, "Files") !== -1;
  }

  function clear(pane) {
    depth.delete(pane);
    pane.classList.remove("is-dragover");
  }

  function clearAll() {
    document.querySelectorAll(PANE + ".is-dragover").forEach(clear);
  }

  document.addEventListener("dragenter", (event) => {
    const pane = paneOf(event);
    if (!pane || !hasFiles(event)) return;
    depth.set(pane, (depth.get(pane) || 0) + 1);
    pane.classList.add("is-dragover");
  });

  document.addEventListener("dragover", (event) => {
    const pane = paneOf(event);
    if (pane && hasFiles(event)) pane.classList.add("is-dragover");
  });

  document.addEventListener("dragleave", (event) => {
    const pane = paneOf(event);
    if (!pane) return;
    const next = (depth.get(pane) || 1) - 1;
    if (next <= 0) clear(pane);
    else depth.set(pane, next);
  });

  // Capture: consumers may stop propagation on drop; the class must still go.
  document.addEventListener("drop", clearAll, true);
  document.addEventListener("dragend", clearAll, true);

  document.addEventListener("click", (event) => {
    const zone = event.target instanceof Element ? event.target.closest(".file-upload__dropzone") : null;
    if (!zone) return;
    const control = event.target.closest("a, button, input, label, [role]");
    if (control && zone.contains(control)) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    const pane = zone.closest(PANE);
    if (!pane || pane.classList.contains("is-filled") || pane.classList.contains("is-unsupported")) return;
    const trigger = zone.querySelector(".file-upload__trigger");
    if (trigger) trigger.click();
  });
})();
