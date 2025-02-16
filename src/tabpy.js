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

  this.opt = { remember: false, ...options };

  this._originalHTML = this.container.innerHTML;

  this._init();
}

Tabpy.prototype._init = function () {
  const hash = location.hash;
  const tab =
    (this.opt.remember &&
      hash &&
      this.tabs.find((tabItem) => tabItem.getAttribute("href") === hash)) ||
    this.tabs[0];

  this._activateTab(tab);

  this.tabs.forEach((tab) => {
    tab.onclick = (event) => this._handleTabClick(event, tab);
  });
};

Tabpy.prototype._handleTabClick = function (event, tab) {
  event.preventDefault();

  this._activateTab(tab);
};

Tabpy.prototype._activateTab = function (tab) {
  this.tabs.forEach((tab) => {
    tab.closest("li").classList.remove("tabpy--active");
  });

  tab.closest("li").classList.add("tabpy--active");

  this.panels.forEach((panel) => (panel.hidden = true));

  const panelActive = document.querySelector(tab.getAttribute("href"));
  panelActive.hidden = false;

  if (this.opt.remember) {
    history.replaceState(null, null, tab.getAttribute("href"));
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

  this._activateTab(tabToActivate);
};

Tabpy.prototype.destroy = function () {
  this.container.innerHTML = this._originalHTML;
  this.panels.forEach((panel) => (panel.hidden = false));
  this.container = null;
  this.tabs = null;
  this.panels = null;
};
