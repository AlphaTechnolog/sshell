// Supplies spotify music change notifications.
import Mpris from "gi://AstalMpris";
import Notifd from "gi://AstalNotifd"

const spotify = Mpris.Player.new("spotify");

spotify.connect("notify::metadata", () => {
  if (!spotify.get_available()) return;
  const notification = Notifd.Notification.new();
  notification.set_summary(spotify.get_title());
  notification.set_body(spotify.get_artist());
  notification.set_image(spotify.get_cover_art());
  notification.set_app_name("Spotify");
  Notifd.send_notification(notification, null);
});
