/* row-table.js — the editable row table (`OmeuRowTable`).

   PROMOTED OUT OF `screens/doi-tac/tao-moi.js` ON 2026-09-22, which is what that
   file said to do when a second screen needed it: "If a third screen needs this
   shape, promoting it into ../../scripts/ … is the right follow-up; one screen is
   not enough reason to move it yet." The second screen is
   `screens/doi-tac/chi-tiet.html`, whose `Thông tin khác` dialog became this
   table on the same day. Nothing about the behaviour changed in the move — the
   four tables on the create wizard are the same tables they were.

   WHY THIS EXISTS BESIDE `scripts/phase-table.js`, which
   design-system/components/data-table.md names as the editable-row behaviour:
   the two are implementations of one idea that grew apart before either was
   shared. This one has what the partner screens need and the project screens
   never asked for — a configurable identifier key, per-cell required validation,
   a column set that can change at runtime, a boolean cell — and the project
   screens' module has nine-column defaults and a commit path tuned to them.
   Merging them is a real change with real risk to five screens and it is NOT
   this one; the duplication is recorded as a gap in
   design-system/components/data-table.md so the next reader meets it as a known
   cost rather than as a surprise.

   THE OPTIONS, and which screens pass them:

     region, rows, columns, identifierKey, rowPrefix   — every caller
     onDirty, notify, regionLabel                      — every caller
     emptyTitle, emptyText, addLabel                   — every caller
     isColumnVisible   — the address table only (MDM-1166 AC1.2's country rule)
     tableClass        — the address, contacts and bank tables (their own min-width)
     alwaysEditing     — `Thông tin khác` only
     lockedValues      — `Thông tin khác` only
     column.controlFor — `Thông tin khác` only (one control per ROW)
     column.unique     — `Thông tin khác` only

   Every flag defaults to the behaviour the four original tables had, so a caller
   that passes none of them gets exactly what it got before this file existed. */
