const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const smooth = value => { const x = clamp(value); return x * x * (3 - 2 * x); };
const names = ["Emergence", "Resonance", "Dissolution", "Stillness"];

// The native scroll position is the source of truth for both HTML and WebGL.
export default class ScrollTimeline {
  constructor() {
    this.container = document.querySelector("main");
    this.sections = [...this.container.querySelectorAll("section")];
    this.reveals = [...this.container.querySelectorAll("[data-reveal]")];
    this.links = [...document.querySelectorAll(".chapter-nav a, .chapter-rail a")];
    this.label = document.querySelector("[data-chapter-label]");
    this.motionButton = document.querySelector(".motion-toggle");
    this.preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.motionOverride = null;
    this.listeners = [];
    this.progress = 0;
    this.velocity = 0;
    this.active = -1;
    this.lastScroll = this.container.scrollTop;

    this.measure();
    this.updateMotion();
    this.container.addEventListener("scroll", () => this.read(), { passive: true });
    this.motionButton.addEventListener("click", () => {
      this.motionOverride = !this.motionEnabled;
      this.updateMotion();
    });
    this.preference.addEventListener("change", () => this.updateMotion());
    this.resizeObserver = new ResizeObserver(() => this.measure());
    this.resizeObserver.observe(this.container);
    this.sections.forEach(section => this.resizeObserver.observe(section));
    document.fonts.ready.then(() => this.measure());

    document.querySelectorAll('a[href^="#section-"]').forEach(link => {
      link.addEventListener("click", event => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) return;
        event.preventDefault();
        history.replaceState(null, "", link.getAttribute("href"));
        target.focus({ preventScroll: true });
        this.container.scrollTo({ top: target.offsetTop, behavior: this.motionEnabled ? "smooth" : "instant" });
      });
    });
    window.addEventListener("hashchange", () => this.goToHash());
    this.goToHash();
    document.documentElement.classList.add("scroll-ready");
  }

  onChange(callback) { this.listeners.push(callback); }

  goToHash() {
    const target = this.sections.find(section => `#${section.id}` === location.hash);
    if (target) this.container.scrollTo({ top: target.offsetTop, behavior: "instant" });
  }

  updateMotion() {
    this.motionEnabled = this.motionOverride ?? !this.preference.matches;
    document.documentElement.dataset.motion = this.motionEnabled ? "on" : "off";
    this.motionButton.setAttribute("aria-pressed", String(!this.motionEnabled));
    this.motionButton.querySelector("[data-motion-label]").textContent = this.motionEnabled ? "Motion on" : "Motion off";
    this.motionButton.title = this.motionEnabled ? "Pause ambient motion" : "Resume ambient motion";
    this.read();
  }

  measure() {
    this.height = this.container.clientHeight;
    this.anchors = this.sections.map(section => section.offsetTop);
    const rootTop = this.container.getBoundingClientRect().top;
    this.bounds = this.reveals.map(element => {
      // Temporarily remove reveal transforms so cached bounds don't drift on resize.
      const transform = element.style.transform;
      element.style.transform = "none";
      const rect = element.getBoundingClientRect();
      element.style.transform = transform;
      return { top: rect.top - rootTop + this.container.scrollTop, height: rect.height, chapterTop: element.closest("section").offsetTop };
    });
    this.read();
  }

  read() {
    const top = this.container.scrollTop;
    let index = 0;
    while (index < this.anchors.length - 1 && top >= this.anchors[index + 1]) index++;
    const next = this.anchors[index + 1];
    this.progress = index + (next === undefined ? 0 : clamp((top - this.anchors[index]) / (next - this.anchors[index])));
    const active = Math.min(3, Math.floor(this.progress + .5));
    if (active !== this.active) {
      this.active = active;
      this.label.textContent = `0${active + 1} / ${names[active]}`;
      this.links.forEach(link => {
        if (link.hash === `#section-${active}`) link.setAttribute("aria-current", "step");
        else link.removeAttribute("aria-current");
      });
    }
    const maxScroll = this.container.scrollHeight - this.height;
    document.documentElement.style.setProperty("--journey", maxScroll > 0 ? clamp(top / maxScroll) : 0);
    this.reveals.forEach((element, i) => {
      const y = this.bounds[i].top - top;
      // Reveal the complete composition before its chapter settles. Lower
      // annotations must not need a second scroll position to become readable.
      const chapterY = this.bounds[i].chapterTop - top;
      const enter = smooth((this.height * .9 - chapterY) / (this.height * .5));
      const exit = smooth((y + this.bounds[i].height + this.height * .12) / (this.height * .2));
      element.style.setProperty("--reveal", Math.min(enter, exit).toFixed(3));
      element.style.setProperty("--reveal-y", `${((1 - enter) * 28 - (1 - exit) * 16).toFixed(1)}px`);
    });
    this.listeners.forEach(callback => callback());
  }

  update(delta) {
    const top = this.container.scrollTop;
    const target = this.motionEnabled ? clamp((top - this.lastScroll) / Math.max(delta, .008) / this.height, -1.5, 1.5) : 0;
    this.velocity += (target - this.velocity) * (1 - Math.exp(-delta * 7));
    this.lastScroll = top;
  }
}
