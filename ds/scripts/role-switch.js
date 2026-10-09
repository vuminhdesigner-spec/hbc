/* role-switch.js — the shared behaviour of the `.side-profile` role switch.

   Why this file exists: this package now draws TWO LANES of screens that belong
   to two different roles. The requester's lane (`project-docs`,
   `project-doc-upload`) and the archive department's lane (`archive-queue`,
   `archive-appraisal`) are the two swim lanes of the flowchart in
   `docs/luu-tru-ho-so-du-an/quy-trinh-luu-tru-ho-so.png`, and until this file existed there was nothing on
   screen saying which role you were acting as and no way at all to reach the DC
   lane — no nav item points at it.

   `xem-sua-thong-tin-file` and `ho-so-du-an` belong to NEITHER lane: both roles act
   on them, so they are neutral and leave the switch alone. Their trail's ancestor
   segment is written per-role instead — see REGISTRY and paintRoleHomeLinks().

   `chi-tiet-yeu-cau-luu-tru` was the third name on that list from 2026-08-25 and its
   bundle is gone since 2026-08-26 (D49): it merged into `xem-sua-thong-tin-file`,
   which was already neutral for the same reason, so the list is one shorter and
   nothing else about it changed.

   Third shared script in the package after `notification.js` and `page-tab.js`,
   and for the same reason both of those are shared: this is behaviour no single
   screen owns. The `.side-profile` block is shell chrome, duplicated as static
   markup across nine screen files, so a per-screen implementation would be nine
   copies of one menu and nine chances for one of them to forget to return focus.

   No build step, so it is a plain IIFE publishing one global. Load it with a
   <script src> BEFORE the screen's own bundle.

   IT SELF-INITIALISES AND INJECTS ITS OWN MARKUP. A screen adopts it with one
   script tag and no markup change:

     <script src="../scripts/role-switch.js"></script>

   That is deliberate. `moduleNav`, the profile block and the nav renderer are
   duplicated per screen; anything this file needed the nine HTML files to
   declare would be a ninefold edit every time it changed.

   State lives in sessionStorage (`mdm.role`) — the same lifetime `page-tab.js`
   gives the open-tab strip, and for the same reason: a role outlives a
   navigation between screens but not the browser tab the demo runs in.

   ── WHAT THIS IS NOT ─────────────────────────────────────────────────────────

   THIS IS NOT A SESSION CONCEPT AND MUST NOT BE READ AS ONE. Q5' is open and
   unanswered (D30 chose to leave it open): there is no identity
   provider anywhere in this package, and the static shell profile is duplicated
   across nine files with two versions that disagree. A real implementation
   derives a role from an identity provider. This one is a demo affordance that
   lets a reviewer walk both lanes, and the viewer picks their own role from a
   menu — which is precisely what a real one must never allow.

   THE IDENTITY DOES NOT CHANGE WITH THE ROLE. The signed-in person stays
   whoever the screen's own markup says they are; only the role line under their
   name changes. Inventing a second named DC officer would put a person into the
   package that no source names, and `dc_support@company.com` — the only
   DC address the source gives — is a shared departmental mailbox, not a person.

   THE SOURCE NEVER SAYS ONE PERSON MAY HOLD BOTH ROLES. In the flowchart they
   are two swim lanes. Whether a requester may also appraise is an unanswered
   permission question, and it is the same question Q2 asks about the adhoc
   branch — where the source likewise records no enforcement path of any kind.

   ── HOW A ROLE REACHES ITS SCREENS ───────────────────────────────────────────

   By navigating, not by re-rendering the navigation. Choosing a role sends you
   to that role's home screen; `moduleNav` stays byte-identical across every
   screen in the package. The alternative — injecting a `Lưu trữ` nav item under
   one role — would fork a constant that is copied into nine files, which is the
   defect this file exists to avoid rather than one to introduce. */

