ToDo-Meteor
===========

ToDo List built with Meteor with Twitter Integration.  Upon completion of a task, a tweet will be posted on user's behalf if specified.

##Installation

Install meteorite

``` sh
$ sudo -H npm install -g meteorite
```

Clone from github

``` sh
$ git clone https://github.com/marklee22/todo-meteor.git
$ cd ToDo-Meteor
```

Run meteor

``` sh
$ mrt
```
    
Browse to localhost:3000

##Configuration
1. Create Twitter API Application [here](https://dev.twitter.com/).
2. Insert account credentials into database
``` sh
$ meteor mongo
MongoDB shell version: 2.4.3
connecting to: 127.0.0.1:3002/meteor
> db.meteor_accounts_loginServiceConfiguration.insert({
    "service" : "twitter",
    "consumerKey" : "YOUR_CONSUMER_KEY",
    "secret" : "YOUR_CONSUMER_SECRET"
})
```

##Features
1. Dblclick inline-form editing for todo items
1. Twitter OAuth integration (Login with Twitter)
1. Persistent todo lists and items
