//on ready??
//declare global variables used throughout app
let token = localStorage.getItem('token')
  ? localStorage.getItem('token')
  : undefined;
let loggedInUserName = localStorage.getItem('userName')
  ? localStorage.getItem('userName')
  : undefined;
let $stories = $('#stories');
let userData;

//make story a user favorite (or not) when user clicks star
$('#stories').on('click', 'span', e => {
  $(e.target).toggleClass('fas');
  let storyID = $(e.target)
    .next()
    .attr('data-id');
  console.log(storyID);
  favoriteThisStory(storyID);
  populateUserData();
});

// populate the all stories list
function populate() {
  $.getJSON(
    'https://hack-or-snooze.herokuapp.com/stories?skip=0&limit=10'
  ).then(res => {
    $stories.empty();
    res.data.forEach(data => {
      $stories.append(
        `<li><span class='far fa-star'></span><a data-id=${
          data.storyId
        } href='${data.url}'> ${data.title}</a></li>`
      );
    });
  });
}
populate();

// create new account
$('#signUpButton').on('click', function(e) {
  e.preventDefault();
  let name = $('#name').val();
  let username = $('#username').val();
  let password = $('#password').val();

  $.post('https://hack-or-snooze.herokuapp.com/users', {
    data: { name: name, username: username, password: password }
  })
    .then(data => {
      console.log('Sign up successful!');
    })
    .catch(e => {
      console.log('There was an error!');
    });
  $('#signUpForm')[0].reset();
  // to do: log error in HTML
});

// user sign in
$('#logInButton').on('click', function(e) {
  e.preventDefault();
  let username = $('#logInusername').val();
  let password = $('#logInpassword').val();

  $.post('https://hack-or-snooze.herokuapp.com/auth', {
    data: { username: username, password: password }
  })
    .then(res => {
      localStorage.setItem('token', res.data.token);
      token = localStorage.getItem('token');
      localStorage.setItem('userName', username);
      loggedInUserName = localStorage.getItem('userName');
      populateUserData();
      console.log('Log in successful!');
      $('#logInForm')[0].reset();
      $('#logInOrCreateUser').hide('fast');
      $('#favoriteNav').toggle();
      $('#profileNav').toggle();
      $('#loginNav').toggle();
      $('#submit').show();
      $('#logOutNav').show();
    })
    .catch(e => {
      console.log('There was an error!');
    });

  // to do: log error in HTML
});

//create new story
$('#submitStory').click(function(e) {
  e.preventDefault();
  let author = $('#author').val();
  let title = $('#title').val();
  let url = $('#url').val();

  $.ajax('https://hack-or-snooze.herokuapp.com/stories', {
    type: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    data: {
      data: {
        username: localStorage.getItem('userName'),
        title: title,
        url: url,
        author: author
      }
    }
  })
    .then(res => {
      $('#storyForm').toggle('fast');
      $('#storyForm')[0].reset();
      console.log('success!');
      populate();
    })
    .catch(err => console.log(`oopsies${JSON.stringify(err)}`));
});

//make favorite show up in API
function favoriteThisStory(storyID) {
  $.ajax(
    `https://hack-or-snooze.herokuapp.com/users/${loggedInUserName}/favorites/${storyID}`,
    {
      type: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      data: {
        data: {
          username: loggedInUserName
        }
      }
    }
  )
    .then(res => console.log('SUCCESS'))
    .catch(err => console.log('FAIL'));
}

// Populate #userProfile container with user information once logged in
function populateUserData() {
  $.ajax(`https://hack-or-snooze.herokuapp.com/users/${loggedInUserName}`, {
    type: 'GET',
    headers: { Authorization: `Bearer ${token}` }
  }).then(res => {
    userData = res.data;
    $('#profileName').text(`Name: ${userData.name}`);
    $('#profileUsername').text(`Username: ${userData.username}`);
    let $profileFavorites = $('#profileFavorites');
    let $profileStories = $('#profileStories');
    $profileFavorites.empty();
    $profileFavorites.text('Favorites');
    $profileStories.empty();
    $profileStories.text('Stories');

    userData.favorites.forEach(data => {
      $profileFavorites.append(
        `<li><span class='fas fa-times'></span><a data-id=${
          data.storyId
        } href='${data.url}'> ${data.title}</a></li>`
      );
    });
    userData.stories.forEach(data => {
      $profileStories.append(
        `<li><span class='fas fa-times'></span><a data-id=${
          data.storyId
        } href='${data.url}'> ${data.title}</a></li>`
      );
    });

    //user can delete a favorite story from favorites
    $('#profileFavorites').on('click', '.fa-times', function(e) {
      let idToDelete = $(e.target)
        .next()
        .attr('data-id');
      $.ajax(
        `https://hack-or-snooze.herokuapp.com/users/${loggedInUserName}/favorites/${idToDelete}`,
        {
          type: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
          data: {
            data: {
              username: loggedInUserName
            }
          }
        }
      )
        .then(res => populateUserData())
        .catch(e => console.log('fail'));
    });

    //user can delete a story they have previously added
    $('#profileStories').on('click', '.fa-times', function(e) {
      let idToDelete = $(e.target)
        .next()
        .attr('data-id');
      $.ajax(`https://hack-or-snooze.herokuapp.com/stories/${idToDelete}`, {
        type: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        data: {
          data: {
            username: loggedInUserName
          }
        }
      })
        .then(res => populateUserData())
        .catch(e => console.log('fail'));
    });
  });
}

//story submission form shows when user clicks submit
$('#submit').click(function() {
  $('#storyForm').toggle('fast');
});

//log in form shows when user clicks login
$('#loginNav').click(function() {
  $('#logInOrCreateUser').toggle('fast');
});

//create new user and regular log in forms toggle
$('#createNewUser').click(function() {
  $('#logInForm').toggle('fast');
  $('#signUpForm').toggle('fast');
});

//create new user and regular log in forms toggle
$('#alreadyUser').click(function() {
  $('#logInForm').toggle('fast');
  $('#signUpForm').toggle('fast');
});

//toggle correct from profile back to previous stories depending on if previous view was favorite stories or all stories
$('#profileNav').click(function() {
  $('#userProfile').toggle('fast');
  $('#storyContainer').toggle('fast');
  if ($('#profileNav').text() === 'Profile') {
    $('#favoriteNav').toggle();
    $('#profileNav').text('Back');
  } else {
    $('#profileNav').text('Profile');
    $('#favoriteNav').toggle();
  }
});

//show favorite stories only
$('#favoriteNav').click(function() {
  $('#stories').toggle('fast');
  $('#favList').empty();

  if ($('#favoriteNav').text() === 'Favorites') {
    $('#favoriteNav').text('All Stories');
    $.ajax(`https://hack-or-snooze.herokuapp.com/users/${loggedInUserName}`, {
      type: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res =>
        res.data.favorites.forEach(data => {
          $('#favList').append(
            `<li><span class='fas  fa-star'></span><a data-id=${
              data.storyId
            } href='${data.url}'> ${data.title}</a></li>`
          );
        })
      )
      .catch(err => console.log('FAIL'));
  } else {
    $('#favoriteNav').text('Favorites');
  }
});

//user can logout
$('#logOutNav').click(function() {
  localStorage.clear();
  window.location.reload();
  alert('Goodbye! Sign in again soon!');
});
