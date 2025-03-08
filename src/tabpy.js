function Tabpy(selector, options = {}) {
  this.container = document.querySelector(selector);
  if (!this.container) {
    console.error(`Tabpy: No container found for selector '${selector}'`);
    return;
  }

  this.tabs = Array.from(this.container.querySelectorAll("li a"));
  if (!this.tabs.length) {
    console.error(`Tabpy: No tabs found inside the container`);
    return;
  }

  this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabpy: No panel found for selector '${tab.getAttribute("href")}'`
        );
      }

      return panel;
    })
    .filter(Boolean);

  if (this.tabs.length !== this.panels.length) return;

  this.opt = { remember: false, onChange: null, ...options };

  this.paramKey = selector.replace(/[^a-zA-Z0-9]/g, "");
  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabpy.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.paramKey);

  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find(
        (tabItem) =>
          tabItem.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "") ===
          tabSelector
      )) ||
    this.tabs[0];

  this.currentTab = tab;
  this._activateTab(tab, false);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => this._handleTabClick(event, tab);
  });
};

Tabpy.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();

  this._tryActivateTab(tab);
};

Tabpy.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this._activateTab(tab);
    this.currentTab = tab;
  }
};

Tabpy.prototype._activateTab = function (tab, triggerOnChange = true) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabpy--active");
  });

  tab.closest("li").classList.add("tabpy--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  if (this.opt.remember) {
    const params = new URLSearchParams(location.search);
    const paramValue = tab.getAttribute("href").replace(/[^a-zA-Z0-9]/g, "");
    params.set(this.paramKey, paramValue);
    history.replaceState(null, null, `?${params}`);
  }

  if (triggerOnChange && typeof this.opt.onChange === "function") {
    this.opt.onChange({
      tab,
      panel: panelActive,
    });
  }
};

Tabpy.prototype.switch = function (input) {
  let tabToActivate = null;

  if (typeof input === "string") {
    tabToActivate = this.tabs.find((tab) => tab.getAttribute("href") === input);
    if (!tabToActivate) {
      console.error(`Tabpy: No panel found with ID '${input}'`);
      return;
    }
  } else if (this.tabs.includes(input)) {
    tabToActivate = input;
  }

  if (!tabToActivate) {
    console.error(`Tabpy: Invalid input '${input}'`);
    return;
  }

  his._tryActivateTab(tabToActivate);
};

Tabpy.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
  this.currentTab = null;
};
