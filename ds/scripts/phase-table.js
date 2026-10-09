/* phase-table.js — the editable `Các giai đoạn chính` table, step 3 of the
   project wizard. Contract: design-system/components/data-table.md (the
   `Tạo dự án mới` revision). Styles: ../styles/data-table.css.

   Why this file exists: du-an/tao-moi.js (#createDrawer) and the since-removed du-an/chinh-sua.js
   rendered the same table, and both of their headers claimed they were kept
   identical. They were not.
   Commit-on-blur shipped into the create wizard on 2026-08-14 and never reached
   the edit wizard, so on that screen `row.editing` was set and never cleared and
   a table whose rows had all been clicked stayed a grid of inputs for the life of
   the page. Two more fixes from the same pass — the `.cell-empty` fallback and
   the em dash in the identifier cell — drifted with it. A copy-paste port would
   fix today's three and leave tomorrow's; one module cannot drift.

   Fourth shared script in the package, after notification.js, page-tab.js and
   modal.js, and for the same reason: this is behaviour no single screen owns.
   No build step, so it is a plain IIFE publishing one global. Load it with a
   <script src> BEFORE the screen's own bundle.

   Usage — the screen owns the seed data and the chrome, this owns the table:

     const phaseTable = OmeuPhaseTable.create({
       region: document.getElementById("phaseRegion"),
       rows: phaseRows,                       // mutated in place
       onDirty: () => { state.dirty = true; },
       notify: notify,                        // (message, {label, onActivate})
     });
     phaseTable.render();

   Three consumers since 2026-08-19: the two wizards, which take the nine-column
   default, and the `Các giai đoạn chính` section-edit dialog on
   du-an/chi-tiet.html, which passes its own four-column set:

     OmeuPhaseTable.create({
       region, rows, onDirty, notify,
       columns: [...],                        // default: COLUMNS below
       regionLabel: "Bảng ...",               // the scroll container's name
     });

   A column is `{ key, label, width?, type?, options? }`. `width` omitted makes it
   a fill column; `type: "select"` draws a native select over `options` instead of
   a text input. Column 0 is always the action column and column 1 always the
   row's identifier — those two positions are structural, not configurable.

   The two wizards differ only in what they seed `rows` with: the create wizard
   opens row 1 in the edit state with three empty dates, the way the frame draws
   it, and the edit wizard opens on a record whose phases are already stored, so
   every one of its rows is saved. Nothing else about the table is a screen's to
   decide, which is why COLUMNS and DATE_KEYS are published from here. */

