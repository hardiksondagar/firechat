# FireChat

This project is generated with [yo angularfire generator](https://github.com/yeoman/generator-angular)
version 1.0.0.


## Build & development

Run `grunt` for building and `grunt serve` for preview.


## Testing

Running `grunt test` will run the unit tests with karma.


## Data Structure
### users
**This table stores user's profile information and settings.**
* first_name
  * _type_ **string**
* last_name
  * _type_ **string**
* username
  * _type_ **string**
  * this field not needed, will be removed in next release
* email
  * _type_ **string**
  * same as auth.email  
* EnterToSend
  * _type_ **boolean**
  * enter to send message setting

### user-chats
**This table stores user's chat lists.**
* modifiedAt
  * _type_ **timestamp**
  * last modification time equal to `Firebase.ServerValue.TIMESTAMP`.
  * modifiedAt will update on every message sent.
* lastMessage
  * _type_ **Object**
  * `{ text:"LAST_MESSAGE_TEXT", type:"LAST_MESSAGE_TYPE }`
  * last message of chat to show in chat list.

### chat-messages
**This table stores chat's messages.**
* createdAt
  * _type_ **timestamp**
  * equal to `Firebase.ServerValue.TIMESTAMP`.
* text
  * _type_ **string**
* uid
  * _type_ **str*ing*
  * `auth.uid` of sender
* file
  * _type_ **Object**
  * this node stores file
    * name - file name
    * payload - file data in base64
    * size - file size in bytes
    * type - file mimetype



## Security & Rules
### users
```
// Anyone can read users
".read": "auth != null",
"$user": {
   // User can write and update only his own data
   ".write": "auth.uid === $user && (!newData.exists() || newData.hasChildren())",
   
   // Field validation
   "first_name": {
      ".validate": "newData.isString() && newData.val().length <= 200"
   },
   "last_name": {
      ".validate": "newData.isString() && newData.val().length <= 200"
   },
   "username": {
      ".validate": "newData.isString() && newData.val().length <= 200"
   },
   "email": {
      ".validate": "newData.isString() && newData.val().length <= 320"
    },
   // EnterToSend should be boolean
   "EnterToSend":{
      ".validate": "newData.val() == true || newData.val() == false"
    },
   // Invalid other fields
   "$other": {
      ".validate": false
    }
 }
```

### How unique chat_id is generating for one to one chat?
To make sure user1 and user2 should be part of only one chat, chat_id is generating by combination of both user's `uid`
```
function(user1,user2) {
    if( user1.uid > user2.uid ) {
      return 'chat-' + user1.uid + user2.uid;
    } else {
      return 'chat-' + user2.uid + user1.uid;
    }
}
```
So any chat's `$id` contains both the participant user's `uid`.


### user-chats
```
"$userId": {
  // I can only read only my chats
  ".read": "auth != null && auth.uid == $userId ",
     "$chatId": {
        // I can write to chat I'm part of
        ".write": "auth != null && $chatId.contains($userId)"
      },
     // Index on modified time to fetch chats order by latest to oldest
     ".indexOn": ["modifiedAt"]
 }
```

### chat-messages
```
"$chatId": {
    // I can read messages to chat I'm part of
    ".read": "auth != null && $chatId.contains(auth.uid)",
    // I can write messages to chat I'm part of
    ".write": "auth != null && $chatId.contains(auth.uid)",
    ".indexOn": ["createdAt"],
    "$messageId": {
       "text": {
         ".validate": "newData.isString() && newData.val().length <= 4000"
       },
       "uid": {
         ".validate": "newData.isString() && newData.val() == auth.uid"
       },
       "createdAt": {
         ".validate": "newData.isNumber()"
       },
       "file":{
         // File should have name, payload and size field and file size should be less than 10 MB
         ".validate": "newData.hasChildren(['name', 'payload', 'size']) && newData.child('name').isString() &&  newData.child('size').isNumber() && newData.child('size').val() < 10485760"
       }
    }
}
```
