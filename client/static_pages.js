/* Page Routes */
Meteor.Router.add({
  '/': function() {
    if(Meteor.user()) return 'todo_page';
    else return 'login_page';
  }
});

/* Filters to run before rendering a page */
Meteor.Router.filters({
  // Verify user is logged in or redirect to login page
  'checkLoggedIn': function(page) {
    if(Meteor.loggingIn()) return 'loading_page';
    else if(Meteor.user()) return page;
    else return 'login_page';
  }
});

/* Determines whether to show the header in the app */
Template.header_view.logged_in = function() {
  return Meteor.user();
};

Template.login_page.events({
  'click #login-twitter': function() {
    Meteor.loginWithTwitter();
  }
});

Template.alert_view.is_alert = function() {
  return Session.get('alert');
};

Template.alert_view.alert_class = function() {
  if(Session.get('alert'))
    return Session.get('alert').className;
};

Template.alert_view.alert_msg = function() {
  if(Session.get('alert'))
    return Session.get('alert').msg;
};

Template.alert_view.events({
  'click button': function() {
    Session.set('alert', '');
  }
});
