
var window_focus;

$(window).focus(function () {
    window_focus = true;
}).blur(function () {
    window_focus = false;
});

// Credit : http://stackoverflow.com/questions/2271156/chrome-desktop-notification-example
// request permission on page load
document.addEventListener('DOMContentLoaded', function () {
    if (Notification.permission !== "granted")
        Notification.requestPermission();
});

function SaveDataToLocalStorage(data)
{
    var a = [];
    // Parse the serialized data back into an aray of objects
    a = JSON.parse(localStorage.getItem('tipntrip-notifications'));
    if (!a) {
        a = [];
    } else if (a.indexOf(data) > -1) {
        console.log('already notified for unread message');
        return false;
    }

    console.log(a);
    // Push the new data (whether it be an object or anything else) onto the array
    a.push(data);
    // Re-serialize the array back into a string and store it in localStorage
    localStorage.setItem('tipntrip-notifications', JSON.stringify(a));
    return true;
}

function notifyMe(message) {
    if (!Notification) {
        console.log('Desktop notifications not available in your browser. Try Chromium.');
        return;
    }

    if (Notification.permission !== "granted")
        Notification.requestPermission();
    else if (!window_focus)
    {
        if (!SaveDataToLocalStorage(message.id)) {
            return;
        }
        var notification = new Notification(message.sender, message);

        var url = location.protocol + '//' + location.hostname + (location.port ? ':' + location.port : '');


        notification.onclick = function () {
            window.open(url + '/#/chat/' + message.chat_id);
        };

    }

}