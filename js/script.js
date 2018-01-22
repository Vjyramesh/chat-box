var search, searchModule = {
    settings: {
        searchField: $('.search-user-field'),
        serachLength: 3
    },
    init: function (option) {
        search = $.extend(this.settings, option);
        search.searchField.on('keyup ', this.searchValidation);
    },
    searchValidation: function () {
        let searchLength = $(this).val().length >= search.serachLength;
        if (searchLength) {
            searchModule.searchDisplay($(this).val());
        } else {
            searchModule.searchDisplay();
        }
    },
    searchDisplay: function (value = "all") {
        if (value === "all") {
            userList.userColumnDiv.find(messageView.userList).removeClass('d-none');
        } else {
            userList.userColumnDiv.find(messageView.userList).addClass('d-none');
            userList.userColumnDiv.find(messageView.userList).each(function () {
                let name = $.trim($(this).find('.name').text().toLowerCase());
                if (name.search(value) != -1) {
                    $(this).removeClass("d-none");
                }
            });
        }
    }
};

var messageView, messageModule = {
    settings: {
        userList: ".user-list"
    },
    init: function (option) {
        messageView = $.extend(this.settings, option);
        userList.userColumnDiv.on('click', messageView.userList, this.changeUser);
    },
    changeUser: function () {
        userList.userColumnDiv.find(messageView.userList).removeClass('active-user');
        $(this).addClass('active-user');
        userListModule.displayUserMessage(parseInt($(this).attr('data-index')));
    }
};
var sorting, sortingModule = {
    settings: {
        sortingButton: $(".sorting-button"),
        initialStart: 'ascending'
    },
    init: function (option) {
        sorting = $.extend(this.settings, option);
        sorting.sortingButton.on('click', this.sortFunction);
    },
    sortFunction: function () {
        userData.sort(function (x, y) {
            return ((x['user'] === y['user']) ? 0 : ((x['user'] > y['user']) ? 1 : -1));
        });
        if (sorting.initialStart === 'ascending')
            sorting.initialStart = 'descending';
        else {
            sorting.initialStart = 'ascending';
            userData.reverse();
        }
        userListModule.displayUserList(false);
    }
};
/**
 * User Module to get the display the users
 * getValue function to get the user list from the api
 * display function to substitute the value and display it in front end
 */
