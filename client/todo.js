/* Grab user relative data from server */
Deps.autorun(function() {
  Meteor.subscribe('todoLists');
  if(Session.get('selectedList')) {
    Meteor.subscribe('todoItems', {listId: Session.get('selectedList')._id });
  }
});

/****************
*** TODO PAGE ***
****************/

/* Returns which view to show (todo lists or todo items) */
Template.todo_page.show_items_view = function() {
  return Session.get('selectedList');
};

/****************
*** TODO LIST ***
****************/

/* Returns all todo lists for current user */
Template.todo_lists_view.todoLists = function() {
  return TodoLists.find({}).fetch();
};

/* Todo list event handlers */
Template.todo_lists_view.events({
  // Create new default list
  'click #new-list': function(e) {

    // Create new todo list
    Meteor.call('newList', function(err, data) {
      if(err) Session.set('alert', {className: 'alert-error', msg: err});
      else Session.set('selectedList', {_id: data});
    });
  },

  // Set Session with current list selected
  'click .todo-list': function() {
    Session.set('selectedList', this);
  },

  // Delete todo list
  'click .todo-list-delete': function(e) {
    e.preventDefault();
    e.stopPropagation();
    Meteor.call('deleteTodoList', this);
  }
});

/*****************
*** TODO ITEMS ***
*****************/

/* Todo item event handlers */
Template.todo_items_view.events({
  'click #back': function() {
    Session.set('selectedList', '');
  },

  // Add new todo item to list
  'keypress input[name="newItem"]': function(e) {
    if(e.which === 13 && Session.get('selectedList')) {

      // Create new todo item server side
      Meteor.call('newItem', Session.get('selectedList')._id, Session.get('enableTweets'), $(e.target).val(), function(err) {
        if(err) Session.set('alert', {className: 'alert-error', msg: err});
        $(e.target).val('');
      });
    }
  },

  // Enable inline-title editing
  'click .title-edit': function(e) {
    Session.set('editTitle', true);
  },

  // Complete title editing
  'keypress input[name="title"]': function(e) {
    if(e.which === 13) {
      // Update session variables
      Session.set('editTitle', '');
      var list = Session.get('selectedList');
      list['title'] = $(e.target).val();
      Session.set('selectedList', list);

      // Update title
      TodoLists.update({_id: Session.get('selectedList')._id}, {$set: {title: $(e.target).val()}});
    }
  },

  // Toggle post to Twitter upon completion checkbox
  'click .twitter-checkbox i': function(e) {
    // Determine whether user wants to enable tweets
    var enableTweets = $(e.target).hasClass('icon-check-empty') ? true : false;
    $(e.target).toggleClass('icon-check-empty');
    $(e.target).toggleClass('icon-check-sign');

    Session.set('enableTweets', enableTweets);
  }
});

/* Return title of current todo list */
Template.todo_items_view.title = function() {
  return Session.get('selectedList').title || 'No Title';
};

/* Return array of todo items for this todo list */
Template.todo_items_view.todoItems = function() {
  return TodoItems.find().fetch();
};

/* Evaluate title editing mode */
Template.todo_items_view.enable_title_edit = function() {
  return Session.get('editTitle');
};

Template.todo_items_view.twitter_checkbox_class = function() {
  return Session.get('enableTweets') ? 'icon-check-sign' : 'icon-check-empty';
};

/****************
*** TODO ITEM ***
****************/

/* Todo item event handlers */
Template.todo_item_view.events({

  // Mark item complete/incomplete
  'click .todo-checkbox': function(e) {
    // Determine whether list item is changing to/from complete
    var isComplete = $(e.target).hasClass('icon-check-empty') ? true : false;

    // Update todo-list item
    TodoItems.update({_id: this._id}, {$set: {isComplete: isComplete}});

    // Tweet completion of task
    if(isComplete && this.isTweetEnabled && !this.isTweetSent)
      Meteor.call('tweetTodo', this, function(err) {
        if(err)
          Session.set('alert', {className: 'alert-error', msg: err.reason});
        else
          Session.set('alert', {className: 'alert-info', msg: 'Tweeted Completion of Task'});
      });
  },

  // Delete item
  'click .todo-item-delete': function(e) {
    Meteor.call('deleteTodoItem', this);
  },

  // Enable inline-editing for todo item
  'dblclick .desc': function(e) {
    Session.set('editTodoItem', this);
  },

  // Complete editing of todo item
  'keypress input[name="desc"]': function(e) {
    if(e.which === 13) {
      Session.set('editTodoItem', '');

      // Update database
      TodoItems.update({_id: this._id}, {$set: {desc: $(e.target).val()}});
    }
  }
});

/* Render unchecked/checked checkbox depending on completion status */
Template.todo_item_view.checkbox_class = function() {
  return this.isComplete ? 'icon-check-sign' : 'icon-check-empty';
};

/* Render strikethrough text depending on completion status */
Template.todo_item_view.desc_class = function() {
  return this.isComplete ? 'strikethrough' : '';
};

/* Evaluate whether current todo item needs inline-editing */
Template.todo_item_view.enable_item_edit = function() {
  return this._id === (Session.get('editTodoItem') && Session.get('editTodoItem')._id);
};
