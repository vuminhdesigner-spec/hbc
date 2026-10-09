/* select.js — the behaviour half of the `.select` combobox.
   Contract: design-system/components/select.md. Styles: ../styles/select.css.

   Why this is shared and not per-screen: a combobox's obligations are the same
   wherever it appears — report open state, keep exactly one active row for the
   keyboard, move that row with the arrows, commit on Enter, close on Escape and
   on an outside press, and put the value back on the control that opened it. The
   package has one hand-rolled popover already (the filter panel) and one shared
   focus trap (./modal.js); a control that appears in every form is not the place
   for a third copy of the same rules.

   The markup owns the content, this owns the behaviour. Nothing is generated
   from data: the options are authored in the HTML, exactly as they will read, and
   this script only moves, hides, marks and mirrors them. That is what lets the
   trigger show a leading avatar or dot without the screen authoring it twice —
   the chosen option's `.select__option-body` is CLONED into the value row.

   Load it BEFORE the screen bundle, like ./modal.js and ./pagination.js. It
   self-starts once on DOMContentLoaded — as ./metric-scroll.js already does —
   because an unenhanced `.select` is a dead control rather than a degraded one,
   so leaving the first call to each screen would make a forgotten line a broken
   field. `init()` is idempotent and takes a
   root, so markup added later is enhanced by calling it again, and `refresh()` on
   an instance re-reads its rows when a screen injects one.

   Usage — single value, Default type:

     <div class="form-field">
       <label class="form-field__label" for="ownerTrigger" id="ownerLabel">Người phụ trách</label>
       <div class="select" data-select data-select-name="owner">
         <button class="select__control" type="button" id="ownerTrigger"
                 aria-labelledby="ownerLabel" aria-describedby="ownerHint">
           <!-- `aria-labelledby` names the field and NOTHING else: with
                role="combobox" the trigger's own text is announced as the VALUE,
                so folding its id in as well says the value twice and changes the
                control's name every time the user picks. -->
           <span class="select__value">
             <span class="select__placeholder">Chọn người phụ trách</span>
           </span>
           <span class="select__chevron material-symbols-outlined" aria-hidden="true">expand_more</span>
         </button>
         <ul class="select__menu" hidden>
           <li class="select__option" data-value="olivia">
             <span class="select__option-body">
               <span class="select__option-text">Olivia Rhye</span>
               <span class="select__option-support">@olivia</span>
             </span>
           </li>
         </ul>
       </div>
       <p class="form-field__hint" id="ownerHint">Có thể đổi sau khi tạo dự án.</p>
     </div>

   `role`, `aria-expanded`, `aria-controls`, `aria-haspopup`, the menu's
   `role="listbox"`, the options' `role="option"` and their ids are all filled in
   below if the markup omits them — the ids especially, because
   `aria-activedescendant` needs one per row and hand-numbering them is how two
   rows end up sharing an id. Author them when a screen has a reason to; this is a
   floor, not a preference. */