(function (window, document) {
  "use strict";

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

  function create(options) {
    const region = options.region;
    const rows = options.rows;
    const columns = options.columns;
    const identifierKey = options.identifierKey;
    const rowPrefix = options.rowPrefix || "row";
    const onDirty = typeof options.onDirty === "function" ? options.onDirty : function () {};
    const notifyFn = typeof options.notify === "function" ? options.notify : function () {};
    const regionLabel = options.regionLabel || "Bảng dữ liệu";
    const emptyTitle = options.emptyTitle || "Chưa có dữ liệu";
    const emptyText = options.emptyText || "";
    const addLabel = options.addLabel || "Thêm dòng";
    // A column stays in the rendered set unless the caller says otherwise —
    // contacts and bank accounts pass nothing and every column of theirs is
    // always visible, unchanged from before this option existed. The address
    // table is the one caller that passes a real predicate: MDM-1166 AC1.2's
    // country conditional hides `Khu vực`/`Tỉnh/Thành phố`/`Phường/Xã` at the
    // COLUMN level (a `Quốc gia` fact about the whole table), never per row.
    const isColumnVisible = typeof options.isColumnVisible === "function" ? options.isColumnVisible : function () { return true; };
    function visibleColumns() {
      return columns.filter(isColumnVisible);
    }
    // An optional modifier class on the rendered `<table>`, for a screen-local
    // CSS rule that does not belong on every consumer — the address table
    // uses it for its own `min-width` (see ./tao-moi.css); contacts and bank
    // pass nothing and the class list is unchanged from before this existed.
    const tableClass = options.tableClass || "";
    // Every value column except action and the identifier — the identifier is
    // seeded explicitly in add-row, same split phase-table.js's own
    // `valueKeys` makes against `phase`. Filtered by KEY rather than by
    // `columns.slice(2)`'s old assumption that the identifier is always
    // column index 1: true for `name`/`bankName`, false for the address
    // table's `detail`, which AC1.2 puts last so `Loại địa chỉ` can lead.
    // Computed from the FULL column set, not `visibleColumns()` — a row seeds
    // every key it could ever need, including a VN-only one hidden at the
    // moment the row is created, so the value is not lost if `Quốc gia`
    // changes back later.
    const valueKeys = columns
      .filter((column) => column.key !== "action" && column.key !== identifierKey)
      .map((column) => column.key);

    /* ---------- The `Thông tin khác` flags, added 2026-09-22 ----------

       All three default to what the address, contacts and bank tables already
       do, and those three pass none of them. Only the `Thông tin khác` table
       below passes them.

       They are the same three rules `scripts/phase-table.js` grew on 2026-09-22
       for the `Các giai đoạn chính` dialog, ported here rather than shared,
       because that module and this helper are two implementations of one idea
       and merging them is not what this change is. Recorded as a duplication in
       the hand-back. */

    // Every row is a line of controls from first paint: no click-to-edit, no
    // commit-on-blur, and no `is-editing` tint (which marks the ONE open row and
    // marks nothing when every row is open).
    const alwaysEditing = options.alwaysEditing === true;
    // Identifier values whose row carries no delete control and whose identifier
    // cell is static text. Matched on the identifier column's VALUE, which is
    // what the caller has to key on.
    const lockedValues = Array.isArray(options.lockedValues) ? options.lockedValues : [];

    function isLocked(row) {
      return lockedValues.indexOf(row[identifierKey]) !== -1;
    }

    function isEditing(row) {
      return alwaysEditing || Boolean(row.editing);
    }

    /* A column may hand the control decision to the ROW. `Thông tin khác`'s
       `Giá trị` column is one cell whose type is decided by which attribute the
       row names — text for `Mã SAP`, a select for `Tình trạng hợp tác`, a
       textarea for `Ghi chú nội bộ`. Everything else declares its type once on
       the column, as before, and `controlFor` is simply absent.

       The descriptor is read INSTEAD of the column for `type`, `options` and
       `placeholder`; `key`, `label` and the rest stay the column's. */
    function controlOf(row, column) {
      if (typeof column.controlFor !== "function") return column;
      const spec = column.controlFor(row) || {};
      return {
        key: column.key,
        label: column.label,
        // `required` comes from the DESCRIPTOR when one is given, so a column
        // can be required on some rows and not on others; it falls back to the
        // column's own flag.
        required: spec.required === undefined ? column.required : spec.required,
        unique: column.unique,
        type: spec.type || column.type,
        options: spec.options || column.options,
        placeholder: spec.placeholder || column.placeholder,
      };
    }

    let rowSeq = rows.length;
    let focusAfterRender = null;
    let commitTimer = 0;
    // Which cells failed the last validate(paint). Keyed `rowId:columnKey`.
    // Held here rather than on the row objects because it is screen state, not
    // record state — a row that is saved with the wizard carries no memory of
    // having been refused once.
    const invalidCells = new Set();

    function cellKey(rowId, key) {
      return `${rowId}:${key}`;
    }

    // Undoes exactly what editCell()'s invalid branch drew, on the one cell
    // whose value just changed — the DOM mirror of deleting its key from
    // invalidCells. `control` is whatever carries `[data-row-id][data-field]`,
    // which is the `<input>` itself for a text/email/tel/boolean cell but the
    // wrapping `.select` div for a select cell (see editCell()); the actual
    // control to unmark is that div's own `.select__control` button.
    function clearCellErrorDom(control) {
      const td = control.closest("td");
      if (!td) return;
      const target = control.classList.contains("select") ? control.querySelector(".select__control") : control;
      if (target) {
        target.removeAttribute("aria-invalid");
        target.removeAttribute("aria-describedby");
        target.removeAttribute("data-tooltip");
        target.removeAttribute("data-tooltip-place");
        target.classList.remove("select__control--error");
      }
      const errorNode = td.querySelector(".form-field__error");
      if (errorNode) errorNode.remove();
    }

    function rowLabel(row) {
      return row[identifierKey] || "chưa đặt tên";
    }

    function cellName(column, row) {
      return `${column.label}, ${rowLabel(row)}`;
    }

    // A `type: "select"` column's option rows — same construction as
    // scripts/phase-table.js's own `selectOptions()` for its `Giai đoạn`
    // cell: the record's own value leads the list (so a value the column's
    // option set does not carry is still shown rather than silently
    // dropped), it is the only row marked `aria-selected`, and an empty
    // value keeps the placeholder reachable instead of pre-selecting row 0.
    // An option is a plain string, or `{ value, dot }` for the `Dot leading`
    // variant of design-system/components/select.md. `Tình trạng hợp tác` is the
    // one caller that needs the object form: it was a dot-leading select as a
    // form field and moving it into a cell must not silently drop the dot.
    function optionValue(entry) {
      return entry && typeof entry === "object" ? entry.value : entry;
    }

    function optionMarkup(entry, chosen) {
      const entryValue = optionValue(entry);
      const dot = entry && typeof entry === "object" ? entry.dot : "";
      // `--success` is the only tone ../../styles/select.css authors; any other
      // dot is the plain one rather than a tone invented for it.
      const lead = dot
        ? `<span class="select__dot${dot === "success" ? " select__dot--success" : ""}" aria-hidden="true"></span>`
        : "";
      return `
                <li class="select__option" data-value="${esc(entryValue)}"${
                  chosen.indexOf(entryValue) !== -1 ? ' aria-selected="true"' : ""
                }>
                  <span class="select__option-body">
                    ${lead}<span class="select__option-text">${esc(entryValue)}</span>
                  </span>
                </li>`;
    }

    function selectOptions(row, column) {
      /* A multiple select (`type: "tags"`) holds an ARRAY — `OmeuSelect`'s
         `value()` returns one for a multiple control, and the model is written
         straight from it. Everything below works in terms of the CHOSEN LIST, of
         which a single select's is at most one entry, so both types take one
         path and a single select behaves exactly as it did. */
      const raw = row[column.key];
      const chosen = Array.isArray(raw) ? raw.slice() : raw ? [raw] : [];
      /* A `unique` column drops what ANOTHER row already holds — `Thông tin
         khác` never offers an attribute the table is already carrying,
         including the locked ones. Recomputed per render, because the answer
         changes as rows are added and deleted. THIS row's own value survives:
         it is the selected option, and removing it would leave the trigger
         showing a value its menu cannot tick. */
      const taken = column.unique
        ? rows
            .filter((entry) => entry !== row)
            .reduce((all, entry) => all.concat(entry[column.key]), [])
            .filter((entry) => entry !== "" && entry !== null && entry !== undefined)
        : [];
      const optionList = chosen
        .concat(column.options || [])
        .filter((entry) => {
          const entryValue = optionValue(entry);
          return entryValue !== "" && entryValue !== null && entryValue !== undefined;
        })
        .filter((entry) => {
          const entryValue = optionValue(entry);
          return chosen.indexOf(entryValue) !== -1 || taken.indexOf(entryValue) === -1;
        })
        .filter(
          (entry, index, all) =>
            all.findIndex((other) => optionValue(other) === optionValue(entry)) === index,
        );
      return optionList.map((entry) => optionMarkup(entry, chosen)).join("");
    }

    function editCell(row, baseColumn) {
      // The descriptor, not the column: a `controlFor` column decides its type
      // per row. Identical to the column when no `controlFor` is declared, which
      // is every caller but `Thông tin khác`.
      const column = controlOf(row, baseColumn);
      const value = row[column.key];

      /* TEXTAREA CELL — added 2026-09-22 for `Ghi chú nội bộ`, the one attribute
         whose value is a sentence rather than a value. A contract addition, not
         a screen invention: recorded in design-system/components/data-table.md
         alongside the tags cell below, because an editable cell was "a text
         input or a select" until this change.

         `rows="2"`, not the form field's 3: the cell sits in a table row and a
         three-line box makes every OTHER row in the table taller than its
         content needs. `.cell-input--area` is the paint (../../styles/data-table.css). */
      if (column.type === "textarea") {
        const invalidArea = invalidCells.has(cellKey(row.id, column.key));
        const areaErrorId = `${rowPrefix}-${row.id}-${column.key}-error`;
        const areaMessage = `Vui lòng nhập ${String(baseColumn.label).toLowerCase()}.`;
        return `
          <td class="cell-input cell-input--area">
            <textarea rows="2" placeholder="${esc(column.placeholder || "Nhập thông tin")}"
                      aria-label="${esc(cellName(baseColumn, row))}"
                      ${invalidArea ? `aria-invalid="true" aria-describedby="${esc(areaErrorId)}" data-tooltip="${esc(areaMessage)}" data-tooltip-place="bottom"` : ""}
                      data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">${esc(value || "")}</textarea>
            ${
              invalidArea
                ? `<p class="form-field__error sr-only-label" id="${esc(areaErrorId)}">${icon("error")}<span>${esc(areaMessage)}</span></p>`
                : ""
            }
          </td>
        `;
      }

      /* TAGS CELL — added 2026-09-22 for `Nhóm hàng cung cấp`. The Tags type of
         design-system/components/select.md, cell-sized: the construction this
         screen used for the same attribute as a FORM FIELD until 2026-09-22,
         minus the `id`/`label for` pair a cell has no room for — the input
         carries its own `aria-label`, which is what names the popup listbox as
         well.

         `.select--cell` sizes the shell to the cell atom, exactly as the plain
         select cell above does. The value is the component's; the model is
         written from `select:change`, whose `detail.value` is a comma-joined
         string for a multiple select. */
      if (column.type === "tags") {
        return `
          <td class="cell-input">
            <div class="select select--cell" data-select data-select-multiple
                 data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">
              <div class="select__control select__control--tags">
                <span class="material-symbols-outlined select__lead" aria-hidden="true">search</span>
                <ul class="select__tags"></ul>
                <input class="select__input" type="text" placeholder="${esc(column.placeholder || "Chọn")}"
                       aria-label="${esc(cellName(baseColumn, row))}">
                <button class="select__clear" type="button" aria-label="Xoá tất cả giá trị đã chọn" hidden>
                  <span class="material-symbols-outlined" aria-hidden="true">close</span>
                </button>
              </div>
              <ul class="select__menu" hidden>${selectOptions(row, column)}</ul>
            </div>
          </td>
        `;
      }

      if (column.type === "boolean") {
        // NOT `.cell-input` — that class's `:is(input, select)` rule
        // (../../styles/data-table.css) draws a full-width bordered text box,
        // which is right for the text/email/tel cells above but wrong for a
        // checkbox. `.cell-input--boolean` alone centers the cell; `.choice`
        // (../../styles/form-field.css) already draws the control itself.
        return `
          <td class="cell-input--boolean">
            <input class="choice" type="checkbox" ${value ? "checked" : ""}
                   aria-label="${esc(cellName(column, row))}"
                   data-row-id="${esc(row.id)}" data-field="${esc(column.key)}" data-boolean>
          </td>
        `;
      }
      if (column.type === "select") {
        // The DS `.select` combobox (design-system/components/select.md), not a
        // native select — same reason and same shape as
        // scripts/phase-table.js's `Giai đoạn` cell: only the authored menu
        // carries the tick on the chosen row and the 6px option rhythm.
        // `.select--cell` sizes it to the cell atom rather than the 44px form
        // control (../../styles/data-table.css). The row id and field travel
        // on `.select` itself, because this cell reports through the
        // component's own bubbling `select:change` — its trigger is a
        // <button> with no `.value` — not through `input`/`change`.
        //
        // No `data-select-required`: this table's required check is the row
        // sweep at the bottom of this function (`validate()`/`invalidCells`),
        // the same one the text cells above use, and a `data-select-required`
        // here would ALSO be swept by `requiredFields()` at the form level —
        // that sweep expects a `label[for]` and an `${id}Error` node neither
        // of which this cell has, so it would paint "Vui lòng chọn trường bắt
        // buộc." on a node no one can resolve. One required-cell path, same
        // as the text cells.
        const invalid = invalidCells.has(cellKey(row.id, column.key));
        const errorId = `${rowPrefix}-${row.id}-${column.key}-error`;
        const selectMessage = `Vui lòng chọn ${column.label.toLowerCase()}.`;
        const name = esc(cellName(column, row));
        return `
          <td class="cell-input">
            <div class="select select--cell" data-select
                 data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">
              <button class="select__control${invalid ? " select__control--error" : ""}" type="button"
                      aria-label="${name}"
                      ${invalid ? `aria-invalid="true" aria-describedby="${esc(errorId)}" data-tooltip="${esc(selectMessage)}" data-tooltip-place="bottom"` : ""}>
                <span class="select__value"><span class="select__placeholder">Chọn</span></span>
                <span class="material-symbols-outlined select__chevron" aria-hidden="true">expand_more</span>
              </button>
              <ul class="select__menu" hidden>${selectOptions(row, column)}</ul>
            </div>
            ${
              invalid
                ? `<p class="form-field__error sr-only-label" id="${esc(errorId)}">${icon("error")}<span>${esc(selectMessage)}</span></p>`
                : ""
            }
          </td>
        `;
      }
      const type = column.type === "email" ? "email" : column.type === "tel" ? "tel" : "text";
      // Ô lỗi: `aria-invalid` + `data-tooltip` trên control, `.form-field__error.sr-only-label` cho `aria-describedby`; câu lỗi chỉ nêu tên cột.
      const invalid = invalidCells.has(cellKey(row.id, column.key));
      const errorId = `${rowPrefix}-${row.id}-${column.key}-error`;
      const inputMessage = `Vui lòng ${column.type === "select" ? "chọn" : "nhập"} ${column.label.toLowerCase()}.`;
      return `
        <td class="cell-input">
          <input type="${type}" value="${esc(value || "")}" placeholder="${esc(column.placeholder || "Nhập thông tin")}"
                 aria-label="${esc(cellName(column, row))}"
                 ${invalid ? `aria-invalid="true" aria-describedby="${esc(errorId)}" data-tooltip="${esc(inputMessage)}" data-tooltip-place="bottom"` : ""}
                 data-row-id="${esc(row.id)}" data-field="${esc(column.key)}">
          ${
            invalid
              ? `<p class="form-field__error sr-only-label" id="${esc(errorId)}">${icon("error")}<span>${esc(inputMessage)}</span></p>`
              : ""
          }
        </td>
      `;
    }

    function rowMarkup(row) {
      const label = rowLabel(row);
      // `visibleColumns()`, not `columns`: a hidden VN-only column renders no
      // cell at all in either state (editing or committed), which is what
      // makes it "not collected" rather than merely blanked — see
      // `isColumnVisible` above.
      const editing = isEditing(row);
      const locked = isLocked(row);
      const cells = visibleColumns()
        .slice(1)
        .map((column) => {
          // A locked row's identifier is static text in BOTH states: there is
          // nothing to choose and no edit state to enter, so neither the select
          // nor the `.cell-edit-trigger` button has anything to do.
          if (locked && column.key === identifierKey) {
            return `<td><span class="cell-text">${esc(row[identifierKey] || "")}</span></td>`;
          }
          if (editing) return editCell(row, column);
          if (column.key === identifierKey) {
            return `
              <td>
                <button class="cell-edit-trigger" type="button" data-row-id="${esc(row.id)}"
                        aria-label="Chỉnh sửa ${esc(label)}">${row[identifierKey] ? esc(row[identifierKey]) : "—"}</button>
              </td>
            `;
          }
          if (column.type === "boolean") {
            return row[column.key]
              ? `<td class="cell-input--boolean"><input class="choice choice--flag" type="checkbox" checked disabled aria-label="${esc(cellName(column, row))}"></td>`
              : `<td class="cell-input--boolean"><input class="choice choice--flag" type="checkbox" disabled aria-label="${esc(cellName(column, row))}"></td>`;
          }
          const value = row[column.key] || "";
          return value === ""
            ? `<td><span class="cell-empty"><span aria-hidden="true">—</span><span class="sr-only-label">Không có</span></span></td>`
            : `<td><span class="cell-text">${esc(value)}</span></td>`;
        })
        .join("");
      // Empty, not a disabled button: a control that can never be used is a tab
      // stop that says nothing, and the column still holds its width for the
      // rows that do carry one.
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
      // No state class at all on an always-editing table. `is-clickable` wires
      // click-to-edit, which has nothing to open; `is-editing` paints
      // `--utui-table-row-editing-bg` to mark the ONE open row, which marks
      // nothing when every row is open and tints the whole body.
      const stateClass = alwaysEditing ? "" : editing ? "is-editing" : "is-clickable";
      return `
        <tr class="${stateClass}" data-row-id="${esc(row.id)}">
          ${action}
          ${cells}
        </tr>
      `;
    }

    function emptyMarkup() {
      return `
        <div class="empty-block">
          <span class="empty-illustration" aria-hidden="true"></span>
          <p class="empty-block__title">${esc(emptyTitle)}</p>
          <p class="empty-block__text">${esc(emptyText)}</p>
          <button class="button button--secondary-color" type="button" data-action="add-row">
            ${icon("add")}<span>${esc(addLabel)}</span>
          </button>
        </div>
      `;
    }

    function render() {
      if (rows.length === 0) {
        region.innerHTML = emptyMarkup();
        bindTableEvents();
        restoreFocus();
        return;
      }
      // action mặc định 68px (data-table.md, một control) — cột auto bị ép về 0 khi bảng tràn
      const cols = visibleColumns()
        .map((column) => column.width || (column.key === "action" ? 68 : 0))
        .map((width) => (width ? `<col style="width: ${width}px">` : "<col>"))
        .join("");
      const heads = visibleColumns()
        .map((column) =>
          column.key === "action"
            ? `<th scope="col"><span class="sr-only-label">Hành động</span></th>`
            : // A required column says so in its header, once, rather than in
              // every cell under it — the `*` belongs to the column, and a
              // marker repeated down forty rows is noise. Same marker and same
              // clipped spelling-out the form labels use.
              `<th scope="col">${esc(column.label)}${
                column.required
                  ? ` <span class="required-marker" aria-hidden="true">*</span><span class="sr-only-label"> (bắt buộc)</span>`
                  : ""
              }</th>`,
        )
        .join("");
      region.innerHTML = `
        <div class="data-table-wrap" role="region" tabindex="0" aria-label="${esc(regionLabel)}">
          <table class="data-table${tableClass ? ` ${esc(tableClass)}` : ""}">
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
              ${icon("add")}<span>${esc(addLabel)}</span>
            </button>
          </div>
          <p class="pagination-count">${rows.length} kết quả</p>
        </footer>
      `;
      bindTableEvents();
      restoreFocus();
    }

    function restoreFocus() {
      const target = focusAfterRender;
      focusAfterRender = null;
      if (!target) return;
      let node = region.querySelector(target);
      // `[data-row-id][data-field]` lands on the FOCUSABLE control for a text
      // or boolean cell, but a `.select` cell carries both on the wrapping
      // `<div>` (data-table.md's construction, same as
      // scripts/phase-table.js's `Giai đoạn` cell) — a plain div has no
      // implicit tabindex, so `.focus()` on it is a silent no-op and focus
      // stays wherever it was (typically <body>, once the old node was
      // removed by this same render). That is not just a missed focus: the
      // next `focusout` bubbling through `region` then sees an
      // activeElement OUTSIDE the table and commits the very row `validate()`
      // just marked invalid, erasing the error it painted. Redirect to the
      // div's own trigger, the actual focus target.
      if (node && node.classList.contains("select")) {
        node = node.querySelector(".select__control");
      }
      if (node) node.focus();
    }

    function beginEdit(row) {
      rows.forEach((entry) => {
        entry.editing = entry === row;
      });
      focusAfterRender = `[data-row-id="${row.id}"][data-field="${identifierKey}"]`;
      render();
    }

    function scheduleCommit() {
      window.clearTimeout(commitTimer);
      commitTimer = window.setTimeout(commitOnBlur, 0);
    }

    function commitOnBlur() {
      const node = document.activeElement;
      const inside = Boolean(node) && region.contains(node);
      if (inside && node.classList.contains("data-table-wrap")) return;
      const holder = inside ? node.closest("tr[data-row-id]") : null;
      const keepId = holder ? holder.dataset.rowId : null;
      rows.forEach((row) => {
        if (row.editing && row.id !== keepId) commitRow(row);
      });
    }

    function commitRow(row) {
      row.editing = false;
      redrawRow(row);
    }

    // One row's markup, replaced in place and re-bound. Used by the commit above
    // and by the identifier re-render below; NOT render(), so the wrap's
    // horizontal scroll position and every other row's focus survive.
    function redrawRow(row) {
      const tr = region.querySelector(`tr[data-row-id="${row.id}"]`);
      if (!tr) return null;
      tr.outerHTML = rowMarkup(row);
      const drawn = region.querySelector(`tr[data-row-id="${row.id}"]`);
      if (drawn) bindRow(drawn);
      return drawn;
    }

    /* A `controlFor` column reads the row, so a cell that DECIDES another cell's
       control has to repaint the row when it changes. `Thông tin khác` is the
       case: choosing `Ghi chú nội bộ` has to turn the `Giá trị` cell into a
       textarea, and choosing `Nhóm hàng cung cấp` into a tags field.

       Only the identifier is watched, and only when some column actually
       declares `controlFor` — so the address, contact and bank tables, whose
       columns are fixed, never take this path and never repaint a row mid-typing.

       Focus is put back on the control the user just used, by field rather than
       by node: the node they were on no longer exists. Without this, choosing an
       attribute dropped the keyboard to <body>. */
    const hasRowControls = columns.some((column) => typeof column.controlFor === "function");

    function redrawRowForIdentifier(row) {
      const drawn = redrawRow(row);
      if (!drawn) return;
      const cell = drawn.querySelector(`[data-field="${identifierKey}"]`);
      if (!cell) return;
      const control = cell.classList.contains("select") ? cell.querySelector(".select__control") : cell;
      if (control) control.focus();
    }

    function bindTableEvents() {
      region
        .querySelectorAll(".table-footer [data-action], .empty-block [data-action]")
        .forEach(bindAction);
      region.querySelectorAll("tbody tr").forEach(bindRow);
    }

    function bindRow(tr) {
      tr.querySelectorAll("[data-action]").forEach(bindAction);

      if (tr.classList.contains("is-clickable")) {
        tr.addEventListener("click", (event) => {
          if (event.target.closest('[data-action="delete-row"]')) return;
          const row = rows.find((entry) => entry.id === tr.dataset.rowId);
          if (!row || row.editing) return;
          beginEdit(row);
        });
        return;
      }

      tr.querySelectorAll("[data-row-id][data-field]").forEach((control) => {
        const write = (event) => {
          const row = rows.find((entry) => entry.id === control.dataset.rowId);
          if (!row) return;
          const key = control.dataset.field;
          // A `.select` cell reports through its own bubbling `select:change`
          // and carries the value in `detail` — its trigger is a <button>
          // with no `.value`, so reading `event.target.value` there would
          // write "" over the model. Same branch scripts/phase-table.js's
          // `bindRow()` uses for its own `Giai đoạn` cell.
          row[key] = control.hasAttribute("data-boolean")
            ? control.checked
            : event.type === "select:change"
              ? event.detail.value
              : event.target.value;
          // A required cell's error is painted by validate(), never by this
          // handler — that rule is unchanged. But once painted, nothing else
          // ever CLEARED it: the form-level sweep in bindStepForms() skips
          // every cell on purpose (see editCell()'s select branch above), so
          // a row could read as fixed to stepIsValid() while still showing a
          // red border and "Vui lòng nhập ..." underneath it, which is the
          // one thing every OTHER required field in this wizard does not do.
          // Cleared in place — no render() — so a still-focused text input
          // never loses focus or caret mid-keystroke, and a `.select`'s own
          // open/close state is left alone too.
          if (invalidCells.has(cellKey(row.id, key)) && String(row[key] ?? "").trim() !== "") {
            invalidCells.delete(cellKey(row.id, key));
            clearCellErrorDom(control);
          }
          // The identifier decides the other cells' controls when a column
          // declares `controlFor`, so it is the one field whose change repaints
          // the row. Deferred by a task: `select:change` is dispatched from
          // inside the component's own click handling, and replacing the trigger
          // underneath it leaves that handler finishing on a detached node.
          if (hasRowControls && key === identifierKey) {
            window.setTimeout(() => redrawRowForIdentifier(row), 0);
          }
        };
        control.addEventListener("input", write);
        control.addEventListener("change", write);
        control.addEventListener("select:change", write);
      });
      // The row's `.select` cells (if any — only the address table has them)
      // were written straight into innerHTML above, so the script's own
      // document-ready pass ran before this row existed and they need
      // enhancing here, same as scripts/phase-table.js's `Giai đoạn` cell.
      // Idempotent, so committing and re-editing a row costs one check.
      if (window.OmeuSelect) window.OmeuSelect.init(tr);
    }

    function bindAction(button) {
      button.addEventListener("click", () => {
        const action = button.dataset.action;

        if (action === "add-row") {
          onDirty();
          rowSeq += 1;
          const row = { id: `${rowPrefix}-${rowSeq}`, editing: true };
          row[identifierKey] = "";
          valueKeys.forEach((key) => {
            const column = columns.find((entry) => entry.key === key);
            row[key] = column && column.type === "boolean" ? false : "";
          });
          rows.push(row);
          beginEdit(row);
          return;
        }

        if (action === "delete-row") {
          const id = button.dataset.rowId;
          const index = rows.findIndex((row) => row.id === id);
          if (index === -1) return;
          onDirty();
          const removed = rows.splice(index, 1)[0];
          const neighbour = rows[index] || rows[index - 1];
          focusAfterRender = neighbour
            ? `[data-action="delete-row"][data-row-id="${neighbour.id}"]`
            : '[data-action="add-row"]';
          render();
          notifyFn(`Đã xóa ${rowLabel(removed)}.`, {
            label: "Hoàn tác",
            onActivate: () => {
              rows.splice(Math.min(index, rows.length), 0, removed);
              focusAfterRender = `[data-action="delete-row"][data-row-id="${removed.id}"]`;
              render();
            },
          });
        }
      });
    }

    /* Not bound when every row is already editing: commitOnBlur() would flip
       `row.editing` to false and repaint the row as static text, which is the
       one state an always-editing table must never reach. Nothing is lost —
       bindRow() writes every keystroke through to the model, so the commit was
       only ever the render half of that pair. */
    if (!alwaysEditing) region.addEventListener("focusout", scheduleCommit);

    if (typeof ResizeObserver === "function") {
      new ResizeObserver(() => {}).observe(region);
    }

    /* ---------- Row-level required (MDM-1166 AC1.2) ----------

       The AC does not make these tables required — it makes them CONDITIONALLY
       required: "bắt buộc nhập, nếu tạo người liên hệ", "bắt buộc, nếu tạo
       thông tin Ngân hàng". A partner with no contacts and no bank account is a
       valid partner; a contact row with no name is not a contact. So an empty
       table passes and every row that exists is checked.

       Paint follows the step validator's own rule — find the problem first,
       move to it, THEN mark it: the offending row is put back into the edit
       state (a committed row shows text, and text cannot carry a control's
       error), the cell is focused, and every empty required cell in that row is
       marked at once so the person fixes them in one pass rather than being
       sent back a field at a time. */

    // `visibleColumns()`, not `columns`: a required column that is currently
    // hidden (none of this table's own columns are, but a future consumer's
    // might be) must not block a row that cannot even show it a control.
    // The columns that carry the header `*`. A column whose required-ness is
    // decided per ROW is NOT one of them — `Thông tin khác`'s `Giá trị` is
    // required for two attributes out of eight, and a `*` over the column would
    // say it is required for all of them.
    function requiredColumns() {
      return visibleColumns().filter((column) => column.required && !column.controlFor);
    }

    // The columns a GIVEN row must fill: the column-level ones, plus the
    // per-row ones whose descriptor says so for this row.
    function requiredColumnsFor(row) {
      return visibleColumns().filter((column) =>
        column.controlFor ? Boolean(controlOf(row, column).required) : Boolean(column.required),
      );
    }

    function firstEmptyCell() {
      for (const row of rows) {
        for (const column of requiredColumnsFor(row)) {
          if (String(row[column.key] ?? "").trim() === "") return { row: row, column: column };
        }
      }
      return null;
    }

    function validate(paint) {
      const bad = firstEmptyCell();
      if (!paint) return !bad;
      invalidCells.clear();
      if (!bad) {
        render();
        return true;
      }
      requiredColumnsFor(bad.row).forEach((column) => {
        if (String(bad.row[column.key] ?? "").trim() === "") {
          invalidCells.add(cellKey(bad.row.id, column.key));
        }
      });
      rows.forEach((row) => {
        row.editing = row.id === bad.row.id;
      });
      focusAfterRender = `[data-row-id="${bad.row.id}"][data-field="${bad.column.key}"]`;
      render();
      return false;
    }

    return { render: render, rows: rows, validate: validate };
  }

  window.OmeuRowTable = { create: create };
})(window, document);