(function (global) {
  "use strict";

  var STORAGE_KEY = "mdm.role";

  /* The two lanes, in menu order. `home` is the screen a role lands on, stored
     as a path relative to `screens/` so the same registry works from the
     repository root (`index.html`) and from any depth inside `screens/` — see
     hrefFor(). It was a bare filename until 2026-09-16; the folder was cut by
     business entity that day and `chi-tiet.html` stopped naming one screen.

     `homeLabel` is that screen's OWN name, not the role's — it is what a
     breadcrumb segment or a back link pointing at `home` should read. The two
     are different strings on purpose: `Bộ phận lưu trữ (DC)` names a person's
     role and `Hàng đợi xử lý` names a place, and a trail segment that named the
     role would be describing who you are where it should be describing where the
     link goes. `homeAction` is the same destination worded as an act, for a CTA
     on an empty state, where a bare place name reads as a caption rather than as
     something to press. Added 2026-08-25 for the shared screens — see home(). */
  var REGISTRY = [
    {
      id: "nguoi-gui-ho-so",
      label: "Người gửi hồ sơ",
      hint: "PTDA · Thiết kế · TCKT · QLXD",
      home: "du-an/ho-so/danh-sach.html",
      homeLabel: "Hồ sơ dự án",
      homeAction: "Về danh sách hồ sơ",
      // Upload is an overlay on du-an/ho-so/danh-sach.html since 2026-10-01: no screen of its own to claim.
      screens: [],
    },
    {
      id: "bo-phan-luu-tru",
      label: "Bộ phận lưu trữ (DC)",
      hint: "dc_support@company.com",
      home: "du-an/ho-so/hang-doi.html",
      homeLabel: "Hàng đợi xử lý",
      homeAction: "Về hàng đợi xử lý",
      /* ONE SCREEN SINCE 2026-08-27, and it shrank rather than lost anything:
         `dc-tham-dinh-thong-tin.html` is deleted, and the act it carried moved
         onto `du-an/ho-so/chi-tiet.html` (Figma section 12684:19513).
         That screen is NOT listed here and cannot be — the registry's rule is
         that a screen is listed only if the OTHER role has nothing to do in it,
         and both roles read the shared detail screen. So the queue is the whole
         of this role's claim, the same way `du-an/ho-so/tai-len.html` is the whole
         of the requester's. */
      screens: ["du-an/ho-so/hang-doi.html"],
    },
  ];

  var DEFAULT_ROLE = REGISTRY[0].id;

  var profile = document.querySelector(".side-profile");
  var trigger = profile && profile.querySelector(".side-profile__more");
  /* `du-an/ho-so/chi-tiet.html` draws no app shell at all, so it has no
     profile block to attach to. Same early return `page-tab.js` takes for the
     screens that draw no tab strip. `dc-tham-dinh-thong-tin.html` was the other
     such screen until it was deleted on 2026-08-27.

     IT CAME BACK TO THIS LIST ON 2026-08-26d, when it was rebuilt as a popup
     full-screen on Figma section 12646:17687 (it attached to the shell between
     2026-08-22 and then). It still NEEDS the role — its close link, its header
     actions AND, since 2026-08-27, whether its form is editable at all differ by
     lane — so it reads `mdm.role` out of sessionStorage itself rather than through
     this API, which does not exist on a page with no profile block. That is a
     second reader of this file's storage key; the key and its two values are the
     contract between them, and the DC lane now depends on it for more than a
     link. */
  if (!profile || !trigger) return;

  var sideNav = document.getElementById("sideNav");
  var listeners = [];
  var menu = null;
  var open = false;
  var current = resolveRole();

  /* The tooltip says something different in the two rail widths, and the width
     is owned by the collapse toggle, so it is watched rather than duplicated. */
  if (sideNav && global.MutationObserver) {
    new global.MutationObserver(function () {
      paintTooltip();
    }).observe(sideNav, { attributes: true, attributeFilter: ["class"] });
  }

  paintRole();
  paintRoleHomeLinks();
  buildMenu();
  bind();

  /* ---------- State ---------- */

  function byId(id) {
    for (var i = 0; i < REGISTRY.length; i += 1) {
      if (REGISTRY[i].id === id) return REGISTRY[i];
    }
    return null;
  }

  function readRole() {
    try {
      return global.sessionStorage.getItem(STORAGE_KEY);
    } catch (error) {
      /* Private-mode Safari throws on storage access rather than returning
         null, and file:// origins can too. The switch still works for this
         page; it just forgets on navigate. Same tolerance page-tab.js takes. */
      return null;
    }
  }

  function writeRole(id) {
    try {
      global.sessionStorage.setItem(STORAGE_KEY, id);
    } catch (error) {
      /* See readRole. */
    }
  }

  /* The role of the screen currently open, or null for a neutral one. */
  function roleOfCurrentScreen() {
    var here = currentScreen();
    if (!here) return null;
    for (var i = 0; i < REGISTRY.length; i += 1) {
      if (REGISTRY[i].screens.indexOf(here) !== -1) return REGISTRY[i].id;
    }
    return null;
  }

  /* The current screen as the registry spells it — the path below `screens/`,
     e.g. `du-an/ho-so/tai-len.html`. The last path segment is NOT enough since
     2026-09-16: `du-an/chi-tiet.html` (a project record) and
     `du-an/ho-so/chi-tiet.html` (a document, worked in by both lanes) would
     match each other, and a lane claim on one would move the switch on the
     other. Returns null off `screens/` — the portal home belongs to no lane. */
  function currentScreen() {
    var parts = String(global.location.pathname).split("/");
    var at = parts.lastIndexOf("screens");
    return at === -1 ? null : parts.slice(at + 1).join("/");
  }

  /* THE SCREEN WINS OVER STORAGE — fixed 2026-08-22.

     The first version read storage alone and fell back to the default, so
     opening `du-an/ho-so/hang-doi.html` from a pasted link, a bookmark or a fresh
     session painted `Người gửi hồ sơ` under the profile while the DC queue
     filled the page. The label contradicted the screen, which is worse than
     having no label: a switch that misreports where you are teaches the reader
     to distrust it.

     So a screen that belongs to a role sets that role and persists it — arriving
     on a DC screen IS acting as DC, however you got there. Neutral screens
     (project-list, project-overview, the record tabs, the portal home, and
     `du-an/ho-so/chi-tiet.html`, which is where the archive request's detail
     view has lived since 2026-08-26) keep whatever the switch
     was last set to, because both roles work in them and nothing about them
     implies an answer.

     THE COST OF GETTING THE MEMBERSHIP WRONG IS A SILENT ROLE CHANGE, not just a
     wrong label: this function WRITES the screen's claim to storage, so one
     navigation onto a mislabelled screen changes the role for every neutral
     screen afterwards. A screen goes in a role's list only if the other role has
     nothing to do there.

     A stored id the registry no longer knows falls back to the default rather
     than leaving the profile claiming a role that does not exist. */
  function resolveRole() {
    var fromScreen = roleOfCurrentScreen();
    if (fromScreen) {
      if (fromScreen !== readRole()) writeRole(fromScreen);
      return fromScreen;
    }
    var stored = readRole();
    return byId(stored) ? stored : DEFAULT_ROLE;
  }

  /* The registry holds paths relative to `screens/` because this script is
     loaded both from the screens themselves and from the portal home at the
     repository root. Resolving here keeps one registry instead of two.

     The climb is computed rather than fixed: bundles sit one folder below
     `screens/` (`du-an/chi-tiet.html`) or two (`du-an/ho-so/chi-tiet.html`),
     and a hard-coded `../` would be right for only one of them. Same resolver
     as scripts/page-tab.js. */
  function screensRoot() {
    var parts = String(global.location.pathname).split("/");
    var at = parts.lastIndexOf("screens");
    if (at === -1) return "screens/";
    var depth = parts.length - at - 2; // folders between `screens/` and the file
    return depth > 0 ? new Array(depth + 1).join("../") : "./";
  }

  function hrefFor(role) {
    return screensRoot() + role.home;
  }

  /* ---------- Paint ---------- */

  /* The role line is a THIRD line inside `.side-profile__body`, under the name
     and the mail. It is injected rather than authored into the nine HTML files
     for the reason given in the header. `.side-profile` itself is a three-column
     grid (32px / 1fr / 24px) and the body is its middle column, so adding a line
     grows the block downward without touching that grid. */
  function paintRole() {
    var role = byId(current);
    if (!role) return;
    var body = profile.querySelector(".side-profile__body");
    if (!body) return;
    var line = body.querySelector(".side-profile__role");
    if (!line) {
      line = document.createElement("span");
      line.className = "side-profile__role";
      body.appendChild(line);
    }
    line.textContent = role.label;
    paintTooltip();
  }

  /* The trigger's tooltip, kept in step with the role and with the rail width.
     Expanded it names the action, because the row already draws the identity and
     the role. Collapsed the row draws NOTHING but a monogram — the body and the
     role line are hidden at 64px — so the tooltip carries the name, the address
     and the current role. That is what makes the collapsed rail's identity
     readable at all, and it is why the sm tier no longer hides the menu.

     `title` rather than a tooltip component: the package has no tooltip
     component, and `side-navigation.md` already uses `title` for the same reason
     on collapsed nav items. */
  function paintTooltip() {
    var role = byId(current);
    if (!role) return;
    if (!sideNav || !sideNav.classList.contains("is-collapsed")) {
      trigger.title = "Chọn vai trò";
      return;
    }
    var name = profile.querySelector(".side-profile__name");
    var mail = profile.querySelector(".side-profile__mail");
    var parts = [];
    if (name && name.textContent) parts.push(name.textContent.trim());
    if (mail && mail.textContent) parts.push(mail.textContent.trim());
    parts.push(role.label);
    trigger.title = parts.join(" · ");
  }

  /* ---------- The per-role ancestor link ----------
     Added 2026-08-25. A screen that belongs to NEITHER lane has no one screen
     above it: both roles work in it and each arrived from their own lane's home.
     Authoring one ancestor meant a DC officer who opened a request from their
     own queue was offered `← Hồ sơ dự án`, a way "back" into the other lane.

     A screen adopts this the way it adopts the rest of this file — by marking
     the link, not by writing code. `data-role-home` on the anchor takes the
     href; an optional `[data-role-home-label]` inside it takes the destination's
     name. If the label element is absent the href is still rewritten and the
     authored text stands, which is what a link whose wording must not change
     wants (`Về danh sách hồ sơ` on the not-found block, for instance, reads as
     an action rather than as a place).

     THE AUTHORED HREF IS THE NO-JS FALLBACK and must stay the DEFAULT_ROLE
     destination, so a page whose scripts never run still points somewhere true
     for the role it would have painted.

     A screen bundle may refine what this writes — `du-an/ho-so/chi-tiet.js` adds
     the list state the requester arrived with — but it runs after this file, and
     it has to branch on the role itself rather than assume one. */
  function paintRoleHomeLinks() {
    var role = byId(current);
    if (!role) return;
    var links = document.querySelectorAll("[data-role-home]");
    Array.prototype.forEach.call(links, function (link) {
      link.href = hrefFor(role);
      /* Two wordings, because the two consumers are a trail segment and a
         CTA. A link that marks neither keeps its authored text — see the header
         comment on this function. */
      var action = link.querySelector("[data-role-home-action]");
      if (action) action.textContent = role.homeAction;
      var label = link.querySelector("[data-role-home-label]");
      if (label) label.textContent = role.homeLabel;
    });
  }

  function buildMenu() {
    menu = document.createElement("div");
    menu.className = "role-menu";
    menu.id = "roleMenu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Chọn vai trò");
    menu.hidden = true;
    menu.innerHTML = REGISTRY.map(function (role) {
      var active = role.id === current;
      return (
        '<button class="role-menu__option' +
        (active ? " is-active" : "") +
        '" type="button" role="menuitemradio" aria-checked="' +
        String(active) +
        '" data-role="' +
        role.id +
        '">' +
        '<span class="role-menu__label">' +
        role.label +
        "</span>" +
        '<span class="role-menu__hint">' +
        role.hint +
        "</span>" +
        "</button>"
      );
    }).join("");
    profile.appendChild(menu);

    /* The trigger was authored as a static, unwired `Tùy chọn tài khoản` button
       in all eleven screens. It becomes the menu's trigger here rather than in
       markup, so the eleven files stay identical.

       The 24px target that used to be recorded here as a load-bearing gap was
       closed by the component on 2026-08-22: `.side-profile__more` now covers the
       whole profile row — 264 x 40 expanded, 40 x 40 over the avatar collapsed.
       Both are wider than the glyph; the collapsed one is still under the 44px
       minimum, which is the rail's width, and is recorded in
       side-navigation.md. */
    trigger.setAttribute("aria-haspopup", "menu");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", menu.id);
    trigger.setAttribute("aria-label", "Chọn vai trò");
  }

  function syncMenu() {
    if (!menu) return;
    menu.querySelectorAll("[data-role]").forEach(function (option) {
      var active = option.dataset.role === current;
      option.classList.toggle("is-active", active);
      option.setAttribute("aria-checked", String(active));
    });
  }

  /* ---------- Open / close ---------- */

  function setOpen(next) {
    open = next;
    menu.hidden = !next;
    trigger.setAttribute("aria-expanded", String(next));
    if (next) {
      var active = menu.querySelector(".is-active") || menu.querySelector("[data-role]");
      if (active) active.focus();
    }
  }

  function close(returnFocus) {
    if (!open) return;
    setOpen(false);
    if (returnFocus) trigger.focus();
  }

  /* ---------- Behaviour ---------- */

  function choose(id) {
    var role = byId(id);
    if (!role) return;
    /* Choosing the role you are already in closes the menu and does nothing
       else. Navigating anyway would throw away whatever screen the reviewer was
       reading, which is a surprising outcome for a control that reads as a
       statement of where you already are. */
    if (id === current) {
      close(true);
      return;
    }
    current = id;
    writeRole(id);
    paintRole();
    syncMenu();
    listeners.forEach(function (fn) {
      try {
        fn(id);
      } catch (error) {
        /* One screen's callback throwing must not stop the navigation below,
           and must not stop the other listeners. */
      }
    });
    close(false);
    global.location.href = hrefFor(role);
  }

  function bind() {
    trigger.addEventListener("click", function (event) {
      event.stopPropagation();
      setOpen(!open);
    });

    menu.addEventListener("click", function (event) {
      var option = event.target.closest("[data-role]");
      if (!option) return;
      choose(option.dataset.role);
    });

    /* Escape closes and returns focus to the trigger; a click anywhere else
       closes without moving focus. The same contract `.nav-module__menu`
       directly above this control already follows on every screen. */
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") close(true);
    });

    document.addEventListener("click", function (event) {
      if (!open) return;
      if (profile.contains(event.target)) return;
      close(false);
    });
  }

  /* ---------- Public API ----------
     For a screen that has to branch on the role. The shared screens do —
     `du-an/ho-so/chi-tiet.html` belongs to neither lane (it carries both the
     document and the archive request since the 2026-08-26 merge), so its trail's
     ancestor segment is read from here rather than authored (see home() below). A screen that later needs to hide an
     action from one role should read `get()` here rather than reaching into
     storage directly. */
  global.OmeuRole = {
    get: function () {
      return current;
    },
    set: function (id) {
      choose(id);
    },
    /* Where the current role's trail goes UP to, and what that segment reads.
       Added 2026-08-25.

       The two neutral screens are reached from two different places by two
       different roles, and until this existed both authored one ancestor —
       `← Hồ sơ dự án`, the requester's library. A DC officer who opened a
       request from their own queue was offered a way "back" into the other
       lane's home, which is not where they came from and not a screen their work
       passes through. Now each role's trail leads back to its own lane.

       IT IS THE ROLE'S HOME, NOT THE PREVIOUS PAGE, and those are not the same
       thing: DC reading a document arrived from the request detail, one level
       below the queue this returns. A true parent needs the record ancestry the
       package does not carry across these screens (the document link out of the
       request detail passes an `?id=`, no `?yc=`), so this returns the ancestor
       the role can always be handed rather than the one it happens to have.
       Recorded rather than papered over.

       `label` is the destination's own name — see `homeLabel` on REGISTRY. */
    home: function () {
      var role = byId(current);
      if (!role) return null;
      return { href: hrefFor(role), label: role.homeLabel, id: role.id };
    },
    onChange: function (fn) {
      if (typeof fn === "function") listeners.push(fn);
    },
    registry: function () {
      return REGISTRY.slice();
    },
  };
})(window);