var userData = "";
var userList, userListModule = {
    settings: {
        userColumnDiv: $('.message-user-column')
    },
    init: function (option) {
        userList = $.extend(this.settings, option);
        this.getValues();
        messageModule.init();
        searchModule.init();
        sortingModule.init();
    },
    getValues: function () {
        $.ajax({
            url: 'data.json',
            type: 'get',
            dataType: 'json',
            statusCode: {
                200: function (data) {
                    let result = data.responseText;
                    result = result.replace(new RegExp('\t', 'g'), ' ');
                    userData = JSON.parse(result);
                    userListModule.displayUserList();
                    userListModule.displayUserMessage();
                },
                400: function () {

                },
                500: function () {

                },
                409: function () {

                }
            }
        });
    },
    displayUserList: function (init = true) {
        let html = "";
        var active = 0;
        $.each(userData, function (index, value) {
            let dateToShow = '';
            if (value['messages'].length) {
                let fullDate = new Date(value['messages'][value['messages'].length - 1].created);
                let current = new Date();
                let dateDiff = Math.abs(current.getTime() - fullDate.getTime())
                dateToShow = Math.ceil(dateDiff / (1000 * 3600 * 24)) + ' days ago';
                if (dateToShow < 1) {
                    dateToShow = Math.ceil(dateDiff / (1000 * 3600)) + ' hours ago';
                }
            }
            if (!init) {
                active = parseInt($('.active-user').attr('data-id'));
                userList.userColumnDiv.find(messageView.userList).remove();
                init = true;
            }
            html += `<li class="py-4 px-2 user-list" data-index="${$.trim(index)}" data-id="${$.trim(value.id)}">
            <a class="d-table d-flex align-items-center position-relative" href="#">
                <img class="d-table-cell rounded-circle user-image" src="${value.img}" />
                <div class="d-table-cell  align-top user-details">
                    <p class="m-0 name">${value.user}</p>
                    <span class="time position-absolute">${dateToShow} </span>
                    <p class="m-0">${value['messages'].length  ? value['messages'][value['messages'].length-1].text: ''}</p>
                </div>
            </a>
        </li>`;
        });
        userList.userColumnDiv.find('ul').append(html);
        $("li[data-id='" + active + "']").addClass('active-user');
        !active && $("li.user-list").eq(0).addClass('active-user');
    },
    displayUserMessage: function (user = 0) {
        let html = "";
        let messageList1 =[];
        $.each(userData, (index, value) => {
            messageList1 = value['messages'];
            if (index === user) {
                let localMessage = JSON.parse(localStorage.getItem('messageList'));
                $.each(localMessage, function (localIndex, localValue) {
                    if (user == localValue.createdBy) {
                        messageList1.push(localValue);
                    }
                });
            }
            index === user && $.each(messageList1, (index1, value1) => {
                let dateToShow = '';
                if (value['messages'].length) {
                    let fullDate = new Date(value['messages'][value['messages'].length - 1].created);
                    let current = new Date();
                    let dateDiff = Math.abs(current.getTime() - fullDate.getTime())
                    dateToShow = Math.ceil(dateDiff / (1000 * 3600 * 24)) + ' days ago';
                    if (dateToShow < 1) {
                        dateToShow = Math.ceil(dateDiff / (1000 * 3600)) + ' hours ago';
                    }
                }
                if (parseInt(value.id) === value1.createdBy) {
                    html += `<div class="my-message"><img src="${value.img}" class="rounded-circle user-image align-baseline" />
                    <div class="d-inline-block"><div class="message-div position-relative">${value1.text}</div><span class="text-right">${dateToShow}</span></div>           
            </div>`;
                } else {
                    html += `<div class="recieved-message text-right">
                    <div class="d-inline-block"><div class="message-div position-relative">${value1.text}</div><span>${dateToShow}</span></div>
                    <img src="${value.img}" class="rounded-circle user-image align-baseline" />
                </div>`;
                }
            });
        });
        if (html.length != 0) {
            $('.message-area').html(html);
        } else {
            $('.message-area').html('<p class="no-conversation">No Conversation made till now...</p>')
        }
    }
};
userListModule.init();
var messageInsert, messageInsertModule = {
    settings: {
        insertMessage: $('.message-input'),
        sendButton: $(".send-button")
    },
    init: function (option) {
        messageInsert = $.extend(this.settings, option);
        messageInsert.sendButton.on('click', this.sendMessage);
    },
    sendMessage: function (e) {
        var html = '';
        var date = new Date()
        if ($.trim($('.message-input').val()).length != 0) {
            var message = {
                "id": 0,
                "text": $('.message-input').val(),
                "created": date.toUTCString() ,
                "createdBy": $('.user-list.active-user').attr('data-index')
            };
            var messageList;
            messageList = JSON.parse(localStorage.getItem('messageList'));
            if (messageList == null) {
                messageList = [];
            }
            messageList.push(message);
            $(".no-conversation").remove();
            localStorage.setItem('messageList', JSON.stringify(messageList));
            var image = $('.user-list.active-user').find('.user-image').attr('src');
            html = `<div class="recieved-message text-right">
                    <div class="d-inline-block"><div class="message-div position-relative">${$('.message-input').val()}</div><span>now</span></div>
                    <img src="${image}" class="rounded-circle user-image align-baseline" />
                </div>`;
            $('.message-area').append(html);
            $('.message-input').val("");
        }
        e.preventDefault();
    }
}
messageInsertModule.init();