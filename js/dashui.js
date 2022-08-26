class DashUI {
  constructor (header, sidenav, notification = {}, cart = {}, options = {}) {
    this.conf = {
      header: "cwos-header",
      user: "cwos-user",
      notification: "cwos-notification",
      notificationXtra: "cwos-notification-xtra",
      cart: "cwos-cart",
      cartXtra: "cwos-cart-xtra",
      sidebar: "cwos-sidebar",
      vwsection: "cwos-content",
      vwFader: "cwos-view-fader",
      sidebarBtn: "cwos-sidebar-toggle",
      navbarBtn: "cwos-navbar-toggle",
      mobMaxWidth: 960,
      sidebarWidth: 260,
      headerHeight: 70,
      animMin: 160,
      animMax: 260,
      maxCartItem: 3,
      maxNoticeItem: 4,
      stateProgress: 4
    }
    this.confVal = {
      header: "string",
      user: "string",
      notification: "string",
      notificationXtra: "string",
      cart: "string",
      cartXtra: "string",
      sidebar: "string",
      vwsection: "string",
      vwFader: "string",
      sidebarBtn: "string",
      navbarBtn: "string",
      mobMaxWidth: "number",
      sidebarWidth: "number",
      headerHeight: "number",
      animMin: "number",
      animMax: "number",
      maxCartItem: "number",
      maxNoticeItem: "number"
    }
    this.ready = [];
    this.header = {
      title: document.title,
      path: location.href,
      logo: null
    }
    this.notification = {
      delete: "#", // /path/to/delete/notification
      path: "#", // /path/to/notification/page,
      get: "#", // /path/to/load/notifications,
      records: 0, 
      unread: 0,
      page: 1, 
      pages: 0,
      nextPage: false,
      previousPage: false,
      limit: 4,
      list:[],
      error: false,
      full: false
    }
    this.user = {
      avatar: "",
      title: "Welcome",
      description: "You are not logged in.",
      links: []
    }
    this.cart = {
      delete: null, // /link/to/delete/cata-item
      path: null, // /link/to/checkout
      get: null, // /link/to/load/cart-items
      currency: 'USD', // cart currency
      subtotal: 0.00,
      subtotalText: 0.00,
      page: 1,
      pages: 0,
      limit: 4,
      nextPage: false,
      previousPage: false,
      list: [],
      error: false,
      full: false
    }
    this.spotlight = {}
    this.sidenav = []
    this.state = 0;

    // initialize
    this.prepHeader(header);
    this.prepSidebar(sidenav);
    this.prepNotification(notification);
    this.prepCart(cart);
    if (objectLength(options) > 0) {
      this.setConf(options);
    }
  }
  isMobVw () {
    return $(window).width() <= this.conf.mobMaxWidth;
  }
  vwHeight () {
    return $(window).height() - this.conf.headerHeight;
  }
  vwWidth () {
    return !this.showSidebar() ? $(window).width() : ($(window).width() - this.conf.sidebarWidth);
  }
  showSidebar () {
    if (!this.ready.includes("sidebar")) return false;
    let ck = Cookies.get('cwossidebar');
    return (ck == 'on' || ck == undefined) && !this.isMobVw();
  }
  setConf (options) {
    if (typeof options == "object" && objectLength(options) > 0) {
      let conf = this.conf;
      let confVal = this.confVal;
      $.each(options, function(key, value){
        if (key in conf && typeof value == confVal[key]) {
          conf[key] = value;
        }
      });
      this.conf = conf;
    }
  }
  prepHeader (header) {
    if (typeof header !== "object") {
      this.getSrc(header, "prepHeader", {data_type: "json"});
    } else {
      if ("title" in header) this.header.title = header.title;
      if ("logo" in header) this.header.logo = header.logo; this.ready.push("header");

      if ("path" in header) this.header.path = header.path;
      if ("user" in header) {
        let user = header.user;
        if (
          ("avatar" in user && user.avatar.length > 0)
          && ("title" in user && user.title.length > 0)
          && ("description" in user && user.description.length > 0)
          && ("links" in user && typeof user.links == "object")
        ) {
          this.ready.push("user");
          this.state ++;
          this.user.avatar = user.avatar;
          this.user.title = user.title;
          this.user.description = user.description;
          let links = [];
          $.each(user.links, function(_index, link){
            if ("title" in link && "path" in link && "onclick" in link) {
              links.push(link);
            }
          });
          this.user.links = links;
        }
      }
    }
  }
  prepCart (cart) {
    if (typeof cart == "object") {
      if ("delete" in cart && "path" in cart && "get" in cart) {
        this.cart.get = cart.get;
        this.cart.delete = cart.delete;
        this.cart.path = cart.path;
        let ths = this;
        if ("pages" in cart) ths.cart.pages = cart.pages;
        if ("page" in cart) ths.cart.page = cart.page;
        if ("nextPage" in cart) ths.cart.nextPage = cart.nextPage;
        if ("previousPage" in cart) ths.cart.previousPage = cart.previousPage;
        if ("records" in cart) ths.cart.records = cart.records;
        if ("subtotal" in cart) ths.cart.subtotal = cart.subtotal;
        if ("currency" in cart) ths.cart.currency = cart.currency;
        // fetch data
        if ("list" in cart) {
          // process list
          ths.pushCartList(cart.list);
        } else {
          // fetch list
          let getParam = param && typeof param == "object" ? param : {};
          getParam.limit = this.conf.maxCartItem;
          $.ajax({
            url:  cart.get,
            data: getParam,
            dataType : "json",
            type: "GET",
            async: false,
            success : function(resp) {
              if( resp && (resp.status == '0.0' || resp.errors.length <= 0) && "data" in resp){
                // process data
                if ("pages" in resp) ths.cart.pages = resp.pages;
                if ("page" in resp) ths.cart.page = resp.page;
                if ("nextPage" in resp) ths.cart.nextPage = resp.nextPage;
                if ("previousPage" in resp) ths.cart.previousPage = resp.previousPage;
                if ("records" in resp) ths.cart.records = resp.records;
                if ("subtotal" in resp) ths.cart.subtotal = resp.subtotal;
                if ("subtotalText" in resp) ths.cart.subtotalText = resp.subtotalText;
                if ("currency" in resp) ths.cart.currency = resp.currency;
                if (objectLength(resp.data) > 0) {
                  ths.pushCartList(resp.data);
                }
              } else {
                ths.cart.error = true;
                // console.error(`Invalid response gotten for cart data: ${resp.errors.join(" | ")}`);
              }
            },
            error : function(xhr){
              ths.cart.error = true;
              // console.error(`Failed to load cart recource: (${xhr.status}) ${xhr.statusText}`);
            }
          });
        }
      }
    }
    this.state ++;
  }
  prepNotification (notification) {
    if (typeof notification == "object") {
      if ("delete" in notification && "path" in notification && "get" in notification) {
        this.notification.get = notification.get;
        this.notification.delete = notification.delete;
        this.notification.path = notification.path;
        let ths = this;
        // fetch data
        if ("list" in notification) {
          // process list
          if ("pages" in notification) ths.notification.pages = notification.pages;
          if ("page" in notification) ths.notification.page = notification.page;
          if ("nextPage" in notification) ths.notification.nextPage = notification.nextPage;
          if ("previousPage" in notification) ths.notification.previousPage = notification.previousPage;
          if ("records" in notification) ths.notification.records = notification.records;
          if ("unread" in notification) ths.notification.unread = notification.unread;
          ths.pushNotificationList(notification.list);
        } else {
          // fetch list
          let getParam = param && typeof param == "object" ? param : {};
          getParam.limit = this.conf.maxNoticeItem;
          getParam.unread = true;
          $.ajax({
            url:  notification.get,
            data: getParam,
            dataType : "json",
            type: "GET",
            async: false,
            success : function(resp) {
              if( resp && (resp.status == '0.0' || resp.errors.length <= 0) && "data" in resp){
                // process data
                if ("pages" in resp) ths.notification.pages = resp.pages;
                if ("page" in resp) ths.notification.page = resp.page;
                if ("nextPage" in resp) ths.notification.nextPage = resp.nextPage;
                if ("previousPage" in resp) ths.notification.previousPage = resp.previousPage;
                if ("records" in resp) ths.notification.records = resp.records;
                if ("unread" in resp) ths.notification.unread = resp.unread;
                if (objectLength(resp.data) > 0) {
                  ths.pushNotificationList(resp.data);
                }
              } else {
                ths.notification.error = true;
                // console.error(`Invalid response gotten for notification data: ${resp.errors.join(" | ")}`);
              }
            },
            error : function(xhr){
              ths.notification.error = true;
              // console.error(`Failed to load notification recource: (${xhr.status}) ${xhr.statusText}`);
            }
          });
        }
      }
    }
    this.state ++;
  }
  pushNotificationList (data) {
    let list = [], ths = this;
    if (typeof data == "object") {
      $.each(data, function(_i, lnk) {
        if (lnk.isRead == false) ths.notification.full = true;
        if (
          "id" in lnk
          && "isRead" in lnk
          && "priorityTitle" in lnk
          && "heading" in lnk
          && "path" in lnk
          && "pathAction" in lnk
          && "userName" in lnk
          && "created" in lnk
        ) {
          list .push(lnk);
        }
      });
    }
    this.notification.list = list;
    this.ready.push("notification");
  }
  pushCartList (data) {
    let list = [];
    if (typeof data == "object") {
      $.each(data, function(_i, cart) {
        if (
          "id" in cart
          && "price" in cart
          && "description" in cart
          && "quantity" in cart
          && "created" in cart
        ) {
          list .push(cart);
        }
      });
    }
    if (objectLength(list)) this.cart.full = true;
    this.cart.list = list;
    this.ready.push("cart");
  }
 
  prepSidebar (sidebar) {
    if (typeof sidebar !== "object") {
      this.getSrc(sidebar, "prepSidebar", {data_type: "json"});
    } else {
      if ("spotlight" in sidebar && typeof sidebar.spotlight == "object") {
        let spotlight = sidebar.spotlight;
        if (
          ("title" in spotlight && spotlight.title.length > 0)
          && ("subtitle" in spotlight && spotlight.subtitle.length > 0)
          && ("path" in spotlight && spotlight.path.length > 0)
          && ("cover" in spotlight && spotlight.cover.length > 0)
          && ("avatar" in spotlight && spotlight.avatar.length > 0)
        ) {
          this.spotlight.title = spotlight.title;
          this.spotlight.subtitle = spotlight.subtitle;
          this.spotlight.path = spotlight.path;
          this.spotlight.cover = spotlight.cover;
          this.spotlight.avatar = spotlight.avatar;
          this.ready.push("spotlight");
          if ("links" in spotlight && typeof spotlight.links == "object") {
            let links = [];
            $.each(spotlight.links, function(_i, link){
              if ("title" in link && "path" in link && "onclick" in link) links.push(link);
            });
            this.spotlight.links = links;
          }
        }
      } if ("sidenav" in sidebar && typeof sidebar.sidenav == "object") {
        let sidenav = [];
        $.each(sidebar.sidenav, function(_i, obj){
          let nav = {};
          if ("title" in obj && "name" in obj && ("links" in obj && typeof obj.links == "object")) {
            nav.name = obj.name,
            nav.title = obj.title,
            nav.links = []
            $.each(obj.links, function(_i, lnk){
              if ( "name" in lnk && "title" in lnk && "path" in lnk && "onclick" in lnk && "icon" in lnk && "newtab" in lnk) {
                nav.links.push(lnk);
              }
            });
            sidenav.push(nav);
          }
        });
        this.sidenav = sidenav;
        this.ready.push("sidenav");
      }
      this.state ++;
    }
  }
  getNotification (elem) {
    elem = $(document).find(elem);
    if (elem && elem.length) {
      let wrapper = elem.find("ul.cwos-dropbar-list"),
          unreadCount = elem.find(".cwos-unread-notifications"),
          totalCount = elem.find(".cwos-all-notifications");
      wrapper.removeClass('error empty').addClass("loading");
      let ths = this;
    }
  }
  getCart (elem) {
    elem = $(document).find(elem);
    if (elem && elem.length) {
      let wrapper = elem.find("ul.cwos-dropbar-list"),
          unreadCount = elem.find(".cwos-unread-notifications"),
          totalCount = elem.find(".cwos-all-notifications");
      wrapper.addClass("loading");
    }
  }
  getDom (prop) {
    let dom = null;
    if (prop in this.confVal && prop in this.conf && this.confVal[prop] == "string") {
      dom = $(document).find(`#${this.conf[prop]}`);
      if (!dom.length) dom = false;
    }
    return dom;
  }
  rmCart (id) {
    let elem = $(document).find(`#cwos-cart-li${id}`);
    let ths = this;
    if (id && elem.length && confirm("You are about to delete this cart item.")) {
      let wrapper = elem.parent("ul");
      alert("<p>Please wait</p>", {type:'progress'});
      $.ajax({
        url :  ths.cart.delete,
        data: {id : id},
        dataType : "json",
        type : "GET",
        success : function(resp) {
          if( resp && (resp.status == '0.0' || resp.errors.length <= 0)){
            // process data
            delete ths.cart.list[id];
            elem.fadeOut("slow").remove();
            ths.cart.records --;
            $(document).find(".cwos-cart-item-total").text(ths.cart.records);
            alert(`<h3>Deleted!</h3><p>${resp.message}</p>`,{type:'success'});
            setTimeout(function(){
              removeAlert();
            }, 1200);
          } else {
            alert(`<h3>Delete error</h3> <p>Invalid response gotten for cart data: ${resp.errors.join(" | ")}</p>`, {type:"error"});
          }
        },
        error : function(xhr){
          alert(`<h3>Delete error</h3> <p>Failed to load cart recource: (${xhr.status}) ${xhr.statusText}</p>`, {type:"error"});
        }
      });
    }
  }
  rmNotification (id) {
    let elem = $(document).find(`#cwos-notification-li${id}`);
    let ths = this;
    if (id && elem.length && confirm("You are about to delete this notification, have you read it?")) {
      let wrapper = elem.parent("ul");
      alert("<p>Please wait</p>", {type:'progress'});
      $.ajax({
        url :  ths.notification.delete,
        data: {id : id},
        dataType : "json",
        type : "GET",
        success : function(resp) {
          if( resp && (resp.status == '0.0' || resp.errors.length <= 0)){
            // process data
            delete ths.notification.list[id];
            elem.fadeOut("slow").remove();
            ths.notification.records --;
            $(document).find(".cwos-all-notifications").text(ths.notification.records);
            alert(`<h3>Deleted!</h3><p>${resp.message}</p>`,{type:'success'});
            setTimeout(function(){
              removeAlert();
            }, 1200);
          } else {
            alert(`<h3>Delete error</h3> <p>Invalid response gotten for notification data: ${resp.errors.join(" | ")}</p>`, {type:"error"});
          }
        },
        error : function(xhr){
          alert(`<h3>Delete error</h3> <p>Failed to load notification recource: (${xhr.status}) ${xhr.statusText}</p>`, {type:"error"});
        }
      });
    }
  }
  init () {
    window.intervCnt = 0;
    window.checkState = setInterval(this.doInit.bind(this),100);
  }
  doInit () {
    window.intervCnt ++;
    if (this.state >= this.conf.stateProgress) {
      clearInterval(window.checkState);
      delete window.checkState;
      delete window.intervCnt;
      // proceed
      if (this.ready.includes("spotlight") || this.ready.includes("sidenav")) this.ready.push("sidebar");
      // make array unique
      this.ready = this.ready.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
      $("body").prepend(this.domSidebar());
      $("body").prepend(this.domHeader());
      this.layout();
      this.startServices();
      removeAlert();
    } if (window.intervCnt >= 10 * 10) {
      removeAlert();
      clearInterval(window.checkState);
      delete window.checkState;
      delete window.intervCnt;
    }
  }
  getSrc (path, callback, options = {type : "GET", data_type : "json"}) {
    if (path) {
      const req = new Promise((resolve, reject) => {
        $.ajax({
          url :  path,
          async: false,
          dataType : options.data_type !== undefined ? options.data_type : "json",
          type : (options.type !== undefined && options.type in ["GET","POST"]) ? options.type : "GET",
          success : function(resp) {
            if( resp && (resp.status == '0.0' || resp.errors.length <= 0) && "data" in resp){
              resolve(resp.data);
            } else {
              reject(`Invalid response: ${resp.errors.join(" | ")}`);
            }
          },
          error : function(xhr){
            reject(`Failed to load recource: (${xhr.status}) ${xhr.statusText}`);
          }
        });
      });
      req.then((data) => {
        this[callback](data);
      }).catch((errormsg)=>{
        console.error(errormsg);
      });
    }
  }
  startServices () {
    // click buttons
    let sidebarBtn = this.getDom("sidebarBtn"),
        navbarBtn = this.getDom("navbarBtn");
    $(window).bind("resize", this.layout.bind(this));
    let ths = this;
    sidebarBtn.on("click", "", function(){
      if ($(this).hasClass("active")) { ths.clsSidebar(); } else { ths.opnSidebar(); }
    });
    navbarBtn.on("click", "", function(){
      if ($(this).hasClass("active")) { ths.clsNavbar(); } else { ths.opnNavbar(); }
    });
    $(document).on("click", `#${ths.conf.user}`, function (e) {
      if ($(this).hasClass("active")) {
        ths.clsDropbar(this);
      } else {
        ths.opnDropbar(this);
      }
    });
    $(document).on("click", `#${ths.conf.notification}`, function (e) {
      if ($(this).hasClass("active")) {
        ths.clsDropbar(this);
      } else {
        ths.opnDropbar(this, true, function(){
          // ths.getNotification(`#${ths.conf.notification}`);
          // console.log("Ready: notification");
        });
      }
    });
    $(document).on("click", `#${ths.conf.notificationXtra}`, function (e) {
      if ($(this).hasClass("active")) {
        ths.clsDropbar(this);
      } else {
        ths.clsDropbar(`#${ths.conf.cartXtra}`);
        ths.opnDropbar(this, false, function(){
          // console.log("Ready: notification-xtra");
          // ths.getNotification(`#${ths.conf.notificationXtra}`);
        });
      }
    });
    $(document).on("click", `#${ths.conf.cart}`, function (e) {
      if ($(this).hasClass("active")) {
        ths.clsDropbar(this);
      } else {
        ths.opnDropbar(this, true, function(){
          // ths.getCart(`#${ths.conf.cart}`);
          // console.log("Ready: cart");
        });
      }
    });
    $(document).on("click", `#${ths.conf.cartXtra}`, function (e) {
      if ($(this).hasClass("active")) {
        ths.clsDropbar(this);
      } else {
        ths.clsDropbar(`#${ths.conf.notificationXtra}`);
        ths.opnDropbar(this, false, function(){
          // ths.getCart(`#${ths.conf.cartXtra}`);
          // console.log("Ready: cart-xtra");
        });
      }
    });
    $(document).find(`#${this.conf.sidebar}, #${this.conf.vwsection}`).on("click", "", function(){
      if ($(document).find(`#${ths.conf.user}.active, #${ths.conf.notification}.active, #${ths.conf.cart}.active`).length) ths.clsDropbar();
    });
    $(document).on("click", `#${ths.conf.user} .cwos-dropbar, #${ths.conf.notificationXtra} .cwos-dropbar, #${ths.conf.cartXtra} .cwos-dropbar, #${ths.conf.notification} .cwos-dropbar, #${ths.conf.cart} .cwos-dropbar`, function (e) {
      e.stopPropagation();
    });
    $(document).find(".cwos-dropbar ul li button").on("click", "", function(e){
      e.stopPropagation();
    });
  }
  domHeader () {
    let html = `<header id="${this.conf.header}">`;
      html += `<div id="aside-toggle">`; // aside toggle
        html += `<button class="cwos-button" id="${this.conf.navbarBtn}"></button>`;
        html += `<button class="cwos-button" id="${this.conf.sidebarBtn}"></button>`;
      html += `</div>`; // aside toggle
      html += `<div id="cwos-prjtitle">`; // project title
        html += `<h1 class="hidden">${this.header.title}</h1>`;
        html += `<div id="cwos-prjicon">`;
          html += `<a href="${this.header.path}"> <img src="${this.header.logo}" alt="${this.header.title}"></a>`;
        html += `</div>`;
      html += `</div>`; // project title
      html += this.domUser();
      html += this.domNotification();
      html += this.domCart();
    html += `</header>`;
    return html;
  }
  domUser () {
    let dom = ``;
    if (this.ready.includes('user')) {
      dom += `<div id="${this.conf.user}" class="theme-color native">`;
        dom += `<div id="cwos-user-title">${this.user.title}</div>`;
        dom += `<div id="cwos-user-avatar">`;
          dom += `<img src="${this.user.avatar}" alt="${this.user.title}">`;
        dom += `</div>`;
        dom += `<div class="cwos-dropbar">`;
          dom += `<div class="cwos-dropbar-description color-bg">`;
            // dom += `<div id="cwos-mobxtra-icon" class="show-phone">`;
              // if (this.ready.includes("notification")){
              //   dom += `<div id="${this.conf.notificationXtra}" onclick="" class="theme-color yellow show-phone">`;
              //     dom += `<div class="cwos-dropbar">`;
              //       dom += `<div class="cwos-dropbar-description color-bg">`;
              //         dom += `<b>Notifications</b> <br> (<span class="cwos-unread-notifications">0</span>/<span class="cwos-all-notifications">0</span>) Unread`;
              //       dom += `</div>`;
              //       dom += `<ul class="cwos-dropbar-list">`;
              //      dom += ` </ul>`;
              //     dom += `</div>`;
              //   dom += `</div>`;
              // } if (this.ready.includes("cart")) {
              //   dom += `<div id="${this.conf.cartXtra}" onclick="" class="theme-color amber show-phone">`;
              //     dom += `<div class="cwos-dropbar">`;
              //       dom += `<div class="cwos-dropbar-description color-bg">`;
              //         dom += `<button onclick="" disabled class="cwos-cart-checkout cwos-button asphalt clear-border push-right margn -m10 -mleft -mbottom no-shadow paddn -p10 -pall"><i class="fas fa-money-bill"></i> Checkout</button>`;
              //         dom += `<h3>My Cart</h3>`; 
              //         dom += `<p>(<span class='cwos-cart-item-total'>0</span>) Items</p>`;
              //         dom += `<h4>Subtotal</h4>`; 
              //         dom += `<code class="cwos-cart-subtotal font-size-1-2" title="">0.00</code>`;
              //       dom += `</div>`;
              //       dom += `<ul class="cwos-dropbar-list">`;
              //       dom+= `</ul>`;
              //     dom += `</div>`;
              //   dom += `</div>`;
              // }
            // dom += `</div>`;
            dom += `<h3>${this.user.description}</h3>`;
          dom += `</div>`;
          dom += `<ul class="cwos-dropbar-list">`;
            $.each(this.user.links, function(_i, lnk){
              dom += `<li>`;
                dom += `<a href="${lnk.path}"`;
                  if (lnk.onclick.length) dom += ` onclick="${lnk.onclick}"`;
                  if (lnk.newtab) dom += " target='_blank'";
                dom+= `>${lnk.title}</a>`;
              dom += `</li>`;
            });
          dom+= `</ul>`;
        dom += `</div>`;
      dom += `</div>`;
    }
    return dom;
  }
  domCart () {
    let dom = ``;
    if (this.ready.includes("cart")) {
      let ulcls = ["cwos-dropbar-list"];
      let ths = this;
      let cls = ["theme-color", "amber", "hide-phone"];
      if (this.cart.full) cls.push("full");
      dom += `<div id="${this.conf.cart}" class="${cls.join(' ')}">`;
        dom += `<div class="cwos-dropbar">`;
          dom += `<div class="cwos-dropbar-description color-bg">`;
            if (this.cart.full) {
              dom += `<button onclick="redirectTo('${this.cart.path}')" class="cwos-cart-checkout cwos-button asphalt clear-border push-right margn -m10 -mleft -mbottom no-shadow paddn -p10 -pall"><i class="fas fa-money-bill"></i> Checkout</button>`;
              dom += `<br>`;
            }
            dom += `<h3>My Cart</h3>`; 
            dom += `<p>(<span class='cwos-cart-item-total'>${this.cart.records}</span>) Items</p>`;
            dom += `<h4>Subtotal (${this.cart.currency})</h4>`; 
            dom += `<code class="cwos-cart-subtotal font-size-1-2 currency-${this.cart.currency.toLocaleLowerCase()}" title="${this.cart.currency}">${this.cart.subtotalText}</code>`;
          dom += `</div>`;
          dom += `<ul`;
          if (this.cart.error) {
            ulcls.push("error");
          } else {
            if (objectLength(this.cart.list) <= 0) ulcls.push("empty");
          }
          dom += ` class="${ulcls.join(' ')}">`;
          if (objectLength(this.cart.list) > 0) {
            $.each(this.cart.list, function(_i, crt){
              dom += `<li id="cwos-cart-li${crt.id}"`;
              $.each(crt, function(key, val){ dom += ` data-${key}="${val}"`; });
              dom += '>';
                dom += `<code class="color-blue currency-${ths.cart.currency.toLocaleLowerCase()}">${'priceText' in crt ? crt.priceText : crt.price}</code>`;
                dom += `<br>`;
                dom += `(${crt.quantity}x) ${crt.description}`;
                dom += `<button onclick="cwos.ui.rmCart(${crt.id})" class="cwos-button red"></button>`;
              dom += '</li>';
            });
          }
          dom += `</ul>`;
        dom += `</div>`;
      dom += `</div>`;
    }
    return dom;
  }
  domNotification () {
    let dom = ``;
    if (this.ready.includes("notification")) {
      let ulcls = ["cwos-dropbar-list"];
      let licls = [];
      let cls = ["theme-color", "yellow", "hide-phone"];
      if (this.notification.full) cls.push("full");
      dom += `<div id="${this.conf.notification}" class="${cls.join(' ')}">`;
        dom += `<div class="cwos-dropbar">`;
          dom += `<div class="cwos-dropbar-description color-bg">`;
            dom += `<b>Notifications</b> <br> (<span class="cwos-unread-notifications">${this.notification.unread}</span>/<span class="cwos-all-notifications">${this.notification.records}</span>) Unread`; 
            dom += `<a class="push-right" href="${this.notification.path}"><i class="fas fa-list"></i> All Notifications</a>`;
          dom += `</div>`;
          dom += `<ul`;
          if (this.notification.error) {
            ulcls.push("error");
          } else {
            if (objectLength(this.notification.list) <= 0) ulcls.push("empty");
          }
          dom += ` class="${ulcls.join(' ')}">`;
          if (objectLength(this.notification.list) > 0) {
            $.each(this.notification.list, function(_i, lnk){
              licls = [lnk.priorityTitle.toLowerCase()];
              if (lnk.isRead == false) licls.push("unread");
              dom += `<li id="cwos-notification-li${lnk.id}" class="${licls.join(' ')}"`;
              $.each(lnk, function(key, val){ dom += ` data-${key}="${val}"`; });
              if (lnk.pathAction == "popup") {
                dom += ` onclick="cwos.faderBox.url('${setGet(lnk.path, {id: lnk.id})}', {}, {exitBtn: true});"`;
              } if (lnk.pathAction == "follow-link") {
                dom += ` onclick="redirectTo('${setGet(lnk.path, {id: lnk.id, rdt: location.href})}');"`;
              }
              dom += '>';
                dom += lnk.heading;
                dom += `<button onclick="cwos.ui.rmNotification(${lnk.id})" class="cwos-button red"></button>`;
              dom += '</li>';
            });
          }
          dom += `</ul>`;
        dom += `</div>`;
      dom += `</div>`;
    }
    return dom;
  }
  domSpotlight () {
    let dom = ``;
    return dom;
  }
  domSidenav () {
    let dom = ``;
    return dom;
  }
  domSidebar () {
    let dom = ``;
    if (this.ready.includes("sidebar")) {
      dom += `<aside id="${this.conf.sidebar}">`;
        dom += this.domSpotlight();
        dom += this.domSidenav();
        dom += `<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere eaque dolor quae eveniet hic fugit necessitatibus, possimus quaerat ducimus illum deleniti, ipsa facilis harum ea quam architecto rem amet labore!</p>`;
        dom += `<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere eaque dolor quae eveniet hic fugit necessitatibus, possimus quaerat ducimus illum deleniti, ipsa facilis harum ea quam architecto rem amet labore!</p>`;
        dom += `<p>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Facere eaque dolor quae eveniet hic fugit necessitatibus, possimus quaerat ducimus illum deleniti, ipsa facilis harum ea quam architecto rem amet labore!</p>`;
      dom += `</aside>`;
    }
    return dom;
  }
  clsDropbar (elem = null) {
    let dropbar = false;
    if (elem) dropbar = $(elem).find(".cwos-dropbar");
    if (!dropbar.length) dropbar = $(document).find(`#${this.conf.user}.active, #${this.conf.notification}.active, #${this.conf.cart}.active`).find(".cwos-dropbar");
    if (dropbar && dropbar.length) {
      dropbar.animate({
        height: 0,
        opacity: 0
      }, this.conf.animMin, () => {
        dropbar.parent("div").removeClass("active");
      });
    }
  }
  opnDropbar (elem, cls = true, callback = null) {
    elem = $(elem);
    let dropbar = elem.find("> .cwos-dropbar");
    if (elem.length && dropbar.length) {
      if (cls) this.clsDropbar();
      let ht = dropbar.find("> .cwos-dropbar-description");
      ht = ht.length ? ht.outerHeight() : 0;
      let ul = dropbar.find("> .cwos-dropbar-list > li");
      if (ul.length) {
        ul.each(function(){
          ht += $(this).outerHeight();
        });
      } else {
        ht += dropbar.find("> .cwos-dropbar-list").outerHeight();
      }
      elem.addClass("active");
      dropbar.animate({
        height: ht,
        opacity:1
      },220, () => {
        if (callback) callback();
      });
    }
  }
  clsNavbar () {
    let sidebar = this.getDom("sidebar"), 
        navbarBtn = this.getDom("navbarBtn"),
        vwFader = this.getDom("vwFader");
    if (navbarBtn.hasClass("active") && sidebar.hasClass("active")) {
      sidebar.animate({left: -this.conf.sidebarWidth, opacity: 0}, this.conf.animMax, function(){
        if (vwFader && vwFader.length) {
          vwFader.animate({width:0, opacity:0}, this.animMin);
          vwFader.remove();
        } 
        $("body").removeClass("no-scroll");
        sidebar.removeClass("active");
        navbarBtn.removeClass("active");
      });
    }
  }
  opnNavbar () {
    let sidebar = this.getDom("sidebar"), 
        navbarBtn = this.getDom("navbarBtn"),
        vwFader;
    let ths = this;
    if (this.isMobVw() && !navbarBtn.hasClass("active")) {
      // create fader
      sidebar.css("height", `${ths.vwHeight()}px`)
      $("body").append(`<div id="${this.conf.vwFader}" style="height: ${this.vwHeight()}px; top: ${this.conf.headerHeight}px"></div>`);
      vwFader = this.getDom("vwFader");
      $("body").addClass("no-scroll");
      vwFader.animate({width: $(window).width(), opacity: 1},this.conf.animMin, function() {
        sidebar.animate({
          left: 0,
          opacity: 1
        }, ths.conf.animMax);
        sidebar.addClass("active");
        navbarBtn.addClass("active");
      });
    }
  }
  clsSidebar () {
    let sidebar = this.getDom("sidebar"), 
        navbarBtn = this.getDom("navbarBtn"),
        sidebarBtn = this.getDom("sidebarBtn"),
        vwsection = this.getDom("vwsection"),
        vwFader = this.getDom("vwFader");
    // set cookie
    // cwossidebar = off
    if (sidebar.hasClass("active") || sidebarBtn.hasClass("active")) {
      Cookies.set('cwossidebar', 'off', {expires : 1, secure: true, sameSite: 'strict'});
      sidebar.animate({
        opacity: 0,
        left: -this.conf.sidebarWidth
      }, this.conf.animMax);
      sidebar.removeClass("active");
      sidebarBtn.removeClass("active");
      let wdt = this.vwWidth();
      vwsection.animate({
        width : wdt
      }, this.conf.animMax, function(){
        if (typeof cwos == "object" && typeof cwos.nav == "object") cwos.nav.affixed(wdt, 1);
      });
    }
  }
  opnSidebar () {
    let sidebar = this.getDom("sidebar"), 
        sidebarBtn = this.getDom("sidebarBtn"),
        vwsection = this.getDom("vwsection");
    // set cookie
    // cwossidebar = on
    sidebar.css("height", `${this.vwHeight()}px`);
    if (!sidebar.hasClass("active") && !this.isMobVw()) {
      Cookies.set('cwossidebar', 'on', {expires : 1, secure: true, sameSite: 'strict'});
      sidebar.animate({
        opacity: 1,
        left: 0
      }, this.conf.animMax);
      sidebar.addClass("active");
      sidebarBtn.addClass("active");
      let wdt = this.vwWidth();
      let lft = this.conf.sidebarWidth;
      vwsection.animate({
        width : wdt
      }, this.conf.animMax, function(){
        if (typeof cwos == "object" && typeof cwos.nav == "object") cwos.nav.affixed(wdt, lft);
      });
    }
  }
  layout () {
    let sidebar = this.getDom("sidebar"), 
        vwsection = this.getDom("vwsection"),
        sidebarBtn = this.getDom("sidebarBtn"),
        navbarBtn = this.getDom("navbarBtn"),
        vwFader = this.getDom("vwFader");
    if (this.showSidebar()) sidebar.css('height', `${this.vwHeight()}px`);
    vwsection.css('height', `${this.vwHeight()}px`);
  
    this.clsDropbar();
    if (!this.isMobVw()) { // its desktop view
      sidebarBtn.css({"z-index": 2, opacity: 1});
      navbarBtn.css({"z-index": 1, opacity: 0});
      this.clsNavbar();
      if(vwFader && vwFader.length) vwFader.remove();
      if (this.showSidebar()) {
        vwsection.css({width: `${this.vwWidth()}px`});
        sidebar.animate({opacity: 1}, 160);
        sidebar.addClass("active");
        sidebarBtn.addClass("active");
      } else {
        sidebar.removeClass("active");
        sidebarBtn.removeClass("active");
        vwsection.css('width', `${this.vwWidth()}px`);
      }
    } else { // its mobile view
      vwsection.css('width', `${this.vwWidth()}px`);
      sidebarBtn.css({"z-index": 1, opacity: 0});
      navbarBtn.css({"z-index": 2, opacity: 1});
      this.clsSidebar();
    } 
    if (typeof cwos == "object" && typeof cwos.nav == "object") cwos.nav.affixed();
  }

}
