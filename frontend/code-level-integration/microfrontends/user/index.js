$('#user').append(`
  <a class="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
    <svg id="user-i-signin" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
      <path d="M3 16 L23 16 M15 8 L23 16 15 24 M21 4 L29 4 29 28 21 28" />
    </svg>
  
    <svg id="user-i-user" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="currentcolor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      <path d="M22 11 C22 16 19 20 16 20 13 20 10 16 10 11 10 6 12 3 16 3 20 3 22 6 22 11 Z M4 30 L28 30 C28 21 22 20 16 20 10 20 4 21 4 30 Z" />
    </svg>
  </a>
    
  <div class="dropdown-menu dropdown-menu-right">
    <span id="user-login" class="dropdown-item" data-toggle="modal" data-target="#user-login-modal">Login</span>
    <span id="user-register" class="dropdown-item" data-toggle="modal" data-target="#user-register-modal">Register</span>
    <span id="user-howdy" class="dropdown-item-text"></span>
    <div  id="user-logout-divider" class="dropdown-divider"></div>
    <span id="user-logout" class="dropdown-item" onclick="return user_logout(event)">Logout</span>
  </div>
    
  <div class="modal fade" id="user-login-modal" tabIndex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <form id="user-login-form" onsubmit="return user_login(event)">
            <div id="login-failure-message" class="d-none"><div class="alert alert-danger">Invalid login credentials.</div></div>

            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" name="username" id="user-login-modal-username" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" name="password" id="user-login-modal-password" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal" id="user-login-modal-close">Close</button>
          <button type="submit" form="user-login-form" class="btn btn-primary">Login</button>
        </div>
      </div>
    </div>
  </div>
    
  <div class="modal fade" id="user-register-modal" tabIndex="-1" role="dialog">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-body">
          <form id="user-register-form" onsubmit="return user_register(event)">
            <div id="user-register-failure-message" class="d-none"><div class="alert alert-danger">Registration failed, try again.</div></div>

            <div class="form-group">
              <label>Username</label>
              <input type="text" class="form-control" name="username" id="user-register-modal-username" />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-control" name="password" id="user-register-modal-password" />
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal" id="user-register-modal-close">Close</button>
          <button type="submit" form="user-register-form" class="btn btn-primary">Register</button>
        </div>
      </div>
    </div>
  </div>
`);

$.ajaxSetup({
  contentType: 'application/json; charset=utf-8',
  xhrFields: {
    withCredentials: true,
  },
});

function user_getUsername(id, callback) {
  $.ajax({
    url: `http://localhost:8080/customers/${id}`,
    type: 'GET',
    success: (data) => {
      const json = JSON.parse(data);
      if (json.status_code !== 500) {
        callback(json.username);
      } else {
        console.error(
          `Could not get user information: ${id}, due to:  ${json.status_text} | ${json.error}`
        );
        return callback(undefined);
      }
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.error(
        `Could not get user information: ${id}, due to: ${textStatus} | ${errorThrown}`
      );
    },
  });
}

function user_prepareNavbarForUnauthenticatedUser() {
  $('#user-i-signin').show();
  $('#user-login').show();
  $('#user-register').show();

  $('#user-i-user').hide();
  $('#user-howdy').hide();
  $('#user-logout-divider').hide();
  $('#user-logout').hide();
}

function user_prepareNavbarForAuthenticatedUser(username) {
  $('#user-i-signin').hide();
  $('#user-login').hide();
  $('#user-register').hide();

  $('#user-i-user').show();
  $('#user-howdy').text(`Logged in as: ${username}`).show();
  $('#user-logout-divider').show();
  $('#user-logout').show();
}

function user_initializeNavbar() {
  const userId = Cookies.get('logged_in');

  if (userId) {
    user_getUsername(userId, function (username) {
      if (typeof username !== 'undefined') {
        user_prepareNavbarForAuthenticatedUser(username);
      } else {
        user_prepareNavbarForUnauthenticatedUser();
      }
    });
  } else {
    user_prepareNavbarForUnauthenticatedUser();
  }
}

user_initializeNavbar();

function user_login(event) {
  event.preventDefault();

  const username = $('#user-login-modal-username').val();
  const password = $('#user-login-modal-password').val();

  $.ajax({
    url: 'http://localhost:8080/login',
    type: 'GET',
    async: false,
    success: () => {
      user_initializeNavbar();
      $('#user-login-modal-close').click();
      $('#carts').trigger('carts:initialize-cart');
    },
    error: () => {
      $('#user-login-failure-message').removeClass('d-none');
    },
    beforeSend: (xhr) => {
      xhr.setRequestHeader(
        'Authorization',
        `Basic ${btoa(username + ':' + password)}`
      );
    },
  });
  return false;
}

function user_logout() {
  Cookies.remove('logged_in');
  user_initializeNavbar();
  $('#carts').trigger('carts:reset-cart');
}

function user_register(event) {
  event.preventDefault();

  $.ajax({
    url: 'http://localhost:8080/register',
    type: 'POST',
    async: false,
    data: JSON.stringify({
      username: $('#user-register-modal-username').val(),
      password: $('#user-register-modal-password').val(),
    }),
    success: () => {
      user_initializeNavbar();
      $('#user-register-modal-close').click();
    },
    error: () => {
      $('#user-register-failure-message').removeClass('d-none');
    },
  });
  return false;
}
