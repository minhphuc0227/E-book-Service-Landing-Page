const USERS_KEY = "booklyUsers";
const CURRENT_USER_KEY = "booklyCurrentUser";

const readUsers = () => {
  const savedUsers = localStorage.getItem(USERS_KEY);
  if (!savedUsers) return [];

  const users = JSON.parse(savedUsers);
  if (!Array.isArray(users)) {
    throw new Error("Dữ liệu tài khoản không hợp lệ.");
  }
  return users;
};

const saveUser = (user) => {
  const users = readUsers();
  if (
    users.some(
      (account) =>
        account.username.toLowerCase() === user.username.toLowerCase(),
    )
  ) {
    return false;
  }

  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return true;
};

const showMessage = (element, message, isError = true) => {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("text-red-600", isError);
  element.classList.toggle("text-brand-700", !isError);
};

const siteLinks = [
  { label: "Trang chủ", href: "index.html#hero", section: "hero" },
  { label: "Tính năng", href: "index.html#tinh-nang", section: "tinh-nang" },
  { label: "Về BOOKLY", href: "index.html#so-lieu", section: "so-lieu" },
  { label: "Đánh giá", href: "index.html#cam-nhan", section: "cam-nhan" },
  { label: "Gói thành viên", href: "pricing.html", page: "pricing.html" },
  { label: "Liên hệ", href: "contact.html", page: "contact.html" },
  {
    label: "Câu hỏi thường gặp",
    href: "index.html#faq",
    section: "faq",
  },
];

