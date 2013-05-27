Meteor.startup(function() {

  /* Deny client inserts/deletes to collections */
  TodoLists.deny({
    insert: function() { return true; },
    remove: function() { return true; }
  });

  TodoItems.deny({
    insert: function() { return true; },
    remove: function() { return true; }
  });

  /* Allow client updates to collections if user owns list/item */
  TodoLists.allow({
    update: function(item) { return item.userId === this.userId ? true : false; }
  });

  TodoItems.allow({
    update: function(item) { return item.userId === this.userId ? true : false; }
  });

  /* Publish ToDo Lists owned by current user */
  Meteor.publish('todoLists', function() {
    return TodoLists.find({});
  });

  /* Publish ToDo Items for list selected by user */
  Meteor.publish('todoItems', function(options) {
    return TodoItems.find({listId: options.listId});
  });

  /* Server-side methods */
  Meteor.methods({
    newList: function() {
      console.log('INFO: Creating new list for user: ', this.userId);
      var obj = {
        userId: this.userId,
        title: 'New List'
      };

      // Insert new list into db and return objectId
      var results = TodoLists.insert(obj);
      console.log(results);
      return results;
    },

    newItem: function(listId, desc) {
      console.log('INFO: Creating new item for list: ', listId);

      // Verify user owns list

      // Create object to insert
      var obj = {
        userId: this.userId,
        listId: listId,
        desc: desc,
        isComplete: false
      };

      // Insert new item to database
      return TodoItems.insert(obj);
    },

    updateTodoList: function(todoListObj) {
      console.log('INFO: Updating todolist: ' + todoListObj._id);
      console.log(todoListObj);
      // Validate user owns list

      // Update list object
      TodoLists.update({_id: todoListObj._id}, todoListObj);
    }
  });
});
