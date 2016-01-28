
var window_focus;

$(window).focus(function() {
  window_focus = true;
}).blur(function() {
  window_focus = false;
});

// Credit : http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
  if (Notification.permission !== "granted")
    Notification.requestPermission();
});

function notifyMe(message) {
  if (!Notification) {
    console.log('Desktop notifications not available in your browser. Try Chromium.'); 
    return;
  }

  if (Notification.permission !== "granted")
    Notification.requestPermission();
  else if(!window_focus){
    var notification = new Notification(message.sender,message);

    var url = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
    

    notification.onclick = function () {
      window.open(url+'/#/chat/'+message.chat_id);      
    };

  }

}
