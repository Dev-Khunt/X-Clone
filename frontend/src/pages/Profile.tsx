import { FormEvent, useEffect, useState } from "react";
import api from "../services/api";
import { CommentWithTweet, Profile as ProfileType, StoredUser, Tweet } from "../types";
import { Header } from "../components/layout/Header";
import { Modal } from "../components/ui/Modal";
import { EmptyState } from "../components/ui/EmptyState";
import { TweetCard } from "../components/tweet/TweetCard";
import { ProfileCommentCard } from "../components/tweet/ProfileCommentCard";
import { useAuth } from "../context/AuthContext";
import { avatar } from "../utils/format";
import { COUNTRIES } from "../utils/constants";
import { navigate } from "../utils/navigation";

type Tab = "posts" | "comments" | "likes";

export function Profile({ username }: { username: string }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [tab, setTab] = useState<Tab>("posts");
  const [items, setItems] = useState<Array<Tweet | CommentWithTweet>>([]);
  const [followers, setFollowers] = useState<StoredUser[]>([]);
  const [following, setFollowing] = useState<StoredUser[]>([]);
  // Separate list: people the LOGGED-IN user follows (used for isFollowing check)
  const [myFollowing, setMyFollowing] = useState<StoredUser[]>([]);
  const [modal, setModal] = useState<"followers" | "following" | "edit" | null>(null);

  const isOwnProfile = user?.username === username;

  // ✅ Fixed: checks if the logged-in user follows this profile,
  // not whether the profile user follows someone else
  const isFollowing = isOwnProfile
    ? false
    : myFollowing.some((item) => item.user_id === profile?.user_id);

  async function loadProfile() {
    const { data: nextProfile } = await api.get<ProfileType>(`/users/${username}`);
    setProfile(nextProfile);

    const [followersRes, followingRes] = await Promise.all([
      api.get<StoredUser[]>(`/follows/${nextProfile.user_id}/followers`),
      api.get<StoredUser[]>(`/follows/${nextProfile.user_id}/following`),
    ]);
    setFollowers(followersRes.data);
    setFollowing(followingRes.data);

    // Fetch the logged-in user's own following list to correctly determine isFollowing
    if (user?.user_id && user.user_id !== nextProfile.user_id) {
      const { data: myList } = await api.get<StoredUser[]>(`/follows/${user.user_id}/following`);
      setMyFollowing(myList);
    }
  }

  async function loadTab() {
    const endpoint = tab === "posts" ? "tweets" : tab;
    const { data } = await api.get<Array<Tweet | CommentWithTweet>>(`/users/${username}/${endpoint}`);
    setItems(data);
  }

  async function toggleFollow() {
    if (!profile) return;
    // Optimistic follow state
    const wasFollowing = isFollowing;
    if (wasFollowing) {
      setMyFollowing((prev) => prev.filter((u) => u.user_id !== profile.user_id));
      setFollowers((prev) => prev.filter((u) => u.user_id !== user?.user_id));
    } else {
      if (user) {
        setMyFollowing((prev) => [...prev, { user_id: profile.user_id, username: profile.username, display_name: profile.display_name, profile_image: profile.profile_image }]);
        setFollowers((prev) => [...prev, { user_id: user.user_id, username: user.username, display_name: user.display_name, profile_image: user.profile_image }]);
      }
    }
    try {
      if (wasFollowing) {
        await api.delete(`/follows/${profile.user_id}`);
      } else {
        await api.post(`/follows/${profile.user_id}`);
      }
    } catch {
      // Rollback on failure
      loadProfile();
    }
  }

  useEffect(() => { loadProfile().catch(console.error); }, [username]);
  useEffect(() => { loadTab().catch(console.error); }, [username, tab]);

  return (
    <>
      <Header title={profile?.display_name || "Profile"} />
      <section className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="h-48 bg-zinc-200 bg-cover bg-center dark:bg-zinc-800" style={{ backgroundImage: profile?.cover_photo ? `url(${profile.cover_photo})` : undefined }} />
        <div className="px-4 pb-4">
          <img className="-mt-16 h-32 w-32 rounded-full border-4 border-white object-cover dark:border-black" src={avatar(profile)} alt="" />
          <div className="-mt-12 flex justify-end">
            {isOwnProfile ? (
              <button className="rounded-full border border-zinc-300 px-4 py-2 font-bold dark:border-zinc-700" onClick={() => setModal("edit")} type="button">Edit profile</button>
            ) : (
              <button
                className={`rounded-full px-4 py-2 font-bold transition-colors ${
                  isFollowing
                    ? "border border-zinc-300 text-zinc-700 hover:border-red-300 hover:text-red-500 dark:border-zinc-700 dark:text-zinc-300"
                    : "bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
                }`}
                onClick={toggleFollow}
                type="button"
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            )}
          </div>
          <h2 className="mt-4 text-2xl font-bold">{profile?.display_name}</h2>
          <p className="text-zinc-500">@{profile?.username}</p>
          {profile?.bio && <p className="mt-3">{profile.bio}</p>}
          <p className="mt-2 text-sm text-zinc-500">{profile?.country} {profile?.created_at && `Joined ${new Date(profile.created_at).toLocaleDateString()}`}</p>
          <div className="mt-3 flex gap-5 text-sm">
            <button onClick={() => setModal("following")} type="button"><b>{following.length}</b> <span className="text-zinc-500">Following</span></button>
            <button onClick={() => setModal("followers")} type="button"><b>{followers.length}</b> <span className="text-zinc-500">Followers</span></button>
          </div>
        </div>
        <div className="grid grid-cols-3">
          {(["posts", "comments", "likes"] as Tab[]).map((name) => (
            <button
              className={`border-b-2 p-4 font-bold capitalize ${tab === name ? "border-sky-500 text-zinc-950 dark:text-white" : "border-transparent text-zinc-500"}`}
              key={name}
              onClick={() => setTab(name)}
              type="button"
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      {items.length === 0 && <EmptyState text="Nothing here yet" />}

      {tab === "comments"
        ? (items as CommentWithTweet[]).map((item) => (
            <ProfileCommentCard key={item.comment_id} comment={item} />
          ))
        : (items as Tweet[]).map((item) => (
            <TweetCard
              key={`${item.type}-${item.tweet_id}-${item.created_at}`}
              tweet={item}
              onChanged={loadTab}
            />
          ))
      }

      {modal === "followers" && <FollowList title="Followers" users={followers} onClose={() => setModal(null)} />}
      {modal === "following" && <FollowList title="Following" users={following} onClose={() => setModal(null)} />}
      {modal === "edit" && profile && <EditProfile profile={profile} onClose={() => setModal(null)} refresh={loadProfile} />}
    </>
  );
}

function FollowList({ title, users, onClose }: { title: string; users: StoredUser[]; onClose: () => void }) {
  return (
    <Modal title={title} onClose={onClose}>
      {users.length === 0 && <EmptyState text="Nothing here yet" />}
      {users.map((u) => (
        <button
          className="flex w-full items-center gap-3 border-b border-zinc-100 px-4 py-3 text-left hover:bg-zinc-50 dark:border-zinc-900 dark:hover:bg-zinc-950"
          key={u.username}
          onClick={() => { onClose(); navigate(`/api/users/${u.username}`); }}
          type="button"
        >
          <img className="h-10 w-10 rounded-full object-cover" src={avatar(u)} alt="" />
          <span className="grid">
            <b>{u.display_name}</b>
            <small className="text-zinc-500">@{u.username}</small>
          </span>
        </button>
      ))}
    </Modal>
  );
}

function EditProfile({ profile, onClose, refresh }: { profile: ProfileType; onClose: () => void; refresh: () => void }) {
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await api.put(`/users/${profile.user_id}`, {
      bio: form.get("bio"),
      country: form.get("country"),
      dob: form.get("dob"),
    });

    const profileImage = form.get("profileImage") as File;
    const coverImage = form.get("coverImage") as File;
    if (profileImage?.size) {
      const profileData = new FormData();
      profileData.append("profileImage", profileImage);
      await api.post(`/users/${profile.user_id}/profile-image`, profileData);
    }
    if (coverImage?.size) {
      const coverData = new FormData();
      coverData.append("coverImage", coverImage);
      await api.post(`/users/${profile.user_id}/cover-image`, coverData);
    }

    await refresh();
    onClose();
  }

  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form className="grid gap-4 p-4" onSubmit={submit}>
        <label className="grid gap-2 text-sm text-zinc-500">Profile image<input name="profileImage" type="file" accept="image/*" /></label>
        <label className="grid gap-2 text-sm text-zinc-500">Cover image<input name="coverImage" type="file" accept="image/*" /></label>
        <label className="grid gap-2 text-sm text-zinc-500">Bio<textarea className="rounded-lg border border-zinc-300 bg-transparent p-3 text-zinc-950 outline-none dark:border-zinc-700 dark:text-white" name="bio" defaultValue={profile.bio || ""} /></label>
        <label className="grid gap-2 text-sm text-zinc-500">Country<select className="rounded-lg border border-zinc-300 bg-transparent p-3 text-zinc-950 outline-none dark:border-zinc-700 dark:text-white" name="country" defaultValue={profile.country || ""}>{COUNTRIES.map(([value, name]) => <option key={value} value={value}>{name}</option>)}</select></label>
        <label className="grid gap-2 text-sm text-zinc-500">Date of birth<input className="rounded-lg border border-zinc-300 bg-transparent p-3 text-zinc-950 outline-none dark:border-zinc-700 dark:text-white" name="dob" type="date" defaultValue={profile.dob?.slice(0, 10) || ""} /></label>
        <button className="rounded-full bg-sky-500 px-5 py-3 font-bold text-white hover:bg-sky-600">Save changes</button>
      </form>
    </Modal>
  );
}
