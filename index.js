"use strict";

// DOM variables
const container = document.querySelector(".searchContainer");
const searchUserInput = document.querySelector(".searchUser");
const profile = document.querySelector(".profile");

class API {
  clientId = "2278f25e6e2ecf48544f";
  clientSecret = "9928f50c025c19e77461013ae1d92d719150b421";
  
  async getUser(userName) {
    const response = await fetch(`https://api.github.com/users/${userName}`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`
      }
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message);      
    }
    return data;
  }

  async getRepos(userName) {
    const response = await fetch(`https://api.github.com/users/${userName}/repos?per_page=5`, {
      method: "GET",
      headers: {
        Authorization: `Basic ${btoa(this.clientId + ":" + this.clientSecret)}`,
      },
    });
    const reposData = await response.json();
    return reposData;    
  }
}

class UI {
showProfile(user, repos) {
  const memberDate = new Date(user.created_at);
  const formattedMemberDate = memberDate.toISOString().split('T')[0];
  profile.innerHTML = `
  <div class="card card-body mb-3">
      <div class="row">
        <div class="col-md-3">
          <img class="img-fluid mb-2" src="${user.avatar_url}">
          <a href="${user.html_url}" target="_blank" class="btn btn-primary btn-block mb-4">View Profile</a>
        </div>
        <div class="col-md-9">
          <span class="badge badge-primary">Public Repos: ${user.public_repos}</span>
          <span class="badge badge-secondary">Public Gists: ${user.public_gists}</span>
          <span class="badge badge-success">Followers: ${user.followers}</span>
          <span class="badge badge-info">Following: ${user.following}</span>
          <br><br>
          <ul class="list-group">
            <li class="list-group-item">Company: ${user.company}</li>
            <li class="list-group-item">Website/Blog: ${user.blog}</li>
            <li class="list-group-item">Location: ${user.location}</li>
            <li class="list-group-item">Member Since: ${formattedMemberDate}</li>
          </ul>
        </div>
      </div>
    </div>
    <h3 class="page-heading mb-3">Latest Repos</h3>
    <div class="repos">
    <table class="reposTable table table-dark table-bordered">
        <thead>
          <tr>
            <th class="col-md-1">Name</th>
            <th class="col-md-1">Last changes</th>              
          </tr>
        </thead>
        <tbody>
        </tbody>
      </table>        
    </div>
  `;    

  const reposTable = document.querySelector('.reposTable');
  const reposDiv = document.querySelector('.repos');

  repos.forEach(repo => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const updatesCell = document.createElement('td');
    const nameLink = document.createElement('a');

    const repoDate = new Date(repo.updated_at);
    const formattedRepoDate = repoDate.toISOString().split('T')[0];

    nameLink.href = repo.html_url;
    nameLink.textContent = repo.name;
    updatesCell.textContent = formattedRepoDate;
    nameCell.appendChild(nameLink);
    row.appendChild(nameCell);
    row.appendChild(updatesCell);          
    reposTable.appendChild(row);
  });

  if (repos.length === 0) {      
    reposTable.style.display = 'none';      
    const noPublicRepoMessage = document.createElement('p');
    noPublicRepoMessage.textContent = 'No public repositories';
    reposDiv.appendChild(noPublicRepoMessage);
  }
}  

clearProfile() {
  profile.innerHTML = "";
}

showAlert(message, type, timeout = 5000) {
  this.clearAlert();

  const div = document.createElement("div");
  div.className = `alert ${type}`;
  div.appendChild(document.createTextNode(message));

  const search = document.querySelector(".search");
  container.insertBefore(div, search);

  setTimeout(() => {
    this.clearAlert();
  }, timeout);
}

clearAlert() {
  const alertBlock = document.querySelector(".alert");
  if (alertBlock) {
    alertBlock.remove();
  }
}
}

const handleInput = async (event) => {
const ui = new UI();
const userText = event.target.value.trim();

if (!userText) {
  ui.clearProfile();
  return;
}

try {
  const api = new API();
  const user = await api.getUser(userText);
  const repos = await api.getRepos(userText);
  ui.clearAlert();

  ui.showProfile(user, repos);
} catch (error) {
  ui.showAlert(error.message, "alert-danger");
  ui.clearProfile();
}
};

const debounce = (func, delay) => {
let timerId;

return (...args) => {
  clearTimeout(timerId);

  timerId = setTimeout(() => {
    func.apply(this, args);
  }, delay);
};
};

// Event listeners
searchUserInput.addEventListener("input", debounce(handleInput, 1000));
