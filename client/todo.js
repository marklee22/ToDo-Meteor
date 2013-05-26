/* Grab user relative data from server */
Deps.autorun(function() {
  Meteor.subscribe('todoLists');
  if(Session.get('selectedList'))
    Meteor.subscribe('todoItems', {listId: Session.get('selectedList')._id });
});

/****************
*** TODO PAGE ***
****************/

/* Returns list selected by User or undefined */
Template.todo_page.list_selected = function() {
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
  'click #new-list': function(e) {
    console.log('clicked');

    // Create new todo list
    Meteor.call('newList', function(err, data) {
      if(err) console.log('err - ', err);
      else Session.set('selectedList', data);
    });
  },

  'click .todo-list': function() {
    Session.set('selectedList', this);
  }
});

/****************
*** TODO ITEM ***
****************/

/* Todo item event handlers */
Template.todo_items_view.events({
  'click #back': function() {
    Session.set('selectedList', '');
  },

  'click #add-item': function() {
    console.log('add item');

    // Create new todo item for list
    if(Session.get('selectedList')) {
      Meteor.call('newItem', Session.get('selectedList')._id, function(err, data) {
        if(err) console.log('err - ', err);
        console.log(data);
      });
    }
  },

  'keypress input[name="desc"]': function(e) {
    if(e.which === 13 && Session.get('selectedList')) {
      Meteor.call('newItem', Session.get('selectedList')._id, $(e.target).val(), function(err, data) {
        if(err) console.log('err - ', err);
        $(e.target).val('');
      });
    }
  }
});

Template.todo_items_view.id = function() {
  return Session.get('selectedList')._id;
};

Template.todo_items_view.title = function() {
  return Session.get('selectedList').title || 'No Title';
};

Template.todo_items_view.todoItems = function() {
  return TodoItems.find().fetch();
};