const setActiveSiteLink = (menu, activeKey) => {
  menu.querySelectorAll("[data-nav-key]").forEach((link) => {
    const active = link.dataset.navKey === activeKey;
    link.classList.toggle("bg-brand-50", active);
    link.classList.toggle("text-brand-700", active);
    link.classList.toggle("dark:bg-brand-900", active);
    link.classList.toggle("dark:text-white", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
};

const initializeNavigation = () => {
  const nav = document.querySelector("header nav[aria-label]");
  if (!nav) return;

  nav.classList.add("relative");
  const logo = nav.querySelector('a[aria-label="BOOKLY - Trang chủ"]');
  if (logo) logo.href = "index.html";
  let menu = nav.querySelector("[data-site-nav]") || nav.querySelector("ul");
  if (!menu) {
    menu = document.createElement("ul");
    const authNav = nav.querySelector("[data-auth-nav]");
    nav.insertBefore(menu, authNav || null);
  }

  menu.dataset.siteNav = "";
  menu.id = "site-navigation";
  menu.className =
    "absolute left-0 right-0 top-full z-50 hidden flex flex-col gap-1 border-b border-line bg-surface p-3 shadow-lg dark:border-line-invert dark:bg-surface-dark lg:static lg:flex lg:flex-1 lg:flex-row lg:items-center lg:justify-center lg:gap-2 lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none";
  menu.replaceChildren();

  siteLinks.forEach(({ label, href, section, page }) => {
    const item = document.createElement("li");
    const link = document.createElement("a");
    link.href = href;
    link.dataset.navKey = section || page;
    link.className =
      "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-brand-50 hover:text-brand-700 dark:hover:bg-brand-900";
    link.textContent = label;
    item.append(link);
    menu.append(item);
  });

  let menuButton = nav.querySelector('[aria-label="Mở menu"]');
  if (!menuButton) {
    menuButton = document.createElement("button");
    menuButton.type = "button";
    nav.insertBefore(menuButton, menu);
  }
  menuButton.className =
    "inline-flex h-10 w-10 items-center justify-center rounded-lg border border-line lg:hidden";
  menuButton.setAttribute("aria-label", "Mở menu");
  menuButton.setAttribute("aria-controls", menu.id);
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.innerHTML = '<span aria-hidden="true" class="text-xl">☰</span>';
  const closeMenu = () => {
    menu.classList.add("hidden");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Mở menu");
  };
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });
  menuButton.addEventListener("click", () => {
    const expanded = menuButton.getAttribute("aria-expanded") !== "true";
    menuButton.setAttribute("aria-expanded", String(expanded));
    menuButton.setAttribute("aria-label", expanded ? "Đóng menu" : "Mở menu");
    menu.classList.toggle("hidden", !expanded);
  });

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  const indexPage = currentPage === "index.html";
  let activeKey = currentPage;
  if (currentPage === "profile.html") {
    nav
      .querySelector('a[href="profile.html"]')
      ?.classList.add(
        "bg-brand-50",
        "text-brand-700",
        "dark:bg-brand-900",
        "dark:text-white",
      );
    nav
      .querySelector('a[href="profile.html"]')
      ?.setAttribute("aria-current", "page");
  }
  if (indexPage) {
    activeKey = window.location.hash.slice(1) || "hero";
    if (window.IntersectionObserver) {
      const sections = siteLinks
        .filter((link) => link.section)
        .map((link) => document.getElementById(link.section))
        .filter(Boolean);
      const observer = new IntersectionObserver(
        (entries) => {
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort(
              (first, second) =>
                second.intersectionRatio - first.intersectionRatio,
            );
          if (visible[0]) setActiveSiteLink(menu, visible[0].target.id);
        },
        { rootMargin: "-20% 0px -65% 0px", threshold: [0, 0.1, 0.25, 0.5] },
      );
      sections.forEach((section) => observer.observe(section));
    }
  }
  setActiveSiteLink(menu, activeKey);
};

const renderAuthNavigation = () => {
  const navs = document.querySelectorAll("[data-auth-nav]");
  if (!navs.length) return;

  const username = localStorage.getItem(CURRENT_USER_KEY);
  const user = username
    ? readUsers().find(
        (account) => account.username.toLowerCase() === username.toLowerCase(),
      )
    : null;

  navs.forEach((nav) => {
    nav.replaceChildren();
    if (!user) {
      const registerLink = document.createElement("a");
      registerLink.href = "login.html#register";
      registerLink.className =
        "rounded-lg border border-line px-2 py-2 font-medium transition-colors hover:text-brand-600 sm:px-3";
      registerLink.textContent = "Đăng ký";

      const loginLink = document.createElement("a");
      loginLink.href = "login.html";
      loginLink.className =
        "rounded-lg bg-brand-600 px-2 py-2 font-medium text-white transition-colors hover:bg-brand-700 sm:px-3";
      loginLink.textContent = "Đăng nhập";
      nav.append(registerLink, loginLink);
      return;
    }

    const profileLink = document.createElement("a");
    profileLink.href = "profile.html";
    profileLink.className =
      "max-w-[140px] truncate rounded-lg border border-line px-2 py-2 font-medium transition-colors hover:text-brand-600 sm:max-w-[190px] sm:px-3";
    profileLink.textContent = user.fullName || user.username;
    profileLink.setAttribute("aria-label", "Mở hồ sơ cá nhân");
    if (window.location.pathname.endsWith("/profile.html")) {
      profileLink.classList.add(
        "bg-brand-50",
        "text-brand-700",
        "dark:bg-brand-900",
        "dark:text-white",
      );
      profileLink.setAttribute("aria-current", "page");
    }

    const logoutButton = document.createElement("button");
    logoutButton.type = "button";
    logoutButton.className =
      "rounded-lg px-2 py-2 font-medium text-red-600 transition-colors hover:bg-red-50 sm:px-3";
    logoutButton.textContent = "Đăng xuất";
    logoutButton.addEventListener("click", () => {
      localStorage.removeItem(CURRENT_USER_KEY);
      window.location.assign("index.html");
    });
    nav.append(profileLink, logoutButton);
  });
};

const clearFieldError = (form, name) => {
  const error = form.querySelector(`[data-error-for="${name}"]`);
  const field = form.elements.namedItem(name);
  if (error) error.textContent = "";
  if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
};

const showFieldError = (form, name, message) => {
  const error = form.querySelector(`[data-error-for="${name}"]`);
  const field = form.elements.namedItem(name);
  if (error) error.textContent = message;
  if (field instanceof HTMLElement) field.setAttribute("aria-invalid", "true");
};

const bindFieldErrorClearing = (form) => {
  form.addEventListener("input", (event) => {
    if (event.target.name) clearFieldError(form, event.target.name);
  });
  form.addEventListener("change", (event) => {
    if (event.target.name) clearFieldError(form, event.target.name);
  });
};

const validateRequiredFields = (form) => {
  let valid = true;
  form.querySelectorAll("[required]").forEach((field) => {
    if (field.type === "checkbox" || field.type === "radio") return;
    const value = field.value.trim();
    if (value) return;

    const label = form.querySelector(`label[for="${field.id}"]`);
    const labelText =
      label?.textContent
        .replace("*", "")
        .replace(/,?\s*bắt buộc\s*/i, " ")
        .replace(/\s+/g, " ")
        .trim() || "trường này";
    showFieldError(
      form,
      field.name,
      `Vui lòng nhập ${labelText.toLowerCase()}.`,
    );
    valid = false;
  });
  return valid;
};

const initializeLoginPage = () => {
  const loginForm = document.querySelector("#login-form");
  const registerForm = document.querySelector("#register-form");
  if (!loginForm || !registerForm) return;

  const loginPanel = document.querySelector("#login-panel");
  const registerPanel = document.querySelector("#register-panel");
  const loginMessage = document.querySelector("#login-message");
  const registerMessage = document.querySelector("#register-message");
  const loginTab = document.querySelector("#login-tab");
  const registerTab = document.querySelector("#register-tab");

  const setMode = (mode) => {
    const registering = mode === "register";
    loginPanel.hidden = registering;
    registerPanel.hidden = !registering;
    loginTab.setAttribute("aria-selected", String(!registering));
    registerTab.setAttribute("aria-selected", String(registering));
    showMessage(loginMessage, "");
    showMessage(registerMessage, "");
  };

  loginTab.addEventListener("click", () => setMode("login"));
  registerTab.addEventListener("click", () => setMode("register"));
  document.querySelectorAll("[data-show-register]").forEach((link) => {
    link.addEventListener("click", () => setMode("register"));
  });

  if (window.location.hash === "#register") setMode("register");

  loginForm.noValidate = true;
  registerForm.noValidate = true;
  bindFieldErrorClearing(loginForm);
  bindFieldErrorClearing(registerForm);

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage(loginMessage, "");
    loginForm.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
    const username = loginForm.elements.namedItem("username").value.trim();
    const password = loginForm.elements.namedItem("password").value;
    let valid = true;
    if (!username) {
      showFieldError(loginForm, "username", "Vui lòng nhập tên người dùng.");
      valid = false;
    }
    if (!password) {
      showFieldError(loginForm, "password", "Vui lòng nhập mật khẩu.");
      valid = false;
    }
    if (!valid) return;

    try {
      const user = readUsers().find(
        (account) =>
          account.username.toLowerCase() === username.toLowerCase() &&
          account.password === password,
      );
      if (!user) {
        showMessage(loginMessage, "Tên người dùng hoặc mật khẩu không đúng.");
        return;
      }

      localStorage.setItem(CURRENT_USER_KEY, user.username);
      window.location.assign("index.html");
    } catch (error) {
      console.error("Không thể kiểm tra tài khoản BOOKLY:", error);
      showMessage(
        loginMessage,
        "Không thể đọc dữ liệu tài khoản. Vui lòng thử lại.",
      );
    }
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage(registerMessage, "");
    registerForm.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
    if (!validateRequiredFields(registerForm)) return;

    const formData = new FormData(registerForm);
    const username = formData.get("username").trim();
    const password = formData.get("password");
    const favoriteGenres = formData.getAll("favoriteGenres");

    if (favoriteGenres.length === 0) {
      showFieldError(
        registerForm,
        "favoriteGenres",
        "Vui lòng chọn ít nhất một thể loại sách.",
      );
      return;
    }
    if (username.length < 3) {
      showFieldError(
        registerForm,
        "username",
        "Tên người dùng phải có ít nhất 3 ký tự.",
      );
      return;
    }
    if (password.length < 8) {
      showFieldError(
        registerForm,
        "password",
        "Mật khẩu phải có ít nhất 8 ký tự.",
      );
      return;
    }

    try {
      const user = {
        username,
        password,
        fullName: formData.get("fullName").trim(),
        phone: formData.get("phone").trim(),
        birthDate: formData.get("birthDate"),
        address: formData.get("address").trim(),
        favoriteGenres,
      };
      if (!saveUser(user)) {
        showMessage(registerMessage, "Tên người dùng này đã được đăng ký.");
        return;
      }

      localStorage.setItem(CURRENT_USER_KEY, username);
      window.location.assign("index.html");
    } catch (error) {
      console.error("Không thể lưu tài khoản BOOKLY:", error);
      showMessage(
        registerMessage,
        "Không thể lưu tài khoản. Vui lòng kiểm tra bộ nhớ trình duyệt và thử lại.",
      );
    }
  });
};

