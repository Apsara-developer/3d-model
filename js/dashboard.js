(() => {
  const $ = id => document.getElementById(id);
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
  async function loadAccount() {
    try {
      const me = await fetch("/api/auth/me").then(r => r.json());
      if (me.user) {
        $("accountName").textContent = me.user.name;
        $("accountEmail").textContent = me.user.email;
        $("accountAvatar").textContent = (me.user.name || "A").trim().charAt(0).toUpperCase();
      }
      const data = await fetch("/api/projects").then(r => r.json());
      if (!data.success) throw new Error(data.message || "Could not load your websites.");
      const projects = data.projects || [];
      $("projectCount").textContent = projects.length;
      $("publishedCount").textContent = projects.filter(p => p.status === "Published").length;
      $("draftCount").textContent = projects.filter(p => p.status !== "Published").length;
      $("recentProjects").innerHTML = projects.length ? projects.slice(0,8).map(p => `
        <article class="project-card">
          <div class="project-preview"><span>✦</span><small>ARAM WEBSITE</small></div>
          <div class="project-info"><div class="project-topline"><span class="project-status ${p.status === "Published" ? "published" : ""}">${escapeHTML(p.status || "Draft")}</span><time>${new Date(p.updatedAt || p.createdAt).toLocaleDateString()}</time></div>
          <h3>${escapeHTML(p.title || "Untitled website")}</h3>
          <p>${escapeHTML(p.prompt || "Created from a template")}</p>
          <a href="editor.html?projectId=${encodeURIComponent(p.id)}">Open in editor →</a>
          ${p.publishedUrl ? `<a class="published-link" target="_blank" rel="noopener" href="${escapeHTML(p.publishedUrl)}">View published ↗</a>` : ""}
          </div>
        </article>`).join("") : `<div class="empty-projects"><div>✦</div><h3>Your first website starts here</h3><p>Generate a website with AI or choose a template. Your saved work will appear in this account.</p><a href="create-website.html">Create your first website →</a></div>`;
    } catch (e) { $("recentProjects").innerHTML = `<p class="load-error">${escapeHTML(e.message)}</p>`; }
  }
  document.addEventListener("DOMContentLoaded", loadAccount);
})();
