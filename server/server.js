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
    return TodoLists.find({userId: this.userId});
  });

  /* Publish ToDo Items for list selected by user */
  Meteor.publish('todoItems', function(options) {
    return TodoItems.find({listId: options.listId});
  });

  /* Server-side methods */
  Meteor.methods({

    // Create new empty todo list
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

    // Create new todo item
    newItem: function(listId, enableTweets, desc) {
      console.log('INFO: Creating new item for list: ', listId);

      // TODO: Verify user owns list

      // Create object to insert
      var obj = {
        userId: this.userId,
        listId: listId,
        desc: desc,
        isComplete: false,
        isTweetSent: false,
        isTweetEnabled: enableTweets || false
      };

      // Insert new item to database
      return TodoItems.insert(obj);
    },

    // Update todo list (should probably move this client side instead)
    updateTodoList: function(todoListObj) {
      console.log('INFO: Updating todolist: ' + todoListObj._id);

      // TODO: Validate user owns list

      // Update list object
      TodoLists.update({_id: todoListObj._id}, todoListObj);
    },

    // Delete todo item
    deleteTodoItem: function(todoObj) {
      console.log('INFO: Deleting todoItem: ' + todoObj._id);

      // Validate user is owner of list
      if(this.userId === todoObj.userId) {
        TodoItems.remove({_id: todoObj._id});
      }
    },

    // Delete todo list
    deleteTodoList: function(todoListObj) {
      console.log('INFO: Deleting todoList: ' + todoListObj._id);

      // Validate user is owner of list
      if(this.userId === todoListObj.userId) {
        TodoLists.remove({_id: todoListObj._id});
      }
    },

    // Post todo item completion to Twitter using OAuth
    tweetTodo: function(todoItemObj) {
      console.log('INFO: Tweeting Todo Item: ' + todoItemObj._id);

      var parameters = {},
          twitterURL = 'https://api.twitter.com/1/statuses/update.json';

      // Pull Oauth parameters from database
      var auth = Accounts.loginServiceConfiguration.findOne({service: 'twitter'}, {fields: {consumerKey: 1, secret: 1}});
      var user = Meteor.users.findOne({_id: this.userId}, {fields: {'services.twitter': 1}});

      // Create tweet text
      parameters.status = user.services.twitter.screenName + " just completed task: '" + todoItemObj.desc + "'";

      // Assign correct OAUTH parameter names for REST call
      parameters.oauth_consumer_key = auth.consumerKey;
      parameters.oauth_consumer_secret = auth.secret;
      parameters.oauth_token = user.services.twitter.accessToken;
      parameters.oauth_signature_method = 'HMAC-SHA1';

      // Create OAUTH1 headers to make request to Twitter API
      var oauthBinding = new OAuth1Binding(auth.consumerKey, auth.secret, twitterURL);
      oauthBinding.accessTokenSecret = user.services.twitter.accessTokenSecret;
      var headers = oauthBinding._buildHeader();

      // Catch errors from OAuth call
      try {
        oauthBinding._call('POST', twitterURL, headers, parameters);
      } catch(e) {
        console.log('ERROR: Tweet Error - ', e);
        throw new Meteor.Error(401, 'Could not Tweet Todo Item', e);
      }

      // Update isTweetSent status to true
      TodoItems.update({_id: todoItemObj._id}, {$set: {isTweetSent: true}});

      return;
    }
  });
});