const initializeProfilePage = () => {
  const form = document.querySelector("#profile-form");
  if (!form) return;

  const message = document.querySelector("#profile-message");
  const currentUsername = localStorage.getItem(CURRENT_USER_KEY);
  const users = readUsers();
  const currentUser = users.find(
    (user) =>
      user.username.toLowerCase() === (currentUsername || "").toLowerCase(),
  );
  if (!currentUser) {
    window.location.replace("login.html");
    return;
  }

  const fillForm = (user) => {
    for (const field of form.elements) {
      if (!field.name || field.type === "checkbox" || field.type === "submit") {
        continue;
      }
      field.value = user[field.name] || "";
    }
    const favoriteGenres = user.favoriteGenres || [];
    form
      .querySelectorAll('input[name="favoriteGenres"]')
      .forEach((checkbox) => {
        checkbox.checked = favoriteGenres.includes(checkbox.value);
      });
    form.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
    form.querySelectorAll("[aria-invalid]").forEach((field) => {
      field.removeAttribute("aria-invalid");
    });
  };

  fillForm(currentUser);
  form.noValidate = true;
  bindFieldErrorClearing(form);
  document
    .querySelector("[data-reset-profile]")
    .addEventListener("click", () => {
      fillForm(currentUser);
      showMessage(message, "Đã khôi phục thông tin đã lưu.", false);
    });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    showMessage(message, "");
    form.querySelectorAll("[data-error-for]").forEach((error) => {
      error.textContent = "";
    });
    if (!validateRequiredFields(form)) return;

    const formData = new FormData(form);
    const username = formData.get("username").trim();
    const favoriteGenres = formData.getAll("favoriteGenres");
    if (username.length < 3) {
      showFieldError(
        form,
        "username",
        "Tên người dùng phải có ít nhất 3 ký tự.",
      );
      return;
    }
    if (!favoriteGenres.length) {
      showFieldError(
        form,
        "favoriteGenres",
        "Vui lòng chọn ít nhất một thể loại sách.",
      );
      return;
    }

    try {
      const updatedUser = {
        username,
        password: currentUser.password,
        fullName: formData.get("fullName").trim(),
        phone: formData.get("phone").trim(),
        birthDate: formData.get("birthDate"),
        address: formData.get("address").trim(),
        favoriteGenres,
      };
      const duplicate = users.some(
        (user) =>
          user.username.toLowerCase() !== currentUser.username.toLowerCase() &&
          user.username.toLowerCase() === username.toLowerCase(),
      );
      if (duplicate) {
        showFieldError(form, "username", "Tên người dùng này đã được đăng ký.");
        return;
      }

      const updatedUsers = users.map((user) =>
        user.username.toLowerCase() === currentUser.username.toLowerCase()
          ? updatedUser
          : user,
      );
      localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
      localStorage.setItem(CURRENT_USER_KEY, updatedUser.username);
      showMessage(message, "Thông tin hồ sơ đã được lưu.", false);
      window.setTimeout(() => window.location.reload(), 700);
    } catch (error) {
      console.error("Không thể lưu hồ sơ BOOKLY:", error);
      showMessage(
        message,
        "Không thể lưu hồ sơ. Vui lòng kiểm tra bộ nhớ trình duyệt và thử lại.",
      );
    }
  });
};

try {
  initializeNavigation();
  renderAuthNavigation();
} catch (error) {
  console.error("Không thể tải thông tin tài khoản BOOKLY:", error);
  document.querySelectorAll("[data-auth-nav]").forEach((nav) => {
    nav.textContent = "Không thể tải tài khoản";
    nav.setAttribute("role", "status");
  });
}

initializeLoginPage();
initializeProfilePage();
