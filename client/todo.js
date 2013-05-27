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
    console.log('clicked');

    // Create new todo list
    Meteor.call('newList', function(err, data) {
      if(err) console.log('err - ', err);
      else Session.set('selectedList', data);
    });
  },

  // Set Session with current list selected
  'click .todo-list': function() {
    Session.set('selectedList', this);
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
      Meteor.call('newItem', Session.get('selectedList')._id, $(e.target).val(), function(err, data) {
        if(err) console.log('err - ', err);
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
