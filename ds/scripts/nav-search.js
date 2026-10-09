/* Nav search — see design-system/components/side-navigation.md.
 *
 * The FIELD is specified: `input` 9752:50241 in OMEU Design System V2
 * (SFo9P9PCVQiuOk2SqjZYKQ), sitting one 12px gap under the module trigger.
 * The FILTERING is not. The frame draws the control and says nothing about what
 * it does, and an inert search box repeated across eleven screens is worse than
 * a small stated deviation, so this filters the nav item list client-side and
 * that choice is recorded in the component contract as a deviation.
 *
 * The markup is injected rather than authored, for the same reason
 * scripts/role-switch.js injects its own: the nav block is duplicated across
 * eleven files, so anything those files have to declare is an elevenfold edit
 * every time it changes. A screen adopts the field with one script tag.
 *
 * Two behaviours here are also not in the frame and are deliberate:
 *   - Collapsed, the field is a 40px icon box (which IS drawn, in the collapsed
 *     variants). Activating it expands the nav and focuses the input, because a
 *     search box you cannot type in is not a search box.
 *   - The item list is re-rendered from scratch on module switch, so an active
 *     query is re-applied after each render rather than silently dropped.
 */
(function () {
  const sideNav = document.getElementById("sideNav");
  const navSection = document.getElementById("navSection");
  const navModule = sideNav && sideNav.querySelector(".nav-module");
  if (!sideNav || !navSection || !navModule) return;

  const search = document.createElement("div");
  search.className = "nav-search";
  search.innerHTML = `
    <div class="nav-search__field">
      <span class="material-symbols-outlined" aria-hidden="true">search</span>
      <input class="nav-search__input" type="search" id="navSearchInput"
             placeholder="Tìm kiếm" aria-label="Tìm kiếm điều hướng"
             autocomplete="off">
    </div>`;

  const empty = document.createElement("p");
  empty.className = "nav-search__empty";
  empty.setAttribute("role", "status");
  empty.hidden = true;
  empty.textContent = "Không có mục điều hướng nào khớp.";

  /* The frame groups the trigger and the field into one block with a 12px gap
     (`Frame 740` 9752:50271), inside a container whose blocks are 16px apart.
     Left as a plain sibling the field would sit 16px down, so the block is
     created here — the screens do not author it, same as the field itself. */
  const block = document.createElement("div");
  block.className = "nav-module-block";
  navModule.insertAdjacentElement("beforebegin", block);
  block.appendChild(navModule);
  block.appendChild(search);
  block.insertAdjacentElement("afterend", empty);

  const input = search.querySelector(".nav-search__input");

  // Vietnamese labels are matched without diacritics so `du an` finds `Dự án`.
  const fold = (value) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();

  function apply() {
    const query = fold(input.value);
    const items = navSection.querySelectorAll(".nav-item");
    let shown = 0;

    items.forEach((item) => {
      const label = item.querySelector(".nav-item__label");
      const text = fold((label ? label.textContent : item.textContent) || "");
      const hit = !query || text.includes(query);
      item.hidden = !hit;
      if (hit) shown += 1;
    });

    /* A group whose every item is filtered out hides with them, header
       included — a group label over nothing reads as an empty section rather
       than as a non-match. Groups are restored when the query clears. */
    navSection.querySelectorAll(".nav-group").forEach((group) => {
      const groupItems = group.querySelectorAll(".nav-item");
      const anyVisible = Array.prototype.some.call(groupItems, (i) => !i.hidden);
      group.hidden = Boolean(query) && groupItems.length > 0 && !anyVisible;
    });

    empty.hidden = !query || shown > 0 || items.length === 0;
  }

  input.addEventListener("input", apply);

  input.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !input.value) return;
    input.value = "";
    apply();
  });

  /* Collapsed, only the icon is visible; typing has to expand the rail first.
     The toggle owns the collapse state, so this asks it rather than setting the
     class here and leaving its aria out of step. */
  search.addEventListener("mousedown", (event) => {
    if (!sideNav.classList.contains("is-collapsed")) return;
    event.preventDefault();
    /* Every tier can expand now: below xl the nav expands as an overlay over
       the page (../styles/responsive.css), so this field works at 375px too. It
       was inert there until 2026-09-17, when `sm` forced the rail in CSS and hid
       the toggle. The guard stays for a screen that authors no toggle at all. */
    const toggle = document.getElementById("navCollapse");
    if (!toggle || !toggle.offsetParent) return;
    toggle.click();
    window.requestAnimationFrame(() => input.focus());
  });

  // renderNav() replaces the section's contents on every module switch.
  new MutationObserver(() => {
    if (input.value) apply();
  }).observe(navSection, { childList: true, subtree: true });
})();