(function (global, document) {
  "use strict";

  // The DEFAULT column set — the wizard's nine. A caller may pass its own; see
  // the header. The action column has no header text in the source; its label
  // below is the accessible name only. Widths are the frame's: 68 + 300 + 7 x
  // 240 = 2048px in an 1088px content column, so the table always scrolls.
  const COLUMNS = [
    { key: "action", label: "Hành động", width: 68 },
    { key: "phase", label: "Giai đoạn", width: 300 },
    { key: "start", label: "Ngày bắt đầu dự kiến", width: 240 },
    { key: "launch", label: "Ngày dự kiến mở bán", width: 240 },
    { key: "contract", label: "Ngày dự kiến ký hợp đồng mua bán", width: 240 },
    { key: "construction", label: "Ngày khởi công", width: 240 },
    { key: "end", label: "Ngày kết thúc dự kiến", width: 240 },
    { key: "handover", label: "Ngày dự kiến bàn giao", width: 240 },
    { key: "settlement", label: "Ngày dự kiến quyết toán", width: 240 },
  ];

  // The seven date keys of the DEFAULT set, in column order. Published for the
  // two wizards, which seed rows with them; a caller passing its own columns
  // gets its own value keys derived inside create().
  const DATE_KEYS = COLUMNS.slice(2).map((column) => column.key);

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function icon(name) {
    return `<span class="material-symbols-outlined" aria-hidden="true">${esc(name)}</span>`;
  }

  /* One table per call. Everything below closes over `region` and `rows`, so two
     instances on one page would not interfere — nothing in this package needs
     that, but nothing here prevents it either. */
  function create(options) {
    const region = options.region;
    const rows = options.rows;
    // The column set is the caller's. The wizard's nine columns are the default,
    // so the two screens that predate this option keep passing nothing; the
    // section-edit dialog on du-an/chi-tiet.html passes its own four, because
    // the modal frame (12022:53364) draws the same table with the identifier,
    // one start date and one end date and no other milestone.
    //
    // Two positions are structural rather than configurable: column 0 is the
    // action column and column 1 is the row's identifier. Everything below reads
    // them that way.
    const columns =
      Array.isArray(options.columns) && options.columns.length > 1 ? options.columns : COLUMNS;
    // The keys a new row is seeded with — every value column except the
    // identifier, which `add-row` opens empty on purpose.
    const valueKeys = columns.slice(2).map((column) => column.key);
    // The scroll container's accessible name. The wizard's table is 2048px in an
    // 1088px region and can never fit, so its default says so; a caller whose
    // columns do fit passes a name that does not promise a scroll that will not
    // happen — see design-system/components/data-table.md.
    const regionLabel =
      options.regionLabel || "Bảng các giai đoạn chính, cuộn ngang để xem thêm cột";
    // The screen decides what "the user has unsaved work" means; the table only
    // reports that it changed.
    const onDirty = typeof options.onDirty === "function" ? options.onDirty : function () {};
    // Screen-owned notifier: a status line in a dialog/drawer, or a notification on a page.
    const notify = typeof options.notify === "function" ? options.notify : function () {};

    /* ---------- The three opt-in flags, added 2026-09-22 ----------

       All three default to the behaviour the project wizard already has,
       so `tao-moi` Step 3 is untouched by this change: it
       passes none of them. Only the section-edit dialog on du-an/chi-tiet.html
       passes them, and it passes all three.

       The source for them is NOT Figma. It is a read of the live QC screen
       (`onehub-qc.onemount.dev/mdm/project/detail/MCM_19092?id=731`, 2026-09-22),
       recorded with its evidence and its open questions in
       docs/giai-doan-du-an/doi-chieu-qc-cac-giai-doan-chinh.md. Where that file
       and Figma disagree, the file says which was chosen and why. */

    // ALWAYS EDITING. QC draws every date cell as an input from the moment the
    // dialog opens — there is no click-to-edit step and no committed-row state.
    // Off by default: the wizards' commit-on-blur (2026-08-14) is what keeps a
    // 9-column table readable, and QC says nothing about those two screens.
    const alwaysEditing = options.alwaysEditing === true;

    // LOCKED ROWS, by phase name. QC renders four phases that carry no delete
    // control and whose name is static text rather than a select. They are
    // identified by NAME rather than by index or by a flag on the row, because
    // the caller seeds its drafts from the card and has nothing else to key on,
    // and because the unique-option rule below keeps a user-added row from ever
    // taking one of these names.
    //
    // OPEN QUESTION (G3 in the doc above): a row the user ADDS and saves is
    // unlocked here, and stays unlocked when the dialog is reopened. Whether QC
    // promotes a saved custom row to a system row is not answerable from a
    // screenshot of an unsaved session. If the answer is yes, this array is the
    // one place that changes.
    const lockedPhases = Array.isArray(options.lockedPhases) ? options.lockedPhases : [];

    // COLUMN SETTINGS. QC's footer carries `Thêm giai đoạn` and the result count
    // and nothing else. On by default: the wizards draw the button, and its
    // handler below is still the honest "not in this demo" message.
    const showSettings = options.showSettings !== false;

    // A locked row has no delete control and no editable identifier. Everything
    // that asks "is this row the user's to change" asks through here.
    function isLocked(row) {
      return lockedPhases.indexOf(row.phase) !== -1;
    }

    // `row.editing` is still the per-row truth the commit path writes; this is
    // the question every render asks instead of reading it directly, so the
    // always-editing table does not need a second code path through rowMarkup().
    function isEditing(row) {
      return alwaysEditing || Boolean(row.editing);
    }

    let rowSeq = rows.length;
    // Set when a re-render was triggered by a row control, so focus can be put
    // back on something meaningful — innerHTML replacement otherwise drops a
    // keyboard user out of the table and back to the top of the page.
    let focusAfterRender = null;
    let commitTimer = 0;

    /* ---------- Row markup ---------- */

    // A row's name for assistive tech. The PHASE, not the row ordinal: ordinals
    // shift the moment a row above is deleted, so "dòng 2" names a different row
    // before and after — and a delete confirmation that names the wrong row is
    // worse than no name. Falls back for a row that has not been named yet.
    function rowLabel(row) {
      return row.phase || "chưa đặt tên";
    }

    function cellName(column, row) {
      return `${column.label}, ${rowLabel(row)}`;
    }

    // A `type: "select"` column's options: the column's own list, with the row's
    // stored value in front of it when the record holds something the list does
    // not. A value the record already carries is never silently dropped by the
    // control that edits it. An empty value keeps a disabled placeholder first,
    // the same construction the section-edit form uses for its selects.
    /* The rows of a cell combobox. The record's own value is included so a value
       the column's option list does not carry is still shown, and it is the only
       row marked selected — marking row 0 instead would put a value in a cell the
       user never chose. */
    function selectOptions(row, column) {
      const value = row[column.key] || "";
      /* `unique` columns drop what another row already holds — QC's catalogue
         offers no phase the table is already carrying, including the four locked
         ones (2026-09-22 read). Computed per open rather than once at create(),
         because the answer changes as rows are added and deleted. THIS row's own
         value survives the filter: it is the selected option, and removing it
         would leave the trigger showing a value its menu cannot tick. */
      const taken = column.unique
        ? rows
            .filter((entry) => entry !== row)
            .map((entry) => entry[column.key])
            .filter((entry) => entry !== "" && entry !== null && entry !== undefined)
        : [];
      const options = [value]
        .concat(column.options || [])
        .filter((entry) => entry !== "" && entry !== null && entry !== undefined)
        .filter((entry) => entry === value || taken.indexOf(entry) === -1)
        .filter((entry, index, all) => all.indexOf(entry) === index);
      return options
        .map(
          (entry) => `
                <li class="select__option" data-value="${esc(entry)}"${
                  entry === value ? ' aria-selected="true"' : ""
                }>
                  <span class="select__option-body">
                    <span class="select__option-text">${esc(entry)}</span>
                  </span>
                </li>`,
        )
        .join("");
    }

    function editCell(row, column) {
      const value = row[column.key] || "";
      // `Giai đoạn` is a select in the modal frame (I10822:41427) and a text input
      // in the wizard's, so the control is the COLUMN's to declare.
      //
      // The select is the DS atom's select variant: appearance stripped and the
      // contract's own 20px `chevron-down` drawn 8px in from the trailing edge
      // (`9825:59944`), exactly as `.form-field__control` draws it. It shipped
      // native-with-platform-arrow on 2026-08-19 and was corrected the same day
      // against `Table cell` `1222:107305` — see design-system/components/data-table.md.
      if (column.type === "select") {
        /* A `.select` combobox since 2026-08-20, not a native select
           (design-system/components/select.md). The DS `Select` set is what the
           frame draws in this cell, and only the authored menu can carry the tick
           on the chosen row and the 6px option rhythm; the native control's popup
           is the platform's. `.select--cell` sizes it to the cell atom rather than
           the 44px form control — see ../styles/data-table.css.

           The row id and field travel on the `.select` itself, because the events
           this table listens to now come from the component (`select:change`), not
           from an element with a `.value`. */
        const name = esc(cellName(column, row));
        return `
          <td class="cell-input">
            <div class="select select--cell" data-select
                 data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">
              <button class="select__control" type="button" aria-label="${name}">
                <span class="select__value"><span class="select__placeholder">Chọn</span></span>
                <span class="material-symbols-outlined select__chevron" aria-hidden="true">expand_more</span>
              </button>
              <ul class="select__menu" hidden>${selectOptions(row, column)}</ul>
            </div>
          </td>
        `;
      }
      // The date columns state their format in the placeholder: nothing else on
      // the screen says it, and `01/01/2022` on the rows below is ambiguous
      // between dd/mm and mm/dd. `Giai đoạn` keeps the frame's own placeholder.
      const placeholder = column.key === "phase" ? "Nhập thông tin" : "dd/mm/yyyy";
      return `
        <td class="cell-input">
          <input type="text" value="${esc(value)}" placeholder="${esc(placeholder)}"
                 aria-label="${esc(cellName(column, row))}"
                 data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">
        </td>
      `;
    }

    function rowMarkup(row) {
      const label = rowLabel(row);
      const editing = isEditing(row);
      const locked = isLocked(row);
      const cells = columns.slice(1)
        .map((column) => {
          // A locked row's identifier is static text in BOTH states: there is no
          // edit state to enter and no value to choose, so neither the select nor
          // the `.cell-edit-trigger` button below has anything to do. Plain
          // `.cell-text`, the same atom a committed value cell uses.
          if (locked && column.key === "phase") {
            return `<td><span class="cell-text">${esc(row.phase)}</span></td>`;
          }
          if (editing) return editCell(row, column);
          // A saved row is put into the edit state by clicking it — design
          // decision, 2026-08-14. The mouse target is the whole row; the KEYBOARD
          // target is this button in the row's identifier cell, which is the
          // package's existing "the name cell is the row's control" pattern
          // (.cell-lead .entity-title). Its click bubbles to the row handler, so
          // pointer and Enter/Space take one path.
          if (column.key === "phase") {
            // An em dash when the row was committed without a name. The whole row
            // is the pointer target but this button is the KEYBOARD target, and a
            // button with no text is a focus ring around nothing. Its own
            // aria-label already names the row, so the dash is never announced
            // twice. Reachable only since commit-on-blur: a row can now leave the
            // edit state with fields the user never filled in.
            return `
              <td>
                <button class="cell-edit-trigger" type="button" data-row-id="${esc(row.id)}"
                        aria-label="Chỉnh sửa ${esc(label)}">${row.phase ? esc(row.phase) : "—"}</button>
              </td>
            `;
          }
          // Same rule as every other V2 table: a value the row does not have is an
          // em dash with an accessible label, not a blank cell — the absence is
          // announced deliberately (design-system/components/data-table.md). Also
          // new with commit-on-blur; before it, every static row was seeded
          // complete.
          const value = row[column.key] || "";
          return value === ""
            ? `<td><span class="cell-empty"><span aria-hidden="true">—</span><span class="sr-only-label">Không có</span></span></td>`
            : `<td><span class="cell-text">${esc(value)}</span></td>`;
        })
        .join("");
      /* The action cell of a locked row is EMPTY, not a disabled button: a
         control that can never be used is a tab stop that says nothing, and the
         column still has to hold its width for the rows that do carry one. */
      const action = locked
        ? "<td></td>"
        : `
          <td>
            <button class="cell-action" type="button" data-action="delete-row" data-row-id="${esc(row.id)}"
                    aria-label="Xóa ${esc(label)}">
              ${icon("delete")}
            </button>
          </td>
        `;
      /* NEITHER CLASS on an always-editing table, and that is two decisions.
         `is-clickable` is what bindRow() reads to wire click-to-edit, and there
         is no click-to-edit when the row is already open. `is-editing` paints
         `--utui-table-row-editing-bg` (../styles/data-table.css), and that tint
         exists to mark the ONE row that is currently a line of controls while the
         others are text — on a table where every row is controls it marks
         nothing, tints the whole body, and disagrees with QC, which draws these
         rows white. So the row carries no state class at all. */
      const stateClass = alwaysEditing ? "" : editing ? "is-editing" : "is-clickable";
      return `
        <tr class="${stateClass}" data-row-id="${esc(row.id)}">
          ${action}
          ${cells}
        </tr>
      `;
    }

    // Zero rows. The shared `.empty-block` (design-system/components/empty-state.md),
    // composed with `Thêm giai đoạn` as its CTA — design decision, 2026-08-14. The
    // label was `Thêm dòng` until 2026-08-22, when the source renamed it on both
    // frames that draw this table (the wizard's 10838:66518 and the
    // `Giai đoạn chính` dialog 12022:53366).
    //
    // The footer goes with the table rather than staying below the block: there is
    // no result to count and no column set to configure, and a second `Thêm giai đoạn`
    // in the footer beside the block's own would be two controls doing one job.
    // The CTA keeps `data-action="add-row"`, so the delete path's focus target
    // still resolves after the last row goes.
    function emptyMarkup() {
      return `
        <div class="empty-block">
          <span class="empty-illustration" aria-hidden="true"></span>
          <p class="empty-block__title">Chưa có giai đoạn nào</p>
          <p class="empty-block__text">Thêm giai đoạn đầu tiên để ghi lại các mốc triển khai chính của dự án.</p>
          <button class="button button--secondary-color" type="button" data-action="add-row">
            ${icon("add")}<span>Thêm giai đoạn</span>
          </button>
        </div>
      `;
    }

    /* ---------- Render ---------- */

    function render() {
      if (rows.length === 0) {
        region.innerHTML = emptyMarkup();
        bindTableEvents();
        restoreFocus();
        return;
      }
      // A column with no `width` is a fill column: the modal's four columns are
      // 1048px in a 1048px body, so pinning them would make a table that fits
      // scroll for no reason.
      const cols = columns
        .map((column) => (column.width ? `<col style="width: ${column.width}px">` : "<col>"))
        .join("");
      const heads = columns.map((column) =>
        column.key === "action"
          ? `<th scope="col"><span class="sr-only-label">${esc(column.label)}</span></th>`
          : `<th scope="col">${esc(column.label)}</th>`,
      ).join("");
      region.innerHTML = `
        <!-- 2048px of columns in an 1088px region: this table can never fit at any
             tier, so the scroll affordance is unconditional. See the
             "must not claim to scroll" note in design-system/components/data-table.md, which
             applies to the two tables that CAN fit. -->
        <div class="data-table-wrap" role="region" tabindex="0" aria-label="${esc(regionLabel)}">
          <table class="data-table phase-table">
            <colgroup>${cols}</colgroup>
            <thead>
              <tr>${heads}</tr>
            </thead>
            <tbody>
              ${rows.map(rowMarkup).join("")}
            </tbody>
          </table>
        </div>
        <footer class="table-footer">
          <div class="pagination-actions">
            <button class="button button--compact button--secondary-color" type="button" data-action="add-row">
              ${icon("add")}<span>Thêm giai đoạn</span>
            </button>
            ${
              showSettings
                ? `<button class="button button--compact" type="button" data-action="settings">
              ${icon("settings")}<span>Thiết lập</span>
            </button>`
                : ""
            }
          </div>
          <p class="pagination-count">${rows.length} kết quả</p>
        </footer>
      `;
      bindTableEvents();
      syncFrozenAction();
      restoreFocus();
    }

    /* The action column freezes only where the table actually scrolls —
       design-system/components/data-table.md, *The action column leads, and it is
       frozen*. MEASURED, not baked in, for the same reason
       syncInvestorRecordScroll() on du-an/chi-tiet.js measures its own wrap: this
       module serves two column sets with opposite answers. The wizards' nine
       columns are 68 + 300 + 7 x 240 = 2048px in an 1088px region and can never
       fit at any tier; the section-edit dialog passes four columns, three of them
       fill columns, which fill the 1048px body exactly. Freezing the dialog's
       delete cell would paint an opaque cell and a 1px seam down a table that has
       nothing to scroll behind them.

       Called from render() rather than once at create(): the caller may render
       into a region that is not laid out yet, and add/delete change nothing about
       the width but re-render anyway, so the cheapest correct place is the same
       place bindTableEvents() already runs. The +1 tolerance is the sub-pixel
       guard the investor wrap uses. */
    function syncFrozenAction() {
      const wrap = region.querySelector(".data-table-wrap");
      const table = wrap && wrap.querySelector(".data-table");
      if (!table) return;
      table.classList.toggle(
        "data-table--frozen-action",
        wrap.scrollWidth > wrap.clientWidth + 1,
      );
    }

    // Focus after a re-render. Named targets rather than an index, because what
    // the user should land on differs by action: the new row's first field after
    // an add, the neighbouring delete button after a delete.
    function restoreFocus() {
      const target = focusAfterRender;
      focusAfterRender = null;
      if (!target) return;
      const node = region.querySelector(target);
      if (!node) return;
      /* A `.select` cell is a <div> WRAPPER: `data-row-id` and `data-field` sit
         on it, because the events this table listens to come from the component
         (`select:change`) rather than from an element with a `.value` — so the
         selector that addresses a cell does not land on anything focusable. The
         trigger inside it is the <button>.

         Without this, `Thêm giai đoạn` in the section-edit dialog on
         du-an/chi-tiet.html rendered the new row, put focus on a <div> that
         cannot take it, and dropped the user to <body>. It did not show on the
         two wizards, whose `Giai đoạn` column is a text input and IS the node the
         selector finds. Fixed 2026-09-22.

         OmeuSelect.init() has already run on the new markup by this point —
         render() calls bindTableEvents() before restoreFocus(), and bindRow()
         enhances each row's comboboxes — so the trigger exists to be focused. */
      const control = node.classList.contains("select")
        ? node.querySelector(".select__control")
        : node;
      if (control) control.focus();
    }

    /* ---------- Entering and leaving the edit state ---------- */

    // ONE row is in edit at a time, and both ways in — a click on a saved row and
    // `Thêm giai đoạn` — go through here, so opening a row also commits whichever row
    // was open before it. Doing that in the same pass as the render that opens the
    // new row is what keeps it to a single re-render: the deferred commit below
    // would otherwise fire immediately afterwards and replace a row underneath the
    // focus this call just placed.
    function beginEdit(row) {
      rows.forEach((entry) => {
        entry.editing = entry === row;
      });
      // Land on the field the user is most likely to have clicked toward, and the
      // one the frame draws focused. Without this the re-render would drop focus
      // to <body> for the keyboard user who just pressed Enter.
      focusAfterRender = `[data-row-id="${row.id}"][data-field="phase"]`;
      render();
    }

    // COMMIT ON BLUR — design decision, 2026-08-14. Leaving a row commits its
    // values and returns it to static text. No per-row save or cancel control and
    // no table-level edit mode, which is also why nothing new is drawn: the frame
    // authors no such control. Before this, `row.editing` was set and never
    // cleared, so every row that was clicked stayed a line of inputs for the life
    // of the page and a table whose rows had all been clicked was permanently a
    // grid of inputs.
    //
    // Deferred by one task, for two separate reasons:
    //
    //   `focusout` fires BEFORE focus reaches its destination, and its
    //   `relatedTarget` is null for a click on anything that is not focusable, so
    //   the only reliable answer to "where did focus go" is document.activeElement
    //   one task later. That answer is what separates a move BETWEEN this row's own
    //   fields (nothing to do) from a move out of the row (commit).
    //
    //   Because the user holds a mouse button down for far longer than a timer of
    //   0ms, that timer fires BETWEEN mousedown and mouseup on a control outside
    //   the row — `Thêm giai đoạn` in the footer is the case that matters. So the commit
    //   must re-render the row and nothing else: a render() here would destroy
    //   `Thêm giai đoạn` under the pointer and its click would never land at all.
    function scheduleCommit() {
      global.clearTimeout(commitTimer);
      commitTimer = global.setTimeout(commitOnBlur, 0);
    }

    function commitOnBlur() {
      const node = document.activeElement;
      const inside = Boolean(node) && region.contains(node);
      // Focus landing on the scroll container ITSELF is not a move out of a row:
      // clicking a row's own padding focuses `.data-table-wrap`, its nearest
      // focusable ancestor, and so does Shift+Tab off the first control in the
      // table. Committing on that would collapse the row the user just clicked
      // into, which is the same defect from the other side.
      if (inside && node.classList.contains("data-table-wrap")) return;
      const holder = inside ? node.closest("tr[data-row-id]") : null;
      const keepId = holder ? holder.dataset.rowId : null;
      rows.forEach((row) => {
        if (row.editing && row.id !== keepId) commitRow(row);
      });
    }

    // Every keystroke already writes through to the model (see bindRow), so a
    // commit is a state change plus this one row's markup — there is nothing to
    // read out of the DOM and nothing that can fail. It replaces the single <tr>
    // rather than calling render() for the reason above, and that also keeps the
    // wrap's horizontal scroll position and whatever now holds focus intact.
    function commitRow(row) {
      row.editing = false;
      const tr = region.querySelector(`tr[data-row-id="${row.id}"]`);
      if (!tr) return;
      tr.outerHTML = rowMarkup(row);
      const committed = region.querySelector(`tr[data-row-id="${row.id}"]`);
      if (committed) bindRow(committed);
    }

    /* ---------- Table events ---------- */

    // Footer and empty-state controls only. A ROW's controls are bound by bindRow()
    // instead of from here, because a commit re-renders one <tr> on its own and has
    // to be able to re-bind exactly that row — binding row controls region-wide
    // would double-bind every surviving row on each commit.
    function bindTableEvents() {
      region
        .querySelectorAll(".table-footer [data-action], .empty-block [data-action]")
        .forEach(bindAction);
      region.querySelectorAll("tbody tr").forEach(bindRow);
    }

    function bindRow(tr) {
      // The row's own delete control, through the same handler as the footer's.
      tr.querySelectorAll("[data-action]").forEach(bindAction);

      if (tr.classList.contains("is-clickable")) {
        // Click a saved row to edit it. One handler on the row covers both inputs:
        // a pointer anywhere in the row, and Enter or Space on the identifier
        // cell's button, whose click bubbles here. The delete control is excluded —
        // it is an action ON the row, not a way into it.
        tr.addEventListener("click", (event) => {
          if (event.target.closest('[data-action="delete-row"]')) return;
          const row = rows.find((entry) => entry.id === tr.dataset.rowId);
          if (!row || row.editing) return;
          beginEdit(row);
        });
        return;
      }

      // Typing into an edit row keeps the model in step, so a re-render (add,
      // delete, commit) does not silently discard what the user typed — and it is
      // what makes the commit above free of any read-back.
      tr.querySelectorAll("[data-row-id][data-field]").forEach((control) => {
        // `input` for the text fields; `change` as well, because a select
        // committed with the keyboard does not fire `input` in every engine.
        const write = (event) => {
          const row = rows.find((entry) => entry.id === control.dataset.rowId);
          if (!row) return;
          // A `.select` cell reports through its own bubbling `select:change` and
          // carries the value in `detail` — its trigger is a <button> with no
          // `.value`, so reading the target would write "" over the model.
          row[control.dataset.field] =
            event.type === "select:change" ? event.detail.value : event.target.value;
        };
        control.addEventListener("input", write);
        control.addEventListener("change", write);
        control.addEventListener("select:change", write);
        // A plain text cell has no Enter behaviour of its own, so the default is
        // the browser's implicit form submit — wrong for a wizard step. The
        // `.select` cell's own button already stops this in select.js.
        if (control.tagName === "INPUT") {
          control.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !event.isComposing) event.preventDefault();
          });
        }
      });
      // The comboboxes in this row were written straight into innerHTML, so they
      // are enhanced here — the script's own document pass ran long before this
      // row existed. Idempotent, so re-rendering a row costs one check.
      if (window.OmeuSelect) window.OmeuSelect.init(tr);
    }

    function bindAction(button) {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "add-row") {
          onDirty();
          rowSeq += 1;
          const row = { id: `phase-${rowSeq}`, editing: true, phase: "" };
          valueKeys.forEach((key) => {
            row[key] = "";
          });
          rows.push(row);
          // beginEdit() renders and lands on the new row's first field. The frame
          // draws the Giai đoạn input of the edit row in its focused state; this
          // is that state, reached the way a user actually reaches it rather than
          // painted on at rest — see the deviation note in
          // design-system/components/data-table.md. It also commits the row that was
          // open before, which is what `Thêm giai đoạn` from an editing row now means.
          beginEdit(row);
          return;
        }

        if (action === "delete-row") {
          const id = button.dataset.rowId;
          const index = rows.findIndex((row) => row.id === id);
          if (index === -1) return;
          // Immediate, one click, no confirmation dialog — design decision,
          // 2026-08-14, and V2 has no dialog component to compose anyway. The
          // recovery travels with the confirmation instead: the whole row object
          // is kept, so `Hoàn tác` restores its dates and its edit state at the
          // index it came from, not a blank row in its place.
          onDirty();
          const removed = rows.splice(index, 1)[0];
          // The control that was just used no longer exists. Focus goes to the
          // delete button that took its place, or to the previous row's when the
          // last row went; with no rows left there is nothing in the table to
          // hold focus, so it goes to the control that can create one.
          const neighbour = rows[index] || rows[index - 1];
          focusAfterRender = neighbour
            ? `[data-action="delete-row"][data-row-id="${neighbour.id}"]`
            : '[data-action="add-row"]';
          render();
          // Raw string: the screen's notifier escapes what it is given. Escaping
          // here too painted `Kinh doanh &amp; Vận hành`.
          notify(`Đã xóa ${rowLabel(removed)}.`, {
            label: "Hoàn tác",
            onActivate: () => {
              rows.splice(Math.min(index, rows.length), 0, removed);
              // Focus the restored row's own delete button: it is where focus
              // was before the delete, and it names the row that just came back.
              focusAfterRender = `[data-action="delete-row"][data-row-id="${removed.id}"]`;
              render();
            },
          });
          return;
        }

        if (action === "settings") notify("Thiết lập cột (chưa có trong bản demo).");
      });
    }

    // ONE `focusout` listener, on the region, bound once — not per row, and not
    // rebound by a render, because `region` is the stable element the screen owns
    // and everything else inside it is replaced markup.
    //
    // It has to be the region rather than the `<tr>`: focusout bubbles UP, so a
    // row-level listener never sees focus leaving `.data-table-wrap`, and the
    // wrap is a real focus stop (its own tabindex, and the nearest focusable
    // ancestor of a click on a row's padding). Bound per row, the sequence
    // "click into a row, click its padding, click away" left that row in the edit
    // state permanently: the first move was correctly ignored as a move to the
    // wrap, and the second fired on the wrap, above the only listener that could
    // have committed it. Measured on both wizards, 2026-08-18. commitOnBlur()
    // already decides what a given focus move means, so the listener only has to
    // be somewhere that sees every one of them.
    /* Not bound when every row is already editing: commitOnBlur() would flip
       `row.editing` to false and repaint the row as static text, which is the one
       state an always-editing table must never reach. Nothing is lost by leaving
       it off — bindRow() writes every keystroke through to the model, so the
       commit was only ever the render half of that pair. */
    if (!alwaysEditing) region.addEventListener("focusout", scheduleCommit);

    /* The freeze is a measurement, so it is retaken when the width changes. A
       ResizeObserver on the region rather than a `window` resize listener,
       because create() is called again every time the section-edit dialog opens
       — a window listener per create would outlive the region it measures and
       accumulate one per open. The observer is reachable only from this closure,
       so it is collected with the editor it belongs to. Where the API is absent
       the class is simply whatever the last render measured, which is correct on
       the wizards (2048px never fits) and stale only for a dialog resized across
       `sm` while open. */
    if (typeof ResizeObserver === "function") {
      new ResizeObserver(syncFrozenAction).observe(region);
    }

    return {
      render: render,
      // The array the screen handed in, so a caller can read the committed model
      // back without keeping its own reference in step.
      rows: rows,
    };
  }

  global.OmeuPhaseTable = { COLUMNS: COLUMNS, DATE_KEYS: DATE_KEYS, create: create };
})(window, document);
