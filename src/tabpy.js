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

  this.panels = this.getPanels();

  if (this.tabs.length !== this.panels.length) return;

  this.opt = {
    activeClassName: "tabpy--active",
    remember: false,
    onChange: null,
    ...options,
  };

  this._cleanRegex = /[^a-zA-Z0-9]/g;
  this.paramKey = selector.replace(this._cleanRegex, "");
  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabpy.prototype.getPanels = function () {
  return (this.panels = this.tabs
    .map((tab) => {
      const panel = document.querySelector(tab.getAttribute("href"));
      if (!panel) {
        console.error(
          `Tabpy: No panel found for selector '${tab.getAttribute("href")}'`
        );
      }

      return panel;
    })
    .filter(Boolean));
};

Tabpy.prototype._init = function () {
  const params = new URLSearchParams(location.search);
  const tabSelector = params.get(this.paramKey);

  const tab =
    (this.opt.remember &&
      tabSelector &&
      this.tabs.find(
        (tabItem) =>
          tabItem.getAttribute("href").replace(this._cleanRegex, "") ===
          tabSelector
      )) ||
    this.tabs[0];

  this.currentTab = tab;
  this._activateTab(tab, false, false);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => {
      event.preventDefault();
      this._tryActivateTab(tab);
    };
  });
};

Tabpy.prototype._tryActivateTab = function (tab) {
  if (this.currentTab !== tab) {
    this.currentTab = tab;
    this._activateTab(tab);
  }
};

Tabpy.prototype._activateTab = function (
  tab,
  triggerOnChange = true,
  updateUrl = this.opt.remember
) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove(this.opt.activeClassName);
  });

  tab.closest("li").classList.add(this.opt.activeClassName);

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  if (updateUrl) {
    const params = new URLSearchParams(location.search);
    params.set(
      this.paramKey,
      tab.getAttribute("href").replace(this._cleanRegex, "")
    );
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
