function loadSidebar() {
  const user = JSON.parse(localStorage.getItem("user"));

  const sidebar = document.getElementById("sidebar");

  sidebar.innerHTML = `
    <div class="w-[275px] h-screen sticky top-0 px-4 flex flex-col justify-between">

      <!-- TOP -->
      <div>
        <h1 class="text-3xl font-bold mb-6 cursor-pointer"
            onclick="goHome()">X</h1>

        <nav class="space-y-4 text-lg">

          <div onclick="goHome()"
               class="hover:bg-[#181818] p-3 rounded-full cursor-pointer">
            🏠 Home
          </div>

          <div class="hover:bg-[#181818] p-3 rounded-full cursor-pointer">
            🔔 Notifications
          </div>

          <div onclick="goProfile()"
               class="hover:bg-[#181818] p-3 rounded-full cursor-pointer">
            👤 Profile
          </div>

        </nav>
      </div>


      <!-- BOTTOM USER -->
      <div class="mb-4">

        <div class="flex items-center justify-between hover:bg-[#181818] p-3 rounded-full cursor-pointer">

          <!-- USER INFO -->
          <div class="flex items-center gap-3" onclick="goProfile()">

            <img src="${user?.profile_image || 'https://ui-avatars.com/api/?name=' + user?.username}"
                 class="w-10 h-10 rounded-full"/>

            <div>
              <p class="font-bold text-sm">${user?.display_name || "User"}</p>
              <p class="text-gray-500 text-sm">@${user?.username || ""}</p>
            </div>

          </div>

          <!-- LOGOUT -->
          <button onclick="logout()"
                  class="text-red-500 text-sm hover:underline">
            Logout
          </button>

        </div>

      </div>

    </div>
  `;
}


function goHome() {
  window.location.href = "/home";
}

function goProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user) return;

  window.location.href = `/api/users/${user.username}`;
}

function logout() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("user");

  window.location.href = "/auth/signin";
}