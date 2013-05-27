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

  /* Publish ToDo Lists owned by current user */
  Meteor.publish('todoLists', function() {
    return TodoLists.find({});
  });

  /* Publish ToDo Items for list selected by user */
  Meteor.publish('todoItems', function(options) {
    console.log(options);
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
    }
  });
});