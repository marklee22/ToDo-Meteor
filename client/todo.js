Deps.autorun(function() {
  Meteor.subscribe('todoLists');
  Meteor.subscribe('todoItems', {listId: Session.get('selectedList')._id });
});

/* Returns list selected by User or undefined */
Template.todo_page.list_selected = function() {
  return Session.get('selectedList');
};

/* Returns all todo lists for current user */
Template.todo_lists_view.todoLists = function() {
  return TodoLists.find({}).fetch();
  // return [];
};

Template.todo_lists_view.events({
  'click #new-list': function(e) {
    console.log('clicked');

    // Create new todo list
    Meteor.call('newList', function(err, data) {
      if(err) console.log('err - ', err);
      else Session.set('selectedList', data);
    });
  },

  'click li': function() {
    Session.set('selectedList', this);
  }
});

/****************
*** TODO ITEM ***
****************/

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
      });
    }
  }
});

Template.todo_items_view.id = function() {
  return Session.get('selectedList')._id;
};
