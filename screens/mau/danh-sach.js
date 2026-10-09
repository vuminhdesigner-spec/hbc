(function () {
  // Trạng thái màn đọc từ query (?state=empty) — mỗi trạng thái là một step trong flow.
  const state = new URLSearchParams(location.search).get("state");
  document.getElementById("emptyState").hidden = state !== "empty";
})();