(function (global, document) {
  "use strict";

  /* One open menu at a time, tracked at module scope for the same reason
     ./modal.js tracks one open dialog: two open listboxes mean two rows claiming
     to be the keyboard's position, and the second one to open would leave the
     first painted under it. */
  let openInstance = null;
  let seq = 0;

  const PRINTABLE = /^.$/u;

  /* The floor a capped menu is never squeezed below. Two rows and the block
     padding: under that the popup stops being a list and becomes a slot, and the
     user is better served by a menu that overhangs slightly and scrolls. */
  const MIN_MENU_HEIGHT = 96;

  /* Diacritic- and case-insensitive, because the options are Vietnamese: a user
     typing `du an` must reach `Dự án`, and `đ` does not decompose under NFD the
     way the vowels do, so it is folded by hand. */
  function fold(text) {
    return String(text || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toLowerCase()
      .trim();
  }

  function optionText(option) {
    const body = option.querySelector(".select__option-body") || option;
    return body.textContent.replace(/\s+/g, " ").trim();
  }

  function isDisabled(option) {
    return option.getAttribute("aria-disabled") === "true";
  }

  function ensureId(node, prefix) {
    if (!node.id) {
      seq += 1;
      node.id = prefix + seq;
    }
    return node.id;
  }

  function setup(root) {
    if (root.dataset.selectReady === "true") return;

    const control = root.querySelector(".select__control");
    const menu = root.querySelector(".select__menu");
    if (!control || !menu) return;

    const input = control.querySelector(".select__input");
    /* The focusable half of the trigger. On the typed types that is the input;
       on the rest the control IS a button and takes focus itself. Every ARIA
       attribute below goes on this node, never on the wrapper: a combobox role
       on a <div> that cannot be focused is announced and unreachable — so if the
       markup gives us neither a <button> nor an input, we enhance NOTHING and the
       menu stays hidden. A dead control is recoverable; a control that announces
       itself as a combobox and cannot be reached is not. */
    const combo = input || control;
    if (!input && control.tagName !== "BUTTON") return;
    /* A trigger authored `<button>` with no type submits the form it sits in. The
       markup should say `type="button"`; forgetting it is a data-loss bug rather
       than a style slip, so it is normalised instead of trusted. */
    if (control.tagName === "BUTTON" && !control.getAttribute("type")) {
      control.setAttribute("type", "button");
    }
    const valueNode = root.querySelector(".select__value");
    const tagList = root.querySelector(".select__tags");
    const clearButton = root.querySelector(".select__clear");
    const emptyNode = menu.querySelector(".select__empty");
    const multiple = root.hasAttribute("data-select-multiple") || Boolean(tagList);
    /* Creatable: a query that matches no option offers a last row `Thêm “…”`. Typed + multiple only. */
    const creatable = root.hasAttribute("data-select-creatable") && Boolean(input) && multiple;
    let createOption = null;
    let createText = null;
    const createLabel = root.dataset.selectCreateLabel || "Thêm";
    /* Shown instead of the query placeholder while a Tags control is disabled and holds no chip. */
    const disabledPlaceholder = root.dataset.selectDisabledPlaceholder || "";

    /* The Tags type's QUERY placeholder, captured before the first render so it
       can be put back when the last chip goes. The set draws it only while the
       control is empty — `Type=Tags, State=Placeholder` (9825:60123) is the
       magnifier and the word, `State=Default` (9825:60087) is chips and no query
       text at all — and syncInput() below is where that rule is applied. */
    const queryPlaceholder = input ? input.getAttribute("placeholder") || "" : "";

    /* The placeholder's own words, kept before the first render replaces the
       value row. The markup is the only place they exist. */
    const placeholderNode = valueNode && valueNode.querySelector(".select__placeholder");
    const placeholder =
      root.dataset.selectPlaceholder ||
      (placeholderNode ? placeholderNode.textContent.trim() : "");

    /* A leading glyph authored beside the placeholder, kept for the empty state. */
    const placeholderLead = valueNode && valueNode.querySelector(":scope > .select__lead");

    let hiddenInput = null;
    if (root.dataset.selectName) {
      hiddenInput = root.querySelector('input[type="hidden"][data-select-field]');
      if (!hiddenInput) {
        hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.setAttribute("data-select-field", "");
        root.appendChild(hiddenInput);
      }
      hiddenInput.name = root.dataset.selectName;
    }

    ensureId(menu, "selectMenu");
    if (!menu.getAttribute("role")) menu.setAttribute("role", "listbox");
    if (multiple) menu.setAttribute("aria-multiselectable", "true");
    /* The listbox needs a name of its own: a screen reader entering the popup
       announces the list before any row in it. The field's label is the only
       honest source, so the first id of the trigger's `aria-labelledby` is reused
       — or its `aria-label`, when that is what the consumer authored. */
    if (!menu.getAttribute("aria-label") && !menu.getAttribute("aria-labelledby")) {
      const named = (combo.getAttribute("aria-labelledby") || "").trim().split(/\s+/)[0];
      if (named) menu.setAttribute("aria-labelledby", named);
      else if (combo.getAttribute("aria-label")) {
        menu.setAttribute("aria-label", combo.getAttribute("aria-label"));
      }
    }

    /* Announcements the popup cannot make for itself. `aria-activedescendant`
       covers the row a user has moved to, but nothing reports that a filter
       emptied the list — `.select__empty` is a painted row, and a non-`option`
       child of a listbox is not reliably announced (it is `role="presentation"`
       below for that reason). This is the package's usual `role="status"`, one per
       instance, visually hidden and written only when the count changes. */
    const status = document.createElement("span");
    status.className = "sr-only-label";
    status.setAttribute("role", "status");
    root.appendChild(status);

    if (!combo.getAttribute("role")) combo.setAttribute("role", "combobox");
    if (root.hasAttribute("data-select-required")) combo.setAttribute("aria-required", "true");
    combo.setAttribute("aria-haspopup", "listbox");
    combo.setAttribute("aria-expanded", "false");
    combo.setAttribute("aria-controls", menu.id);
    if (input) {
      input.setAttribute("aria-autocomplete", "list");
      input.autocomplete = "off";
    }

    /* `let`, not `const`: refresh() re-reads the rows. Screens that inject an
       option after the fact — du-an/ho-so/chi-tiet.js adds the record's own date to
       a date list that does not carry it — need a way to say so. */
    let options = [];

    function scanOptions() {
      options = Array.prototype.slice.call(
        menu.querySelectorAll(".select__option:not([data-select-create])")
      );
      options.forEach(function (option) {
        ensureId(option, "selectOption");
        if (!option.getAttribute("role")) option.setAttribute("role", "option");
        if (!option.hasAttribute("aria-selected")) {
          option.setAttribute("aria-selected", "false");
        }
        if (!option.dataset.value) option.dataset.value = optionText(option);
        option.dataset.selectFold = fold(optionText(option));
      });
      /* Not an `option`, so it must not be a child of the listbox in the
         accessibility tree. It stays in the DOM where it is painted and is
         announced through `status` above instead. */
      if (emptyNode) emptyNode.setAttribute("role", "presentation");
    }

    scanOptions();

    if (creatable) {
      createOption = document.createElement("li");
      createOption.className = "select__option";
      createOption.setAttribute("data-select-create", "");
      createOption.setAttribute("role", "option");
      createOption.hidden = true;
      ensureId(createOption, "selectOption");
      const createBody = document.createElement("span");
      createBody.className = "select__option-body";
      createText = document.createElement("span");
      createText.className = "select__option-text";
      createBody.appendChild(createText);
      createOption.appendChild(createBody);
      menu.appendChild(createOption);
    }

    function cleanQuery(text) {
      return String(text || "").replace(/\s+/g, " ").trim();
    }

    /* Duplicate test of a creatable control: case-insensitive (vi), whitespace-collapsed, and diacritic-SENSITIVE — "Ban" and "Bán" are two tags. The suggestion filter still folds diacritics. */
    function same(text) {
      return cleanQuery(text).toLocaleLowerCase("vi");
    }

    function findOption(text) {
      const needle = same(text);
      return options.filter(function (option) {
        return same(optionText(option)) === needle || same(option.dataset.value) === needle;
      })[0];
    }

    /* A new option row for a typed value; never a duplicate of an existing one (case/diacritic-insensitive). */
    function ensureOption(text) {
      const clean = cleanQuery(text);
      if (!clean) return null;
      const found = findOption(clean);
      if (found) return found;
      const option = document.createElement("li");
      option.className = "select__option";
      option.dataset.value = clean;
      const body = document.createElement("span");
      body.className = "select__option-body";
      const label = document.createElement("span");
      label.className = "select__option-text";
      label.textContent = clean;
      body.appendChild(label);
      option.appendChild(body);
      menu.insertBefore(option, emptyNode || createOption);
      scanOptions();
      return option;
    }

    let typed = "";
    let typedAt = 0;

    function selected() {
      return options.filter(function (option) {
        return option.getAttribute("aria-selected") === "true";
      });
    }

    /* Every row a filter has left on screen, DISABLED ONES INCLUDED. This is the
       keyboard's list, and a disabled row that cannot be arrowed to is a row a
       screen reader never reads out — the list would silently differ between a
       pointer and a keyboard. The commit refuses instead: see pick(). */
    function visible() {
      const rows = options.filter(function (option) {
        return !option.hidden;
      });
      if (createOption && !createOption.hidden) rows.push(createOption);
      return rows;
    }

    /* The subset that can actually be chosen — what a filter counts, and what the
       initial active row is picked from. */
    function selectable() {
      return visible().filter(function (option) {
        return !isDisabled(option);
      });
    }

    function activeOption() {
      return menu.querySelector(".select__option[data-active]");
    }

    function setActive(option) {
      const previous = activeOption();
      if (previous && previous !== option) delete previous.dataset.active;
      if (!option) {
        combo.removeAttribute("aria-activedescendant");
        return;
      }
      option.dataset.active = "";
      combo.setAttribute("aria-activedescendant", option.id);
      scrollRowIntoView(option);
    }

    /* Scrolls the MENU, by arithmetic, rather than calling
       `option.scrollIntoView()`. That method walks every ancestor scroller,
       including the document, so opening a select could scroll the page under the
       user — and a document scroll fires the capture listener that re-places this
       menu, moving it again. Only the row's own scrollport may move, and only when
       the row is actually outside it. */
    function scrollRowIntoView(option) {
      const top = option.offsetTop;
      const bottom = top + option.offsetHeight;
      if (top < menu.scrollTop) {
        menu.scrollTop = top;
      } else if (bottom > menu.scrollTop + menu.clientHeight) {
        menu.scrollTop = bottom - menu.clientHeight;
      }
    }

    function moveActive(step) {
      const rows = visible();
      if (!rows.length) return;
      const current = activeOption();
      const index = current ? rows.indexOf(current) : -1;
      let next = index + step;
      if (next < 0) next = rows.length - 1;
      if (next >= rows.length) next = 0;
      setActive(rows[next]);
    }

    /* --- Rendering ------------------------------------------- */

    function renderValue() {
      if (!valueNode) return;
      const chosen = selected()[0];
      valueNode.textContent = "";
      if (!chosen) {
        const span = document.createElement("span");
        span.className = "select__placeholder";
        span.textContent = placeholder;
        if (placeholderLead) valueNode.appendChild(placeholderLead.cloneNode(true));
        valueNode.appendChild(span);
        return;
      }
      /* The option's own body, cloned. Its leading avatar or dot comes with it,
         which is the whole reason the trigger is not authored separately — and
         the classes are renamed so the value row's rules apply rather than the
         option row's padding. */
      const body = chosen.querySelector(".select__option-body");
      if (!body) {
        valueNode.textContent = optionText(chosen);
        return;
      }
      Array.prototype.forEach.call(body.childNodes, function (node) {
        const copy = node.cloneNode(true);
        if (copy.nodeType === 1) {
          copy.classList.remove("select__option-text", "select__option-support");
          if (node.classList.contains("select__option-text")) {
            copy.classList.add("select__label");
          }
          if (node.classList.contains("select__option-support")) {
            copy.classList.add("select__support");
          }
        }
        valueNode.appendChild(copy);
      });
    }

    /* `+N`, built once and moved to the end of the chip row by renderTags(). It is
       a chip with no avatar and no remove control: it stands for values the row
       could not fit, and there is nothing on it to remove. Clicking it opens the
       menu, where those values are ticked — which is the only way to reach them
       when they are folded, and why folding is not the same as hiding them. */
    let moreChip = null;

    function ensureMoreChip() {
      if (moreChip) return moreChip;
      moreChip = document.createElement("li");
      moreChip.className = "select__tag select__tag--more";
      moreChip.setAttribute("role", "listitem");
      moreChip.hidden = true;
      const body = document.createElement("span");
      body.className = "select__tag-body";
      const text = document.createElement("span");
      text.className = "select__tag-text";
      body.appendChild(text);
      moreChip.appendChild(body);
      moreChip.dataset.selectMore = "";
      return moreChip;
    }

    function renderTags() {
      if (!tagList) return;
      /* ../styles/select.css lays the chips out with `display: contents` so they
         flow in one wrapping row with the query and the clear button, and that
         strips the <ul>/<li> semantics in every engine. The roles are written
         back explicitly, here rather than in the markup, because the chips
         themselves are built here. */
      tagList.setAttribute("role", "list");
      tagList.textContent = "";
      selected().forEach(function (option) {
        /* `data-select-tag-label` on the option wins: a row's text may be longer than a chip can carry. */
        const label =
          option.getAttribute("data-select-tag-label") ||
          (option.querySelector(".select__option-text") || option).textContent.trim();
        const item = document.createElement("li");
        item.className = "select__tag";
        item.setAttribute("role", "listitem");

        const body = document.createElement("span");
        body.className = "select__tag-body";
        const avatar = option.querySelector(".avatar");
        if (avatar) body.appendChild(avatar.cloneNode(true));
        const text = document.createElement("span");
        text.className = "select__tag-text";
        text.textContent = label;
        body.appendChild(text);

        const remove = document.createElement("button");
        remove.type = "button";
        remove.className = "select__tag-remove";
        /* Named for the value it removes: a screen reader reads this button out
           of context, beside near-identical siblings. */
        /* Spoken name comes from the option's own text, not the chip's compact label ("Tên • PB"). */
        const spoken = option.getAttribute("data-select-tag-label")
          ? (option.querySelector(".select__option-text") || option).textContent.trim()
          : label;
        remove.setAttribute("aria-label", (root.dataset.selectRemoveLabel || "Xóa") + " " + spoken);
        remove.dataset.selectRemove = option.dataset.value;
        remove.disabled = disabled();
        remove.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">close</span>';

        item.appendChild(body);
        item.appendChild(remove);
        tagList.appendChild(item);
      });
      tagList.appendChild(ensureMoreChip());
      fitTags();
    }

    /* How many chips fit, decided by measuring rather than by arithmetic: show
       everything, then fold from the END until the row stops overflowing. The
       control is `overflow: hidden` and `flex-wrap: nowrap`
       (../styles/select.css), so `scrollWidth` is the row's true content width
       and one comparison answers the question at any width, in any font, with any
       label — which arithmetic over paddings and gaps does not.

       Folding from the end keeps the earliest choices visible, which is the order
       the menu ticks them in and the order the record stores them.

       At most one chip is ever left standing: a row that can fit nothing shows
       the first chip and `+N`, rather than `+N` alone, so the control always says
       what at least one of its values IS. */
    function fitTags() {
      if (!tagList || !moreChip) return;
      const chips = Array.prototype.slice.call(
        tagList.querySelectorAll(".select__tag:not(.select__tag--more)")
      );
      chips.forEach(function (chip) {
        chip.hidden = false;
      });
      moreChip.hidden = true;
      if (!chips.length) return;
      const text = moreChip.querySelector(".select__tag-text");
      let folded = 0;
      /* `+ 1` absorbs sub-pixel layout: a row that overflows by a fraction is a
         rounding artefact, not a chip that does not fit. */
      while (control.scrollWidth > control.clientWidth + 1 && folded < chips.length - 1) {
        folded += 1;
        const chip = chips[chips.length - folded];
        chip.hidden = true;
        moreChip.hidden = false;
        text.textContent = "+" + folded;
        /* Named for what it stands for. A screen reader reads `+2` out of context
           beside the chips it replaced, and the values are not otherwise on the
           row. */
        moreChip.setAttribute(
          "aria-label",
          "+" + folded + ": " + chips
            .slice(chips.length - folded)
            .map(function (node) {
              const label = node.querySelector(".select__tag-text");
              return label ? label.textContent : "";
            })
            .join(", ")
        );
      }
    }

    function syncClear() {
      if (!clearButton) return;
      const hasValue = selected().length > 0 || Boolean(input && input.value);
      clearButton.hidden = !hasValue;
      /* Disabled with the control it sits in. Hiding the fill is not enough: this
         is a real button, and a disabled Search or Tags field whose clear still
         works is a field the user can empty after the UI said it was inert. */
      clearButton.disabled = disabled();
    }

    /* type=Search commits into the INPUT, because that is the only place a typed
       single-value control can show what was chosen — it has no `.select__value`
       row. Without this the control reads empty after a pick while the hidden
       input holds a value: the frame's `Search/Default` state, unreachable.
       type=Tags is different and stays empty: its chips are the value, and the
       input is the next query. */
    function syncInput() {
      if (!input) return;
      if (multiple) {
        /* THE QUERY PLACEHOLDER IS AN EMPTY-STATE ONLY, per the set: the Tags
           type has its own `State=Placeholder` variant for it, and `State=Default`
           draws chips with no query text beside them. Keeping the word next to
           the chips says `Chọn nhóm hàng` about a control that already holds two
           choices. Fixed 2026-09-22; it had been the authored attribute for the
           life of the control. */
        input.placeholder = selected().length
          ? ""
          : disabled() && disabledPlaceholder
            ? disabledPlaceholder
            : queryPlaceholder;
        return;
      }
      const chosen = selected()[0];
      input.value = chosen ? optionText(chosen) : "";
    }

    function syncHidden() {
      if (!hiddenInput) return;
      hiddenInput.value = selected()
        .map(function (option) {
          return option.dataset.value;
        })
        .join(",");
    }

    function render() {
      renderValue();
      renderTags();
      syncInput();
      syncClear();
      syncHidden();
      /* The trigger's own height changes when chips wrap or unwrap, and the menu
         is placed against it — so an open list has to be re-placed, or it floats
         away from the control that owns it. */
      if (!menu.hidden) place();
    }

    function announce() {
      const chosen = selected();
      root.dispatchEvent(
        new CustomEvent("select:change", {
          bubbles: true,
          detail: {
            value: chosen.length ? chosen[0].dataset.value : "",
            values: chosen.map(function (option) {
              return option.dataset.value;
            }),
            labels: chosen.map(optionText),
          },
        })
      );
    }

    /* --- Filtering (type=Search, type=Tags) ------------------ */

    function filter(query) {
      const needle = fold(query);
      options.forEach(function (option) {
        const match = !needle || option.dataset.selectFold.indexOf(needle) !== -1;
        option.hidden = !match;
      });
      /* Counts rows ON SCREEN, not rows that can be picked. Counting only the
         pickable ones said "nothing matched" while matching disabled rows were
         painted right underneath the message — two contradictory statements in one
         list. */
      if (createOption) {
        const clean = cleanQuery(query);
        const show = Boolean(clean) && !findOption(clean);
        createOption.hidden = !show;
        if (show) createText.textContent = createLabel + " “" + clean + "”";
      }
      const shown = visible().length;
      if (emptyNode) emptyNode.hidden = shown > 0;
      /* Announced, because `.select__empty` is painted rather than announced and
         `aria-activedescendant` has nothing to point at when the list is empty. */
      if (needle) {
        status.textContent = shown ? "" : (emptyNode ? emptyNode.textContent.trim() : "");
      } else {
        status.textContent = "";
      }
      const current = activeOption();
      if (!current || current.hidden || (current === createOption && shown > 1)) {
        setActive(selectable()[0] || null);
      }
      /* The menu just got shorter or taller. When it is flipped above the trigger
         its `top` was computed from the old height, so without this it detaches. */
      if (!menu.hidden) place();
    }

    /* Drops the QUERY, not the value. On a single-value Search control the value
       is what the input shows, so it is restored rather than blanked — clearing it
       is what made the committed value invisible. */
    function resetFilter() {
      if (!input) return;
      /* The Tags type's text is only ever a query, so dropping the query empties the input. */
      if (multiple) input.value = "";
      syncInput();
      filter("");
      syncClear();
    }

    /* --- Open / close ---------------------------------------- */

    function disabled() {
      return Boolean(control.disabled || (input && input.disabled));
    }

    /* The menu is `position: fixed` (see ../styles/select.css for why), so its
       size and position are written here — nothing else knows where the trigger
       sits. Measured every time, never cached: the trigger moves when the page, a
       modal body or a table wrapper scrolls, and it CHANGES HEIGHT when chips wrap.

       Three rules, in this order, and the order is the whole point:

         1. The side with more room wins — below unless above is roomier.
         2. The menu is then capped to the room that side actually has. It was
            capped only by the design's 320px, so a list of seven rows on a 375x667
            phone hung 12px past the fold and a landscape phone 158px — and the
            overflow was UNREACHABLE, because scrolling the document moves the
            trigger, which re-places the menu by the same amount.
         3. `top` is clamped into the viewport. Flipping when neither side fits
            used to produce a negative `top` (above 180, below 176, height 320 →
            top -144px), i.e. rows above the top edge of a box that does not
            scroll into view.

       The inline axis is clamped the same way, against the DOCUMENT's width rather
       than `innerWidth`, which counts a classic scrollbar and would tuck the menu
       under it. */
    function place() {
      const box = control.getBoundingClientRect();
      const styles = global.getComputedStyle(root);
      const offset = parseFloat(styles.getPropertyValue("--utui-select-menu-offset")) || 4;
      const cap =
        parseFloat(styles.getPropertyValue("--utui-select-menu-max-height")) || 320;
      const below = global.innerHeight - box.bottom - offset;
      const above = box.top - offset;
      const flip = below < Math.min(cap, menu.scrollHeight) && above > below;
      const room = Math.max(flip ? above : below, MIN_MENU_HEIGHT);
      root.dataset.placement = flip ? "above" : "below";
      menu.style.maxHeight = Math.round(Math.min(cap, room)) + "px";
      menu.style.width = box.width + "px";
      const height = menu.offsetHeight;
      const top = flip ? box.top - height - offset : box.bottom + offset;
      const maxTop = global.innerHeight - height - offset;
      menu.style.top = Math.round(Math.max(offset, Math.min(top, maxTop))) + "px";
      const viewportWidth = document.documentElement.clientWidth;
      const maxLeft = viewportWidth - box.width - offset;
      menu.style.left = Math.round(Math.max(offset, Math.min(box.left, maxLeft))) + "px";
    }

    function open() {
      if (disabled() || openInstance === api) return;
      if (openInstance) openInstance.close();
      menu.hidden = false;
      root.classList.add("select--open");
      combo.setAttribute("aria-expanded", "true");
      openInstance = api;
      /* A single-value typed control shows its committed value in the input, so
         the list opens UNFILTERED — filtering it by the value the user already
         has would show them one row, their own. The text is selected instead, so
         the first keystroke replaces it, which is what a typed control does
         everywhere else. */
      if (input && !multiple && input.value) {
        filter("");
        if (typeof input.select === "function") input.select();
      }
      place();
      setActive(selected()[0] || selectable()[0] || null);
    }

    /* Creatable: leaving the control (Tab, blur, outside press, a Save click) with a typed query that matches no option commits it as a chip; Escape cancels instead. */
    function commitQuery() {
      if (!creatable || !input || disabled()) return;
      const clean = cleanQuery(input.value);
      if (!clean || findOption(clean)) return;
      const made = ensureOption(clean);
      if (!made) return;
      made.setAttribute("aria-selected", "true");
      render();
      announce();
    }

    function close(returnFocus, cancel) {
      if (cancel !== true) commitQuery();
      if (openInstance === api) openInstance = null;
      menu.hidden = true;
      root.classList.remove("select--open");
      delete root.dataset.placement;
      combo.setAttribute("aria-expanded", "false");
      setActive(null);
      typed = "";
      /* A typed query that matched nothing must not survive the close: the
         control would read as filled while holding no value. Any query at all is
         dropped on the single-value types, whose value row is the record of what
         is chosen; the tags type keeps its chips and drops only the text. */
      if (input) resetFilter();
      if (returnFocus && typeof combo.focus === "function") combo.focus();
    }

    function toggle() {
      if (menu.hidden) open();
      else close(false);
    }

    /* --- Committing ------------------------------------------ */

    function pick(option) {
      if (!option || isDisabled(option)) return;
      if (option === createOption) {
        const made = ensureOption(input.value);
        if (!made) return;
        option = made;
        made.setAttribute("aria-selected", "false");
      }
      if (multiple) {
        const on = option.getAttribute("aria-selected") === "true";
        option.setAttribute("aria-selected", on ? "false" : "true");
        render();
        announce();
        /* The menu stays open: picking one of several values and having the list
           shut each time is how a multi-select becomes five open-close cycles.
           The query is dropped so the next term starts clean, and focus goes
           back to the input the user is typing in. */
        if (input) {
          resetFilter();
          input.focus();
        }
        setActive(option);
        return;
      }
      options.forEach(function (other) {
        other.setAttribute("aria-selected", other === option ? "true" : "false");
      });
      render();
      announce();
      close(true);
    }

    /* Both writers below refuse while the control is disabled. The fill alone was
       decoration: every chip on a disabled Tags field could still be stripped with
       the pointer, and `.select__clear` still emptied a disabled Search field. */
    function removeValue(value) {
      if (disabled()) return;
      const option = options.filter(function (candidate) {
        return candidate.dataset.value === value;
      })[0];
      if (!option) return;
      option.setAttribute("aria-selected", "false");
      render();
      announce();
    }

    function clearAll() {
      if (disabled()) return;
      options.forEach(function (option) {
        option.setAttribute("aria-selected", "false");
      });
      if (input) {
        input.value = "";
        filter("");
      }
      render();
      announce();
    }

    /* --- Events ---------------------------------------------- */

    if (input) {
      input.addEventListener("input", function () {
        open();
        filter(input.value);
        syncClear();
      });
    } else {
      control.addEventListener("click", function () {
        toggle();
      });
    }

    /* `mousedown`, not `click`, and the default is prevented: pressing a row
       would otherwise blur the input first, and a blur that closes the menu
       cancels the click that was about to commit. */
    menu.addEventListener("mousedown", function (event) {
      const option = event.target.closest(".select__option");
      if (!option) return;
      event.preventDefault();
    });

    menu.addEventListener("click", function (event) {
      const option = event.target.closest(".select__option");
      if (!option || !menu.contains(option)) return;
      pick(option);
    });

    menu.addEventListener("mousemove", function (event) {
      const option = event.target.closest(".select__option");
      if (option && !isDisabled(option)) setActive(option);
    });

    if (tagList) {
      tagList.addEventListener("click", function (event) {
        const button = event.target.closest("[data-select-remove]");
        if (!button) return;
        /* Inside the control, which opens the menu on click for the typed types.
           Removing a chip is not asking for the list. */
        event.stopPropagation();
        removeValue(button.dataset.selectRemove);
        if (input) input.focus();
      });
    }

    if (clearButton) {
      clearButton.addEventListener("click", function (event) {
        event.stopPropagation();
        clearAll();
        if (typeof combo.focus === "function") combo.focus();
      });
    }

    if (input) {
      /* Pressing the shell — the padding, the magnifier, the chips' gaps — puts
         the caret in the input and opens the list, so the whole box behaves like
         one control rather than only its text run. */
      control.addEventListener("click", function (event) {
        if (event.target.closest(".select__clear, [data-select-remove]")) return;
        if (event.target !== input) input.focus();
        open();
      });
    }

    /* The two things that change how many chips fit, on the Tags type only.

       FOCUS. While the user is typing, the query asks for its floor back
       (../styles/select.css keys that off `.select--querying`), so chips fold to
       make room and unfold when the query is left. That is the behaviour the set
       implies by drawing `Focused` at the same one-row height as `Default`.

       WIDTH. A control in a dialog, a wizard step and a two-column grid is three
       widths, and a screen that reflows is a fourth. ResizeObserver rather than a
       window listener: the control's own box is what decides, and it changes
       without the window doing anything — a field moving from a full row to a
       half one, a panel opening beside it. */
    if (input && tagList) {
      input.addEventListener("focus", function () {
        root.classList.add("select--querying");
        fitTags();
      });
      input.addEventListener("blur", function () {
        root.classList.remove("select--querying");
        fitTags();
      });
      if (typeof ResizeObserver === "function") {
        new ResizeObserver(function () {
          fitTags();
        }).observe(control);
      }
    }

    /* PREFIX matching, deliberately different from filter()'s substring match: a
       typeahead is the native <select>'s behaviour and jumping to a row whose
       middle happens to match is not it. Returns whether anything was hit, so the
       caller knows whether to swallow the key. */
    function typeaheadTo(buffer) {
      const needle = fold(buffer);
      const hit = selectable().filter(function (option) {
        return option.dataset.selectFold.indexOf(needle) === 0;
      })[0];
      if (!hit) return false;
      typed = buffer;
      if (menu.hidden) open();
      setActive(hit);
      return true;
    }

    combo.addEventListener("keydown", function (event) {
      if (disabled()) return;
      const key = event.key;

      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault();
        if (menu.hidden) {
          open();
          return;
        }
        moveActive(key === "ArrowDown" ? 1 : -1);
        return;
      }

      if (key === "Home" || key === "End") {
        if (menu.hidden) return;
        event.preventDefault();
        const rows = visible();
        if (!rows.length) return;
        setActive(key === "Home" ? rows[0] : rows[rows.length - 1]);
        return;
      }

      if (key === "Enter") {
        if (menu.hidden) {
          if (!input) {
            event.preventDefault();
            open();
          }
          return;
        }
        /* Prevented even when no row is active: this control lives in a form, and
           Enter inside an open listbox must not submit it. */
        event.preventDefault();
        pick(activeOption());
        return;
      }

      if (key === " " && !input) {
        /* Space COMMITS the active row while the list is open — that is what the
           native <select> this control replaces does, and the UA's own synthetic
           `click` on a <button> would otherwise reach toggle() and close the list
           without choosing anything. Prevented so that click never fires.

           A Space that lands mid-typeahead is a character, not a command: `ngung h`
           has to be able to reach `Ngừng hoạt động`. The buffer is checked first.

           Closed, it falls through to the UA click, which opens the menu. */
        if (typed) {
          event.preventDefault();
          typeaheadTo(typed + " ");
          return;
        }
        if (!menu.hidden) {
          event.preventDefault();
          pick(activeOption());
        }
        return;
      }

      if (key === "Escape") {
        if (menu.hidden) return;
        event.preventDefault();
        /* Stopped, not merely handled: ./modal.js closes the dialog on Escape from
           a document-level listener, so an open menu inside a modal would take
           the whole form down with it. One Escape closes one layer — the menu
           here, the dialog on the next press, once the menu is shut and this
           branch returns early. */
        event.stopPropagation();
        close(true, true);
        return;
      }

      if (key === "Tab") {
        /* Focus is leaving; the menu has no focusable content of its own, so it
           closes and does not take focus with it. */
        if (!menu.hidden) close(false);
        return;
      }

      if (key === "Backspace" && input && multiple && !input.value) {
        const chosen = selected();
        if (!chosen.length) return;
        event.preventDefault();
        removeValue(chosen[chosen.length - 1].dataset.value);
        return;
      }

      /* Typeahead, for the types with no input to type into. A short buffer, so
         `ol` reaches `Olivia` and a pause starts a new word — the same behaviour
         the native <select> this control replaces already has, and a keyboard
         user coming from one will expect it. */
      if (!input && PRINTABLE.test(key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const now = Date.now();
        const next = now - typedAt > 1000 ? key : typed + key;
        typedAt = now;
        if (typeaheadTo(next)) event.preventDefault();
      }
    });

    /* Leaving the control by any route — Tab, a click elsewhere, a script moving
       focus — closes the list. `focusout` rather than `blur` because the pointer
       may land on a row inside the menu, which is a descendant. */
    root.addEventListener("focusout", function (event) {
      if (root.contains(event.relatedTarget)) return;
      if (!menu.hidden) close(false);
      else commitQuery();
      if (creatable && input && input.value) resetFilter();
    });

    const api = {
      root: root,
      open: open,
      close: close,
      place: place,
      clear: clearAll,
      value: function () {
        const chosen = selected();
        return multiple
          ? chosen.map(function (option) {
              return option.dataset.value;
            })
          : chosen.length
            ? chosen[0].dataset.value
            : "";
      },
      /* Writes a value the way a user would, and says so: `select:change` fires,
         because a screen that sets a value from a record and a screen that watches
         for changes are frequently the same screen, and a silent setter is how the
         two disagree.

         On a single-value control only the FIRST id is honoured — an array quietly
         selecting nothing was the previous behaviour, which is the worst of the
         three options. Unknown ids select nothing and leave the control empty:
         that is the caller's bug and hiding it would only move it. */
      setValue: function (next) {
        const wanted = (Array.isArray(next) ? next : [next]).map(String).filter(Boolean);
        const wantedOne = multiple ? wanted : wanted.slice(0, 1);
        if (creatable) wantedOne.forEach(ensureOption);
        options.forEach(function (option) {
          option.setAttribute(
            "aria-selected",
            wantedOne.indexOf(option.dataset.value) !== -1 ? "true" : "false"
          );
        });
        render();
        announce();
      },
      /* Re-reads the option rows. For a screen that injects one after the fact —
         du-an/ho-so/chi-tiet.js adds the record's own date to a date list that does
         not carry it — because the row set is captured at init and an unscanned
         `<li>` has no id, no fold and no role. */
      refresh: function () {
        scanOptions();
        if (input) filter(input.value);
        render();
      },
    };

    root.omeuSelect = api;
    root.dataset.selectReady = "true";
    render();
    if (input) filter("");
  }

  function init(scope) {
    const root = scope || document;
    Array.prototype.forEach.call(root.querySelectorAll("[data-select]"), setup);
  }

  /* A fixed menu has to be re-placed whenever its trigger moves, and the trigger
     moves when ANY ancestor scrolls — the page, a modal body, a table wrapper. One
     capturing listener catches all of them, and it only ever runs while a menu is
     open. Passive: this never cancels the scroll it is following.

     Re-placed rather than closed, deliberately: closing on scroll would shut the
     list the moment a user nudged a trackpad while reading it. */
  ["scroll", "resize"].forEach(function (type) {
    global.addEventListener(
      type,
      function () {
        if (openInstance) openInstance.place();
      },
      { capture: true, passive: true }
    );
  });

  /* One document-level press closes whatever is open, for every instance. Same
     shape as the single key listener ./modal.js registers, and for the same
     reason: N instances must not mean N document listeners.

     `pointerdown` in the capture phase, so a press on a second select's trigger
     closes the first one BEFORE that trigger's own click opens it. */
  document.addEventListener(
    "pointerdown",
    function (event) {
      if (!openInstance) return;
      if (openInstance.root.contains(event.target)) return;
      openInstance.close(false);
    },
    true
  );

  /* Enhance whatever exists the moment this file runs, THEN again on
     DOMContentLoaded for anything the parser had not reached yet. Both, because
     the screens load this at the end of <body> and their own bundle runs on the
     next line — a screen that fills a combobox from a record while executing
     (du-an/ho-so/chi-tiet.js does, on its first paint) would otherwise find no
     component there and write nothing. Waiting for DOMContentLoaded alone left
     that screen's folder and both dates reading `Chọn` over a real document.
     `init()` is idempotent, so the second pass costs one attribute check per
     instance. */
  init(document);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      init(document);
    });
  }

  global.OmeuSelect = {
    init: init,
    close: function () {
      if (openInstance) openInstance.close(false);
    },
    get: function (node) {
      const root = node && node.closest ? node.closest("[data-select]") : null;
      return root ? root.omeuSelect || null : null;
    },
  };
})(window, document);
